import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BrowserbaseLoader } from "@langchain/community/document_loaders/web/browserbase";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { traceable } from "langsmith/traceable";
import { Client } from "langsmith";
import { evaluate, type EvaluationResult } from "langsmith/evaluation";
import { z } from "zod";




/******************************** PDF LOADER *******************************************************
 *
 * https://docs.smith.langchain.com/evaluation/tutorials/rag#reference-code
 *
 ***********************************************************************************************/

// List of URLs to load documents from
const urls = [
    "https://www.irs.gov/publications/p17",
    "https://www.law.cornell.edu/uscode/text/26/1402",
  ];
const loader = new BrowserbaseLoader(urls, {
    textContent: true,
});
const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, chunkOverlap: 200
});
const allSplits = await splitter.splitDocuments(docs);

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large"
});

const vectorStore = new MemoryVectorStore(embeddings);  

// Index chunks
await vectorStore.addDocuments(allSplits)   

const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo-0125",
  temperature: 1,
})

// Add decorator so this function is traced in LangSmith
const ragBot = traceable(
    async (question: string) => {
        // LangChain retriever will be automatically traced
        const retrievedDocs = await vectorStore.similaritySearch(question);
        const docsContent = retrievedDocs.map((doc) => doc.pageContent).join("");
        
        const instructions = `You are a helpful assistant who is good at analyzing source information and answering questions.
        Use the following source documents to answer the user's questions.
        If you don't know the answer, just say that you don't know.
        Use three sentences maximum and keep the answer concise.

        Documents:
        ${docsContent}`
        
        const aiMsg = await llm.invoke([
            {
                role: "system",
                content: instructions
            },
            {
                role: "user",
                content: question
            }
        ])
        
        return {"answer": aiMsg.content, "documents": retrievedDocs}
    }
)

const client = new Client();

// Define the examples for the dataset
const examples = [
    [
        "I only had part-time income this year and made less than the standard deduction amount. Do I still need to file a tax return?",
        "It depends on your filing status, age, and other factors such as self-employment earnings or if you owe certain taxes. \
        Generally, if your gross income is below a certain threshold, you might not be required to file. \
        However, you may still want to file if you’re eligible for refundable credits (like the Earned Income Credit) or \
        if you had taxes withheld that you’d like refunded. Publication 17 provides charts that can help you determine if you must file."
    ],
    [
        "I got married this year. Which filing status should I choose—Married Filing Jointly or Married Filing Separately?",
        "Many married couples benefit from filing jointly because it often results in a lower total tax due. \
        However, in certain cases—such as when one spouse has high medical expenses or other deductible costs—Married Filing Separately may be beneficial. \
        Publication 17 offers guidance and worksheets to compare outcomes. It’s often wise to calculate both ways or consult a tax professional."
    ],
    [
        "How do I know if I should take the standard deduction or itemize my deductions?",
        "If your total allowable itemized expenses (e.g., mortgage interest, state and local taxes, charitable contributions, and certain medical expenses) \
        exceed your standard deduction, itemizing may lower your taxable income more. If your itemized deductions are below the standard deduction, \
        you generally benefit more by taking the standard deduction. Publication 17 provides details about what expenses can be itemized."
    ],
    [
        "What is my Adjusted Gross Income (AGI) and why is it important?",
        "AGI is your total income (wages, interest, dividends, business income, etc.) minus certain adjustments (like IRA contributions, \
        student loan interest, and other “above-the-line” deductions). Your AGI is important because it influences which credits and deductions \
        you can claim and how much tax you ultimately owe. You calculate your AGI before claiming either the standard deduction or your itemized deductions."
    ],
    [
        "I have a young child and pay for daycare so I can work. Can I get a credit for those expenses?",
        "Yes. The **Child and Dependent Care Credit** can help offset some of the costs for child or dependent care. \
        You must meet certain criteria—such as having earned income and paying the care expenses to allow you to work or look for work. \
        Publication 17 explains how to figure the credit, the income limits, and the documentation required."
    ],
    [
        "Are tips and overtime pay taxable?",
        "Yes, both tips and overtime pay are taxable income and are subject to federal income tax, Social Security, and Medicare taxes. If you receive \
        $20 or more in tips a month from one employer, report all your tips to that employer, who will include them on your Form W‑2. \
        Overtime pay is simply additional wages and is taxed the same way as regular pay."
    ],
    [
        "Who can I claim as dependents on my tax return?",
        "Generally, you can claim someone as a dependent if they are your qualifying child or qualifying relative who meets specific IRS criteria related to relationship,\
        age (for children), residency, financial support (you must provide more than half of their support), and certain income limits. \
        They must also have a valid taxpayer identification number (such as a Social Security Number) by the due date of your return."
    ],
    [
        "What “above-the-line” deductions can I take before arriving at my AGI?",
        "Some common “above-the-line” deductions include contributions to a Traditional IRA, student loan interest, \
        self-employment health insurance premiums, and educator expenses (if you’re a qualified teacher). \
        Claiming these deductions reduces your taxable income and may help you qualify for other benefits. \
        Check Publication 17 for the full list and eligibility conditions."
    ],
    [
        "I started a small side business this year. Do I have to pay self-employment tax?",
        " If your net earnings from self-employment are \$400 or more, you’ll likely need to file a Schedule SE to calculate and pay self-employment tax \
        (Social Security and Medicare taxes for self-employed individuals). You’ll include this along with your personal income tax return (Form 1040). \
        Publication 17 offers guidance on self-employment tax rules, deductions for small businesses, and recordkeeping."
    ],
    [
        "I’m a single parent with two children, and I earned about $30,000 this year from my job. \
        I’ve heard about the Earned Income Tax Credit (EITC) but am unsure if I qualify. \
        What are the main requirements to claim the EITC?",
        "The EITC is designed for workers who earn low to moderate incomes, especially those who have qualifying children. \
        To qualify, you generally need to have earned income (such as wages or self-employment income), a valid Social Security Number \
        for yourself (and each qualifying child), and meet certain income limits, which vary by filing status and number of children. \
        You cannot file your return as “Married Filing Separately,” and your investment income must be below a specific threshold. \
        If you meet the age (at least 25 if you have no children) and residency requirements, and your total or adjusted gross income is within the limits \
        set for your situation, you could receive a refundable credit. Because you have two children and your earnings are around $30,000, \
        you may very well qualify, but check the exact thresholds in the IRS EITC tables or consult a tax professional to be sure."
    ],
    [
        "How can I contact the IRS?",
        "You can contact the IRS by phone at 1-800-829-1040 for individual tax help (Monday–Friday, 7 a.m. to 7 p.m. local time). \
        For general information, forms, and online tools, visit IRS.gov. You can also schedule an appointment at a local Taxpayer Assistance Center \
        by calling 844-545-5640. Hearing-impaired individuals may use the TTY/TDD number 1-800-829-4059."
    ]
]

