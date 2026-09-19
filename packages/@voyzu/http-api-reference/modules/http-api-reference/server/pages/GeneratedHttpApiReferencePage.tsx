import type { PageProps } from "@voyzu/types/page-routing";
import { GeneratedOperationsPage } from "./GeneratedOperationsPage";

export function GeneratedHttpApiReferencePage({ context }: PageProps) {
  const { packageFolder, groupFolder } = context.pathParams;
  if (typeof packageFolder !== "string" || typeof groupFolder !== "string") {
    throw new Error("The generated HTTP API Reference route requires package and group folders.");
  }
  return (
    <GeneratedOperationsPage
      packageFolder={decodeURIComponent(packageFolder)}
      groupFolder={decodeURIComponent(groupFolder)}
    />
  );
}
