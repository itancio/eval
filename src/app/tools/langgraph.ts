import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { Document } from "@langchain/core/documents";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { pull } from "langchain/hub";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { Annotation } from "@langchain/langgraph";
import { DocumentInterface } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
import { InMemoryStore } from "@langchain/core/stores";
import { pcVectorStore } from "./pinecone";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

/******************************** PDF LOADER *******************************************************
 *
 * https://js.langchain.com/docs/integrations/document_loaders/web_loaders/pdf/
 *
 ***********************************************************************************************/

export async function loadWebPDF(url: string) {
  // Fetch the PDF from the URL
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
  }

  // Get the PDF as a Blob
  const pdfBlob = await response.blob();

  // Initialize the WebPDFLoader with the Blob
  const loader = new WebPDFLoader(pdfBlob, {
    parsedItemSeparator: "",
    splitPages: true, // Reduce excessive whitespaces
  });

  // Load the documents
  const docs = await loader.load();
  return docs;
}

/******************************** CORRECTIVE RAG *******************************************************
 *
 * https://langchain-ai.github.io/langgraphjs/tutorials/rag/langgraph_crag/#nodes-and-edges
 *
 ***********************************************************************************************/

export const getRetriever = () => {
  const byteStore = new InMemoryStore<Uint8Array>();
  const parentSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2500,
    chunkOverlap: 250,
  });
  const childSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  // With Relevance Score Threshold
  const childDocumentRetriever = ScoreThresholdRetriever.fromVectorStore(
    pcVectorStore,
    {
      minSimilarityScore: 0.78,
    }
  );

  //  Instantiate VectorStore or Retriever
  return new ParentDocumentRetriever({
    vectorstore: pcVectorStore,
    byteStore,
    childDocumentRetriever,
    parentSplitter: parentSplitter,
    childSplitter: childSplitter,
    // parent documents returned from this retriever and sent to LLM.
    // This is an upper-bound, and the final count may be lower than this.
    parentK: 5,
    childK: 20,
  });
};

const urls = [
  "https://www.irs.gov/publications/p17",
  "https://www.law.cornell.edu/uscode/text/26/1402",
];

const docs = await Promise.all(
  urls.map(url => new CheerioWebBaseLoader(url).load())
);
const docsList = docs.flat();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2500,
  chunkOverlap: 250,
});
const docSplits = await textSplitter.splitDocuments(docsList);

// Add to vectorDB
const vectorStore = await MemoryVectorStore.fromDocuments(
  docSplits,
  new OpenAIEmbeddings()
);
const retriever = vectorStore.asRetriever();

// Graph State Definition
export const GraphState = Annotation.Root({
  documents: Annotation<DocumentInterface[]>({
    reducer: (x, y) => y ?? x ?? [],
  }),
  question: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  generation: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
});

// Define the LLM once. We'll reuse it throughout the graph.
const model = new ChatOpenAI({
  model: "gpt-3.5-turbo-0125",
  temperature: 0,
});

/**
 * Retrieve documents
 *
 * @param {typeof GraphState.State} state The current state of the graph.
 * @param {RunnableConfig | undefined} config The configuration object for tracing.
 * @returns {Promise<Partial<typeof GraphState.State>>} The new state object.
 */