export const initDataset = () => {
const [inputs, outputs] = examples.reduce<
[Array<{ input: string }>, Array<{ outputs: string }>]
>(
    ([inputs, outputs], item) => [
    [...inputs, { input: item[0] }],
    [...outputs, { outputs: item[1] }],
    ],
    [[], []]
);

const datasetName = "Individual Income Tax 2024";
const dataset = await client.createDataset(datasetName);
await client.createExamples({ inputs, outputs, datasetId: dataset.id })
};


/******************************** CORRECTNESS *******************************************************/
// Grade prompt
const correctnessInstructions = `
You are an expert taxation instructor grading a quiz. You will be given:
1. A QUESTION
2. A GROUND TRUTH** (correct) answer  
3. A STUDENT ANSWER 

Use the following criteria to grade the correctness of the student’s answer:
1. **Factual Accuracy**: Grade the student’s answer **exclusively** based on how accurately it reflects the ground truth answer.  
2. **Consistency**: Ensure the student’s answer does **not** include any statements that conflict with the ground truth.  
3. **Additional Information**: It is acceptable for the student’s answer to contain **more details or explanations** than the ground truth, provided everything stated remains factually correct and **does not contradict** the ground truth.

After reviewing the student’s answer:
- **Correctness**: Assign a value of **True** if the student’s answer meets all of the above criteria, or **False** if it does not.
Finally, **explain your reasoning step-by-step** to show how you arrived at your judgment. Do **not** simply provide the correct answer; instead, focus on verifying whether the student’s statements align with the ground truth.`

const graderLLM = new ChatOpenAI({
  model: "gpt-3.5-turbo-0125",
  temperature: 0,
}).withStructuredOutput(
  z
    .object({
      explanation: z
        .string()
        .describe("Explain your reasoning for the score"),
      correct: z
        .boolean()
        .describe("True if the answer is correct, False otherwise.")
    })
    .describe("Correctness score for reference answer v.s. generated answer.")
);

export async function correctness({
  inputs,
  outputs,
  referenceOutputs,
}: {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  referenceOutputs?: Record<string, any>;
}): Promise<EvaluationResult> => {
  const answer = `QUESTION: ${inputs.question}
    GROUND TRUTH ANSWER: ${reference_outputs.answer}
    STUDENT ANSWER: ${outputs.answer}`
    
  // Run evaluator
  const grade = graderLLM.invoke([{role: "system", content: correctnessInstructions}, {role: "user", content: answer}])        
  return grade.score
};

