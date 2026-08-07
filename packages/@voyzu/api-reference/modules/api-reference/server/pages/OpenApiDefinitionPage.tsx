import styles from "./placeholder.module.css";

const OPENAPI_DOCUMENT_URL = "/voyzu/openapi.json";

export function OpenApiDefinitionPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>OpenAPI Definition</p>
        <h1 className={styles.title}>OpenAPI Definition</h1>
        <p className={styles.description}>
          The OpenAPI document is the machine-readable API contract used by external tools, clients, and API
          documentation renderers.
        </p>
      </header>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>OpenAPI JSON</h2>
        <p className={styles.panelText}>
          <a href={OPENAPI_DOCUMENT_URL} target="_blank" rel="noreferrer">
            {OPENAPI_DOCUMENT_URL}
          </a>
        </p>
      </section>
    </main>
  );
}
