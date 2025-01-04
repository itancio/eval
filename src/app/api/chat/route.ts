// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer

import { NextResponse } from "next/server";
import { app } from "@/app/tools/langgraph";

export async function POST(req: Request) {
  const { message } = await req.json();
  console.log(`Received message: ${message}`);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const inputs = { question: message };
        const config = { recursionLimit: 50 };

        for await (const output of await app.stream(inputs, config)) {
          for (const [key, value] of Object.entries(output)) {
            // console.log(`Node: '${key}'`);
            // console.log(JSON.stringify(value, null, 2));
            const content = JSON.stringify({
              node: key,
              response: value,
            });
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close(); // Close the stream after processing completes successfully
      } catch (error) {
        console.error("Error in stream", error);

        // Inform the client about the error before closing
        controller.enqueue(new TextEncoder().encode(`Error: ${error}\n`));
        controller.error(error); // Properly close the stream with an error
      }
    },
  });

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
