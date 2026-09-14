import { GeneratedOperationsPage } from "./GeneratedOperationsPage";

export function GeneratedHttpApiReferencePage(props: Record<string, unknown>) {
  const { packageFolder, groupFolder } = props;
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
