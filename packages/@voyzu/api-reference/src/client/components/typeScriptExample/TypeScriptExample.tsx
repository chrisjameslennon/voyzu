import type { DtoDoc } from "../../../types/index";
import { highlightCode } from "../highlight";
import styles from "../example-panel.module.css";

export async function TypeScriptExample({ dto }: { dto: DtoDoc }) {
  const sourceCode = `// ${dto.sourceFile}\n\n${dto.typescript}`;
  const html = await highlightCode(sourceCode, "typescript");

  return (
    <aside className={styles.codeStack}>
      <div className={styles.codePanel}>
        <div className={styles.codeHeader}>
          <span>{dto.name}</span>
          <span>TypeScript</span>
        </div>
        <div className={styles.highlightedCode} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </aside>
  );
}
