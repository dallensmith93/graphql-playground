import { schemaSDL } from "../data/schema";

export default function SchemaPanel() {
  return (
    <section className="panel schema-panel">
      <h2>Schema</h2>
      <pre>{schemaSDL}</pre>
    </section>
  );
}
