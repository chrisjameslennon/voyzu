import { GeneratedOperationsPage } from "./GeneratedOperationsPage";

export function GeneratedApiReferencePage(props: Record<string, unknown>) {
  const { packageFolder, moduleFolder } = props;
  if (typeof packageFolder !== "string" || typeof moduleFolder !== "string") {
    throw new Error("The generated API Reference route requires package and module folders.");
  }
  return (
    <GeneratedOperationsPage
      packageFolder={decodeURIComponent(packageFolder)}
      moduleFolder={decodeURIComponent(moduleFolder)}
    />
  );
}
