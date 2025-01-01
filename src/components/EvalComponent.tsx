import { ChartComponent } from "./ChartComponent";
export function EvalComponent() {
  return (
    <>
      {/* Evaluation Column */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <ChartComponent title="Accuracy" />
          <ChartComponent title="Relevance" />
        </div>
      </div>
    </>
  );
}
