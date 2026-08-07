export function resolveExternalUrl(basePath: string, relativePath: string): string {
  if (/^https?:\/\//.test(relativePath)) return relativePath;

  const baseUrl = basePath.replace(/\/+$/, "");
  const path = relativePath.replace(/^\/+/, "");
  return `${baseUrl}/${path}`;
}
