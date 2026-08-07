import { join } from "node:path";
import { pathToFileURL } from "node:url";

const STYLE_EXTENSION = /\.(?:css|scss|sass|less)$/i;
const BARE_SPECIFIER = /^(?:@[^/]+\/[^/]+|[^./][^:]*)/;
const EMPTY_STYLE_MODULE =
  "data:text/javascript,export default Object.freeze(%7B%7D)%3B";
const EMPTY_SERVER_ONLY_MODULE = "data:text/javascript,export%20%7B%7D%3B";
const workspaceParentUrl = process.env.VOYZU_WORKSPACE_ROOT
  ? pathToFileURL(join(process.env.VOYZU_WORKSPACE_ROOT, "package.json")).href
  : undefined;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      shortCircuit: true,
      url: EMPTY_SERVER_ONLY_MODULE,
    };
  }
  if (STYLE_EXTENSION.test(specifier)) {
    return {
      shortCircuit: true,
      url: EMPTY_STYLE_MODULE,
    };
  }
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (
      error?.code !== "ERR_MODULE_NOT_FOUND"
      || !workspaceParentUrl
      || !BARE_SPECIFIER.test(specifier)
    ) {
      throw error;
    }
    return nextResolve(specifier, {
      ...context,
      parentURL: workspaceParentUrl,
    });
  }
}

export async function load(url, context, nextLoad) {
  if (STYLE_EXTENSION.test(new URL(url).pathname)) {
    return {
      format: "module",
      shortCircuit: true,
      source: "export default Object.freeze({});",
    };
  }
  return nextLoad(url, context);
}
