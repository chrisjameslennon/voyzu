import type { RequestExampleData } from "../../../types/index";
import { highlightCode } from "../highlight";
import styles from "../example-panel.module.css";

function MethodTag({ method }: { method: RequestExampleData["method"] }) {
  return <span className={`${styles.methodTag} ${styles[`method${method}`]}`}>{method}</span>;
}

export async function RequestExample({ example }: { example: RequestExampleData }) {
  const html = await highlightCode(example.code, "shellscript");

  return (
    <aside className={styles.codeStack}>
      <div className={styles.codePanel}>
        <div className={styles.codeHeader}>
          <span><MethodTag method={example.method} /> {example.path}</span>
          <span>Shell Curl</span>
        </div>
        <div className={styles.highlightedCode} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </aside>
  );
}
