import * as fs from "node:fs";
import * as path from "node:path";

import { OperationDoc } from "@voyzu/api-reference/client/components";
import type { DtoDoc, OperationDoc as OperationDocData } from "@voyzu/api-reference/types";

import { generatedFilesRoot } from "../generated-docs";
import styles from "./companies.module.css";

interface GeneratedOperationsPageProps {
  packageFolder: string;
  moduleFolder: string;
  emptyMessage?: string;
}

function readOperationDocs(packageFolder: string, moduleFolder: string): OperationDocData[] {
  const docsDir = path.join(generatedFilesRoot(), packageFolder, moduleFolder);
  const fileNames = fs
    .readdirSync(docsDir)
    .filter((fileName) => fileName.endsWith(".operation-doc.json"))
    .sort();

  return fileNames
    .map((fileName) => {
      const filePath = path.join(docsDir, fileName);
      return JSON.parse(fs.readFileSync(filePath, "utf-8")) as OperationDocData;
    })
    .sort(
      (a, b) =>
        a.summary.localeCompare(b.summary) ||
        a.path.localeCompare(b.path) ||
        a.method.localeCompare(b.method),
    );
}

function readDtoDocs(packageFolder: string): Record<string, DtoDoc> {
  const docsDir = path.join(generatedFilesRoot(), packageFolder, "types");
  if (!fs.existsSync(docsDir)) return {};

  return Object.fromEntries(
    fs
      .readdirSync(docsDir)
      .filter((fileName) => fileName.endsWith(".dto-doc.json"))
      .sort()
      .map((fileName) => {
        const filePath = path.join(docsDir, fileName);
        const doc = JSON.parse(fs.readFileSync(filePath, "utf-8")) as DtoDoc;
        return [doc.name, doc];
      }),
  );
}

function commonResourcePath(docs: OperationDocData[]): string {
  const pathParts = docs.map((doc) => doc.path.split("/").filter(Boolean));
  const first = pathParts[0] ?? [];
  const commonParts = first.filter((part, index) => pathParts.every((parts) => parts[index] === part));
  return `/${commonParts.join("/")}`;
}

export async function GeneratedOperationsPage({
  packageFolder,
  moduleFolder,
  emptyMessage = "No generated API operation docs were found.",
}: GeneratedOperationsPageProps) {
  const operationDocs = readOperationDocs(packageFolder, moduleFolder);
  const dtoDocs = readDtoDocs(packageFolder);
  if (operationDocs.length === 0) {
    throw new Error(emptyMessage);
  }

  const title = operationDocs[0].tags?.[0] ?? operationDocs[0].summary;
  const resourcePath = commonResourcePath(operationDocs);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>{title}</h1>
        <code className={styles.resourcePath}>{resourcePath}</code>
      </header>

      <article className={styles.content}>
        {operationDocs.map((doc) => (
          <OperationDoc key={doc.operationId} doc={doc} dtoDocs={dtoDocs} />
        ))}
      </article>
    </main>
  );
}
