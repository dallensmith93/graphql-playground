import type { ParseResult } from "../engine/parser";

type ResultViewerProps = {
  result: Record<string, unknown>;
  parse: ParseResult;
};

export default function ResultViewer({ result, parse }: ResultViewerProps) {
  return (
    <section className="panel result-panel">
      <h2>Result Viewer</h2>
      <div className="meta-row">
        <span>Operation: {parse.ok ? parse.parsed.operationType : "invalid"}</span>
        <span>Root: {parse.ok ? parse.parsed.rootField : "-"}</span>
      </div>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </section>
  );
}