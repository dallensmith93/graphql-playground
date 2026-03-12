import { useState } from "react";
import QueryEditor from "./components/QueryEditor";
import ResultViewer from "./components/ResultViewer";
import { sampleQueries, schemaSDL } from "./data/schema";
import { parseQuery, type ParseResult } from "./engine/parser";
import { resolveQuery } from "./engine/resolver";

export default function App() {
  const [query, setQuery] = useState(sampleQueries[0]);
  const [parse, setParse] = useState<ParseResult>(() => parseQuery(sampleQueries[0]));
  const [result, setResult] = useState<Record<string, unknown>>({});

  const run = () => {
    const parsed = parseQuery(query);
    setParse(parsed);

    if (!parsed.ok) {
      setResult({ errors: parsed.errors.map((message) => ({ message })) });
      return;
    }

    setResult(resolveQuery(parsed.parsed));
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>GraphQL Playground</h1>
        <p>Simulate local GraphQL queries with a lightweight parser and resolver.</p>
      </header>

      <section className="workspace">
        <QueryEditor query={query} onChange={setQuery} onRun={run} parseErrors={parse.ok ? [] : parse.errors} />
        <ResultViewer result={result} parse={parse} />
      </section>

      <section className="panel schema-panel">
        <h2>Mock Schema</h2>
        <pre>{schemaSDL.trim()}</pre>
      </section>
    </main>
  );
}