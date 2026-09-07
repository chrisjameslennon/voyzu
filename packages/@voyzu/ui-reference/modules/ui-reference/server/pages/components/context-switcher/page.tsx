import localStyles from "../../page.module.css";
import { ContextSwitcherPreview } from "./context-switcher-previews";

export default function Page() {
  return <main className={localStyles.page}>
    <div className={localStyles.header}>
      <p className={localStyles.eyebrow}>Components</p>
      <h1 className={localStyles.title}>Context Switcher</h1>
      <p className={localStyles.description}>A generic context selector. Packages supply options and decide what selection means; the control owns presentation, focus, dismissal and pending state.</p>
      <div className={localStyles.importBlock}><code>import {"{ ContextSwitcher }"} from &quot;@voyzu/ui-components&quot;</code></div>
    </div>
    <section className={localStyles.section}><h2 className={localStyles.sectionTitle}>Props</h2>
      <div className={localStyles.tableWrap}><table className={localStyles.propsTable}>
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>label</td><td>string</td><td>Context heading and accessible trigger label.</td></tr>
          <tr><td>options</td><td>ContextSwitcherOption[]</td><td>String id, name, optional subtitle, avatar, inactive and disabled.</td></tr>
          <tr><td>selectedId</td><td>string | null</td><td>Caller-controlled current selection.</td></tr>
          <tr><td>onSelect</td><td>(id) =&gt; void | boolean | Promise</td><td>Handles selection. Return false to keep open after an unsuccessful update. Caller owns error reporting.</td></tr>
          <tr><td>collapsed / disabled</td><td>boolean</td><td>Compact trigger or unavailable control.</td></tr>
          <tr><td>placeholder / emptyMessage</td><td>string</td><td>Unselected and empty-state text.</td></tr>
          <tr><td>headerAction</td><td>ReactNode</td><td>Optional action above the options; omitted when unnecessary.</td></tr>
        </tbody>
      </table></div>
    </section>
    <section className={localStyles.section}><h2 className={localStyles.sectionTitle}>Project context, collapsed and empty states</h2><ContextSwitcherPreview /></section>
    <section className={localStyles.section}><h2 className={localStyles.sectionTitle}>Keyboard interaction</h2>
      <p>Enter, Space or Arrow Down opens the selector. Tab moves through actions; Up/Down and Home/End move between options. Escape closes and restores trigger focus. Clicking or tabbing outside dismisses it.</p>
    </section>
  </main>;
}
