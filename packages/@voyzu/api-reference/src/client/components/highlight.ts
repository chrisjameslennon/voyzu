import { getSingletonHighlighter } from "shiki";

export async function highlightCode(code: string, lang: "shellscript" | "json" | "typescript") {
  const highlighter = await getSingletonHighlighter({
    themes: ["dark-plus"],
    langs: ["shellscript", "json", "typescript"],
  });

  return highlighter.codeToHtml(code, { lang, theme: "dark-plus" });
}
