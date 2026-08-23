import styles from "./guide-pages.module.css";

export function GettingStartedPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Getting Started</p>
        <h1 className={styles.title}>Getting Started</h1>
        <p className={styles.description}>
          The API Reference documents Voyzu endpoints using relative paths. Combine each path with the base URL for the
          environment you are calling.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Base URL</h2>
        <p className={styles.sectionText}>
          Endpoint pages show paths such as <code>/organization/organizations</code>. On a local development instance, the default
          base URL is <code>http://localhost:3000</code>, so the full local URL is{" "}
          <code>http://localhost:3000/organization/organizations</code>.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Request Format</h2>
        <p className={styles.sectionText}>
          API requests and responses use JSON. Endpoints that accept a body expect <code>Content-Type:
          application/json</code>. Request and response schemas are shown beside each operation.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reference Structure</h2>
        <p className={styles.sectionText}>
          Endpoint pages are grouped by the package that provides them. The OpenAPI Definition page links to the single
          generated machine-readable contract for all documented packages.
        </p>
      </section>
    </main>
  );
}
