type QueryEditorProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onRunQuery: () => void;
  parseErrors: string[];
};

export default function QueryEditor({ query, onQueryChange, onRunQuery, parseErrors }: QueryEditorProps) {
  return (
    <section className="panel query-editor">
      <div className="panel-header">
        <h2>Query Editor</h2>
        <button type="button" onClick={onRunQuery}>
          Run Query
        </button>
      </div>

      <textarea
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        spellCheck={false}
        aria-label="GraphQL query editor"
      />

      {parseErrors.length > 0 ? (
        <ul className="error-list" role="alert">
          {parseErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : (
        <p className="hint">Parser status: OK</p>
      )}
    </section>
  );
}
