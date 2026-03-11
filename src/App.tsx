import { useState } from "react";
import QueryEditor from "./components/QueryEditor";
import ResultViewer from "./components/ResultViewer";
import SchemaPanel from "./components/SchemaPanel";
import { mockResolver } from "./engine/mockResolver";
import { queryParser, type ParseResult } from "./engine/queryParser";

const DEFAULT_QUERY = `query GetUsers {
  users {
    id
    name
    role
  }
}`;

export default function App() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [parseResult, setParseResult] = useState<ParseResult>(() => queryParser(DEFAULT_QUERY));
  const [output, setOutput] = useState<Record<string, unknown>>(() => {
    const initial = queryParser(DEFAULT_QUERY);
    return initial.ok && initial.parsed
      ? mockResolver(initial.parsed)
      : { errors: initial.errors.map((message) => ({ message })) };
  });

  const runQuery = () => {
    const parsed = queryParser(query);
    setParseResult(parsed);

    if (!parsed.ok || !parsed.parsed) {
      setOutput({ errors: parsed.errors.map((message) => ({ message })) });
      return;
    }

    setOutput(mockResolver(parsed.parsed));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>GraphQL Playground</h1>
        <p>Write query operations and inspect simulated GraphQL responses.</p>
      </header>

      <main className="layout-grid">
        <QueryEditor
          query={query}
          onQueryChange={setQuery}
          onRunQuery={runQuery}
          parseErrors={parseResult.ok ? [] : parseResult.errors}
        />
        <ResultViewer output={output} parseResult={parseResult} />
        <SchemaPanel />
      </main>
    </div>
  );
}
