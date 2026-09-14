import type { ResponseExampleData } from "../../../types/index";
import { highlightCode } from "../highlight";
import styles from "../example-panel.module.css";

export async function ResponseExample({ example }: { example: ResponseExampleData }) {
  const html = await highlightCode(example.code, example.format ?? "json");
  const hasBody = example.code.trim().length > 0;

  return (
    <aside className={styles.codeStack}>
      <div className={styles.codePanel}>
        <div className={styles.codeHeader}>
          <span className={styles.statusOk}>{example.status}</span>
          <span>{example.contentType ?? "application/json"}</span>
        </div>
        {hasBody ? (
          <div className={styles.highlightedCode} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className={styles.emptyCodeBody}>No response body</div>
        )}
      </div>
    </aside>
  );
}
