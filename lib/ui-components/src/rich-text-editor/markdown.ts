import { DOMSerializer } from "prosemirror-model";
import { defaultMarkdownSerializer, MarkdownSerializer } from "prosemirror-markdown";

export const markdownSerializer = new MarkdownSerializer(
  {
    ...defaultMarkdownSerializer.nodes,
    table(state, table) {
      let simple = true;
      table.forEach((row, _offset, rowIndex) => {
        row.forEach((cell) => {
          if (
            cell.attrs.colspan !== 1 || cell.attrs.rowspan !== 1 ||
            cell.childCount !== 1 || cell.firstChild?.type.name !== "paragraph" ||
            cell.type.name !== (rowIndex === 0 ? "table_header" : "table_cell")
          ) simple = false;
        });
      });

      if (!simple) {
        // Markdown pipe tables cannot preserve merged cells or block content.
        const wrapper = document.createElement("div");
        wrapper.appendChild(DOMSerializer.fromSchema(table.type.schema).serializeNode(table));
        state.write(wrapper.innerHTML);
        state.closeBlock(table);
        return;
      }

      table.forEach((row, _offset, rowIndex) => {
        const cells: string[] = [];
        row.forEach((cell) => {
          cells.push(defaultMarkdownSerializer.serialize(cell)
            .replace(/\|/g, "\\|")
            .replace(/\\\n/g, "<br>")
            .replace(/\n/g, "<br>"));
        });
        state.write(`| ${cells.join(" | ")} |`);
        state.ensureNewLine();
        if (rowIndex === 0) {
          state.write(`| ${cells.map(() => "---").join(" | ")} |`);
          state.ensureNewLine();
        }
      });
      state.closeBlock(table);
    },
  },
  defaultMarkdownSerializer.marks,
);
