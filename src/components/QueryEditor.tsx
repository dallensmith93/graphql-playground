type QueryEditorProps = {
  query: string;
  onChange: (value: string) => void;
  onRun: () => void;
  parseErrors: string[];
};

export default function QueryEditor({ query, onChange, onRun, parseErrors }: QueryEditorProps) {
  return (
    <section className="panel editor-panel">
      <div className="panel-head">
        <h2>Query Editor</h2>
        <button type="button" onClick={onRun}>
          Run
        </button>
      </div>

      <textarea
        value={query}
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
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