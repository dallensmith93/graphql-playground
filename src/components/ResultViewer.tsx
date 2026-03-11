import type { ParseResult } from "../engine/queryParser";

type ResultViewerProps = {
  output: Record<string, unknown>;
  parseResult: ParseResult;
};

export default function ResultViewer({ output, parseResult }: ResultViewerProps) {
  return (
    <section className="panel result-viewer">
      <h2>Result Viewer</h2>

      <div className="result-meta">
        <span>Operation: {parseResult.ok && parseResult.parsed ? parseResult.parsed.operationType : "invalid"}</span>
        <span>Root Field: {parseResult.ok && parseResult.parsed ? parseResult.parsed.rootField : "-"}</span>
      </div>

      <pre>{JSON.stringify(output, null, 2)}</pre>
    </section>
  );
}
