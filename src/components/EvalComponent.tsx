import { ChartComponent } from "./ChartComponent";
import type { JsonValue } from "../app/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export function EvalComponent({ eval: evalChunks }: { eval: string[] }) {
  // Parse all chunks
  const evaluations = evalChunks.map((chunk, index) => {
    try {
      return JSON.parse(chunk);
    } catch (error) {
      console.error(`Failed to parse chunk at index ${index}:`, error);
      return null; // Return null for invalid chunks
    }
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Accordion type="single" collapsible>
        {evaluations.map((parsedEvaluation, index) => {
          if (!parsedEvaluation) {
            // Handle invalid chunks gracefully
            return (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>Invalid Data</AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-red-600">
                    The data could not be parsed.
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          }

          const { node, response } = parsedEvaluation;

          return (
            <AccordionItem key={`${node}-${index}`} value={`item-${index}`}>
              <AccordionTrigger>
                <div className="font-semibold text-white mb-2">
                  Task: {node}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {/* Response Handling */}
                <div className="text-gray-400 mt-2">
                  {/* If response.generation exists */}
                  {response.generation && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-cyan-400">
                        Generation:
                      </div>
                      <div className="text-sm text-gray-300">
                        {response.generation}
                      </div>
                    </div>
                  )}

                  {/* If response.documents exists */}
                  {response.documents && Array.isArray(response.documents) && (
                    <div>
                      <div className="text-sm font-medium text-cyan-400 mb-2">
                        Documents:
                      </div>
                      {response.documents.map((doc, docIndex) => (
                        <div
                          key={docIndex}
                          className="text-sm text-gray-300 mb-2 border-b border-gray-600 pb-2"
                        >
                          <div>Content: {doc.pageContent || "N/A"}</div>
                          <div>Source: {doc.metadata?.source || "N/A"}</div>
                          <div>Title: {doc.metadata?.title || "N/A"}</div>
                          <div>
                            Explanation: {doc.metadata?.explanation || "N/A"}
                          </div>

                          <div className="flex text-cyan-400 gap-2 m-5">
                            <Badge variant="secondary">
                              Relevant: {doc.metadata?.score || "N/A"}
                            </Badge>
                            <Badge variant="secondary">
                              Latency: {doc.metadata?.latency || "N/A"} ms
                            </Badge>
                            <Badge variant="secondary">
                              Total tokens used: 1500
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* If neither generation nor documents */}
                  {!response.generation && !response.documents && (
                    <div className="text-sm text-gray-400">
                      No data available.
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