async function retrieve(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---RETRIEVE---");
  const startRetrievalTime = Date.now();

  const documents = await retriever
    .withConfig({ runName: "FetchRelevantDocuments" })
    .invoke(state.question);

  const endRetrievalTime = Date.now() - startRetrievalTime;
  const aveRetrievalTime = endRetrievalTime / documents.length;

  console.log("---CHECK RELEVANCE---");

  // pass the name & schema to `withStructuredOutput` which will force the model to call this tool.
  const llmWithTool = model.withStructuredOutput(
    z
      .object({
        score: z.enum(["yes", "no"]).describe("Relevance score 'yes' or 'no'"),
        explanation: z
          .string()
          .describe("explain briefly the reason why it's not relevant"),
      })
      .describe(
        "Grade the relevance of the retrieved documents to the question. Either 'yes' or 'no'."
      ),
    {
      name: "grade",
    }
  );

  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a grader assessing relevance of a retrieved document to a user question.
  Here is the retrieved document:

  {context}

  Here is the user question: {question}

  If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant.
  Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question.`
  );

  const chain = prompt.pipe(llmWithTool);

  // For every retrieved document, evaluate the results for retrieval relevance
  const gradedDocs: Array<DocumentInterface> = [];

  for await (const doc of documents) {
    const startGrade = Date.now();
    const grade = await chain.invoke({
      context: doc.pageContent,
      question: state.question,
    });

    console.log(`Grade for document":`, grade);
    gradedDocs.push(
      new Document({
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata, // Preserve existing metadata
          score: grade.score, // Add the score to metadata
          latency: aveRetrievalTime + (Date.now() - startGrade),
          explanation: grade.explanation, // Add the explanation to metadata
        },
      })
    );
  }
  // console.log("graded documents: ", gradedDocs);

  return {
    documents: gradedDocs,
  };
}

/**
 * Generate answer
 *
 * @param {typeof GraphState.State} state The current state of the graph.
 * @param {RunnableConfig | undefined} config The configuration object for tracing.
 * @returns {Promise<Partial<typeof GraphState.State>>} The new state object.
 */
async function generate(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---GENERATE---");

  const prompt = await ChatPromptTemplate.fromTemplate(
    `You are a helpful assistant who is good at analyzing source information and answering questions.
        Use the following source documents to answer the user's questions.
        If you don't know the answer, just say that you don't know.
        Documents:
        ${state.documents.map(doc => doc.pageContent).join("\n\n")}`
  );
  // Construct the RAG chain by piping the prompt, model, and output parser
  const ragChain = prompt.pipe(model).pipe(new StringOutputParser());

  const generation = await ragChain.invoke({
    context: formatDocumentsAsString(state.documents),
    question: state.question,
  });

  return {
    generation,
  };
}

/* Determines whether the retrieved documents are relevant to the question.
 *
 * @param {typeof GraphState.State} state The current state of the graph.
 * @param {RunnableConfig | undefined} config The configuration object for tracing.
 * @returns {Promise<Partial<typeof GraphState.State>>} The new state object.
 */