/******************************** RELEVANCE *******************************************************/
// Grade prompt
const relevanceInstructions = `You are a teacher grading a quiz. 

You will be given a QUESTION and a STUDENT ANSWER. 

Here is the grade criteria to follow:
(1) Ensure the STUDENT ANSWER is concise and relevant to the QUESTION
(2) Ensure the STUDENT ANSWER helps to answer the QUESTION

Relevance:
A relevance value of True means that the student's answer meets all of the criteria.
A relevance value of False means that the student's answer does not meet all of the criteria.

Explain your reasoning in a step-by-step manner to ensure your reasoning and conclusion are correct. 

Avoid simply stating the correct answer at the outset.`

const relevanceLLM = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
}).withStructuredOutput(
  z
    .object({
      explanation: z
        .string()
        .describe("Explain your reasoning for the score"),
      relevant: z
        .boolean()
        .describe("Provide the score on whether the answer addresses the question")
    })
    .describe("Relevance score for gene")
);

export async function relevance({
  inputs,
  outputs,
}: {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}): Promise<EvaluationResult> => {
  const answer = `QUESTION: ${inputs.question}
STUDENT ANSWER: ${outputs.answer}`
    
  // Run evaluator
  const grade = relevanceLLM.invoke([{role: "system", content: relevanceInstructions}, {role: "user", content: answer}])        return grade.relevant
};

/******************************** TRUTHFULNESS *******************************************************/
// Grade prompt
const groundedInstructions = `You are a teacher grading a quiz. 

You will be given FACTS and a STUDENT ANSWER. 

Here is the grade criteria to follow:
(1) Ensure the STUDENT ANSWER is grounded in the FACTS. 
(2) Ensure the STUDENT ANSWER does not contain "hallucinated" information outside the scope of the FACTS.

Grounded:
A grounded value of True means that the student's answer meets all of the criteria.
A grounded value of False means that the student's answer does not meet all of the criteria.

Explain your reasoning in a step-by-step manner to ensure your reasoning and conclusion are correct. 

Avoid simply stating the correct answer at the outset.`

const groundedLLM = new ChatOpenAI({
  model: "gpt-3.5-turbo-0125",
  temperature: 0,
}).withStructuredOutput(
  z
    .object({
      explanation: z
        .string()
        .describe("Explain your reasoning for the score"),
      grounded: z
        .boolean()
        .describe("Provide the score on if the answer hallucinates from the documents")
    })
    .describe("Grounded score for the answer from the retrieved documents.")
);

export async function grounded({
  inputs,
  outputs,
}: {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}): Promise<EvaluationResult> => {
  const docString =  outputs.documents.map((doc) => doc.pageContent).join("
");
  const answer = `FACTS: ${docString}
    STUDENT ANSWER: ${outputs.answer}`
    
  // Run evaluator
  const grade = groundedLLM.invoke([{role: "system", content: groundedInstructions}, {role: "user", content: answer}])        return grade.grounded
};



/******************************** RETRIEVAL *******************************************************/

// Grade prompt
const retrievalRelevanceInstructions = `You are a teacher grading a quiz. 

You will be given a QUESTION and a set of FACTS provided by the student. 

Here is the grade criteria to follow:
(1) You goal is to identify FACTS that are completely unrelated to the QUESTION
(2) If the facts contain ANY keywords or semantic meaning related to the question, consider them relevant
(3) It is OK if the facts have SOME information that is unrelated to the question as long as (2) is met

Relevance:
A relevance value of True means that the FACTS contain ANY keywords or semantic meaning related to the QUESTION and are therefore relevant.
A relevance value of False means that the FACTS are completely unrelated to the QUESTION.

Explain your reasoning in a step-by-step manner to ensure your reasoning and conclusion are correct. 

Avoid simply stating the correct answer at the outset.`

const retrievalRelevanceLLM = new ChatOpenAI({
  model: "gpt-3.5-turbo-0125",
  temperature: 0,
}).withStructuredOutput(
  z
    .object({
      explanation: z
        .string()
        .describe("Explain your reasoning for the score"),
      relevant: z
        .boolean()
        .describe("True if the retrieved documents are relevant to the question, False otherwise")
    })
    .describe("Retrieval relevance score for the retrieved documents v.s. the question.")
);

export async function retrievalRelevance({
  inputs,
  outputs,
}: {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}): Promise<EvaluationResult> => {
  const docString =  outputs.documents.map((doc) => doc.pageContent).join("");
  const answer = `FACTS: ${docString}
    QUESTION: ${inputs.question}`
    
  // Run evaluator
  const grade = retrievalRelevanceLLM.invoke([{role: "system", content: retrievalRelevanceInstructions}, {role: "user", content: answer}])        return grade.relevant
};

const targetFunc = (input: Record<string, any>) => {
    return ragBot(inputs.question)
};

const experimentResults = await evaluate(targetFunc, {
    data: datasetName,
    evaluators: [correctness, groundedness, relevance, retrievalRelevance],
    experimentPrefix="rag-doc-relevance",
    metadata={version: "LCEL context, gpt-3.5-turbo-0125"},
});