import * as fs from "node:fs";
import * as path from "node:path";
import { notFound } from "next/navigation";

import { OperationDoc } from "@voyzu/http-api-reference/client/components";
import type { DtoDoc, OperationDoc as OperationDocData } from "@voyzu/http-api-reference/types";

import { generatedFilesRoot } from "../generated-docs";
import styles from "./companies.module.css";

interface GeneratedOperationsPageProps {
  packageFolder: string;
  groupFolder: string;
  emptyMessage?: string;
}

function readOperationDocs(packageFolder: string, groupFolder: string): OperationDocData[] {
  if (!/^@[a-z0-9._-]+$/.test(packageFolder) || !/^[a-z][a-z0-9_-]*(?:\.[A-Za-z0-9_-]+)+$/.test(groupFolder)) notFound();
  const docsDir = path.join(generatedFilesRoot(), packageFolder, groupFolder);
  if (!fs.existsSync(docsDir)) notFound();

  const group = JSON.parse(fs.readFileSync(path.join(docsDir,"group-doc.json"),"utf8")) as { operations: {file:string}[] };
  return group.operations.map(({file})=>JSON.parse(fs.readFileSync(path.join(docsDir,file),"utf8")) as OperationDocData);

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

export async function GeneratedOperationsPage({
  packageFolder,
  groupFolder,
  emptyMessage = "No generated HTTP API operation docs were found.",
}: GeneratedOperationsPageProps) {
  const operationDocs = readOperationDocs(packageFolder, groupFolder);
  const dtoDocs = readDtoDocs(packageFolder);
  if (operationDocs.length === 0) {
    throw new Error(emptyMessage);
  }

  const group = JSON.parse(fs.readFileSync(path.join(generatedFilesRoot(),packageFolder,groupFolder,"group-doc.json"),"utf8")) as {title:string;description:string;sectionTitle:string;sectionDescription:string};
  const title = group.title;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p>{group.sectionTitle}</p>
        <p>{group.sectionDescription}</p>
        <h1>{title}</h1>
        <p>{group.description}</p>
      </header>

      <article className={styles.content}>
        {operationDocs.map((doc) => (
          <OperationDoc key={doc.operationId} doc={doc} dtoDocs={dtoDocs} />
        ))}
      </article>
    </main>
  );
}