async function gradeDocuments(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---CHECK RELEVANCE---");

  // pass the name & schema to `withStructuredOutput` which will force the model to call this tool.
  const llmWithTool = model.withStructuredOutput(
    z
      .object({
        binaryScore: z
          .enum(["yes", "no"])
          .describe("Relevance score 'yes' or 'no'"),
      })
      .describe(
        "Grade the relevance of the retrieved documents to the question. Either 'yes' or 'no'."
      ),
    {
      name: "grade",
    }
  );

  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a grader assessing relevance of a retrieved document to a user question.
  Here is the retrieved document:

  {context}

  Here is the user question: {question}

  If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant.
  Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question.`
  );

  // Chain
  const chain = prompt.pipe(llmWithTool);

  const filteredDocs: Array<DocumentInterface> = [];
  for await (const doc of state.documents) {
    const grade = await chain.invoke({
      context: doc.pageContent,
      question: state.question,
    });
    if (grade.binaryScore === "yes") {
      console.log("---GRADE: DOCUMENT RELEVANT---");
      filteredDocs.push(doc);
    } else {
      console.log("---GRADE: DOCUMENT NOT RELEVANT---");
    }
  }

  return {
    documents: filteredDocs,
  };
}

/* Filter relevant documents
 *
 * @param {typeof GraphState.State} state The current state of the graph.
 * @param {RunnableConfig | undefined} config The configuration object for tracing.
 * @returns {Promise<Partial<typeof GraphState.State>>} The new state object.
 */
async function filterDocuments(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---FILTER RELEVANT DOCUMENTS---");

  const filteredDocs: Array<DocumentInterface> = [];
  for await (const doc of state.documents) {
    if (doc.metadata?.score === "yes") {
      console.log("---GRADE: DOCUMENT RELEVANT---");
      filteredDocs.push(doc);
    } else {
      console.log("---GRADE: DOCUMENT NOT RELEVANT---");
    }
  }

  return {
    documents: filteredDocs,
  };
}

/**
 * Transform the query to produce a better question.
 *
 * @param {typeof GraphState.State} state The current state of the graph.
 * @param {RunnableConfig | undefined} config The configuration object for tracing.
 * @returns {Promise<Partial<typeof GraphState.State>>} The new state object.
 */
async function transformQuery(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---TRANSFORM QUERY---");

  // Pull in the prompt
  const prompt = ChatPromptTemplate.fromTemplate(
    `You are generating a question that is well optimized for semantic search retrieval.
  Look at the input and try to reason about the underlying sematic intent / meaning.
  Here is the initial question:
  \n ------- \n
  {question} 
  \n ------- \n
  Formulate an improved question: `
  );

  // Prompt
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const betterQuestion = await chain.invoke({ question: state.question });

  return {
    question: betterQuestion,
  };
}

/**
 * Web search based on the re-phrased question using Tavily API.
 *
 * @param {typeof GraphState.State} state The current state of the graph.
 * @param {RunnableConfig | undefined} config The configuration object for tracing.
 * @returns {Promise<Partial<typeof GraphState.State>>} The new state object.
 */
async function webSearch(
  state: typeof GraphState.State
): Promise<Partial<typeof GraphState.State>> {
  console.log("---WEB SEARCH---");

  const tool = new TavilySearchResults({ apiKey: process.env.TAVILY_API_KEY });
  const docs = await tool.invoke({ query: state.question });
  const webResults = new Document({ pageContent: docs });
  const newDocuments = state.documents.concat(webResults);

  return {
    documents: newDocuments,
  };
}

/**
 * Determines whether to generate an answer, or re-generate a question.
 *
 * @param {typeof GraphState.State} state The current state of the graph.
 * @returns {"transformQuery" | "generate"} Next node to call
 */
function decideToGenerate(state: typeof GraphState.State) {
  console.log("---DECIDE TO GENERATE---");

  const filteredDocs = state.documents;
  if (filteredDocs.length === 0) {
    // All documents have been filtered checkRelevance
    // We will re-generate a new query
    console.log("---DECISION: TRANSFORM QUERY---");
    return "transformQuery";
  }

  // We have relevant documents, so generate answer
  console.log("---DECISION: GENERATE---");
  return "generate";
}

/******************************** EVALUATIONS *********************************************
 *
 *
 *
 ***********************************************************************************************/
import { example1 } from "@/testcases/example";
import { Client } from "langsmith";
const client = new Client();

// Create a dataset and examples
async function createExamples(state: typeof GraphState.State) {
  const inputs = example1.map(([inputPrompt]) => ({
    question: inputPrompt,
  }));
  const outputs = example1.map(([, outputAnswer]) => ({
    answer: outputAnswer,
  }));

  // Programmatically create a dataset in LangSmith
  const datasetName = "Individual Income Tax 2024";
  const dataDescription =
    "Sample Q&A dataset from IRS publications for individual income tax in 2024.";
  const dataset = await client.createDataset(datasetName);
  await client.createExamples({ inputs, outputs, datasetId: dataset.id });
}

/******************************** SETTING THE GRAPH *********************************************
 *
 *
 *
 ***********************************************************************************************/

import { END, START, StateGraph } from "@langchain/langgraph";

const workflow = new StateGraph(GraphState)
  // Define the nodes
  .addNode("retrieve", retrieve)
  .addNode("gradeDocuments", gradeDocuments)
  .addNode("generate", generate)
  .addNode("transformQuery", transformQuery)
  .addNode("webSearch", webSearch);

// Build graph
workflow.addEdge(START, "retrieve");
workflow.addEdge("retrieve", "generate");
workflow.addEdge("retrieve", "gradeDocuments");
workflow.addConditionalEdges("gradeDocuments", decideToGenerate);
workflow.addEdge("transformQuery", "webSearch");
workflow.addEdge("webSearch", "generate");
workflow.addEdge("generate", END);

// Compile
export const app = workflow.compile();
