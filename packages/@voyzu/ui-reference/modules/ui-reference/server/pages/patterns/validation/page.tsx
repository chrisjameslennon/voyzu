import { getSingletonHighlighter } from "shiki";
import { ValidationDemo } from "./validation-demo";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const RULES_TABLE = [
  { name: "required()",                                         description: "Field value must not be empty (after trimming whitespace). Missing fields are grouped into a single 'You must supply a…' message." },
  { name: "pattern(re, message)",                              description: "Value must match the given RegExp. Only runs when the field is non-empty (required handles the empty case)." },
  { name: "maxLength(max, message?)",                          description: "Value must be max characters or fewer. Default message: 'Must be N characters or less'." },
  { name: "minLength(min, message?)",                          description: "Value must be at least min characters." },
  { name: "{ kind: \"format\", test: fn, message }",          description: "Custom rule. test receives the current string value; return false to fail. Use this for numeric range checks, date validation, or anything a regex cannot express." },
];

const RETURNS_TABLE = [
  { name: "errors",       type: "string[]",            description: "Computed error messages. Required-field failures are condensed into one message; format errors follow." },
  { name: "showErrors",   type: "boolean",             description: "True when attempt() has been called, there are errors, and the user has not dismissed the alert. Wire to ValidationAlert visible." },
  { name: "attempt()",    type: "() => boolean",       description: "Call on form submit. Marks the form as attempted and returns true if there are no errors." },
  { name: "hasError(key)", type: "(key: string) => boolean", description: "True when attempt() has been called and the named field has a failing rule. Pass the result to the React Input invalid prop." },
  { name: "dismiss()",    type: "() => void",          description: "Hides the alert without resetting state. Wire to ValidationAlert onDismiss." },
  { name: "reset()",      type: "() => void",          description: "Clears the attempted flag. Call when the form is reset to initial values." },
  { name: "isValid",      type: "boolean",             description: "True when there are currently no errors. Does not consider whether attempt() has been called." },
];

const CODE_EXAMPLES = [
  {
    title: "Required fields",
    description: "The minimal setup: define fields with required(), call attempt() on submit, wire the alert.",
    code: `import { useFormValidation, required } from "@voyzu/ui-components";
import { ValidationAlert } from "@voyzu/ui-components";

const validation = useFormValidation(() => ({
  name:    { label: "name",    value: form.name,    rules: [required()] },
  date:    { label: "date",    value: form.date,    rules: [required()] },
  account: { label: "account", value: form.account, rules: [required()] },
}));

// On submit — attempt() returns false if errors exist.
const handleSubmit = () => {
  if (!validation.attempt()) return;
  // proceed with submission
};

<ValidationAlert
  errors={validation.errors}
  visible={validation.showErrors}
  onDismiss={validation.dismiss}
/>`,
  },
  {
    title: "Format rules",
    description: "Chain rules on a field. required() runs first; format rules only run when the value is non-empty. Use the custom { kind: \"format\" } object for logic that a regex cannot express.",
    code: `import { useFormValidation, required, maxLength, pattern } from "@voyzu/ui-components";

const validation = useFormValidation(() => ({
  amount: {
    label: "amount",
    value: form.amount,
    rules: [
      required(),
      {
        kind: "format" as const,
        test: (v) => /^\\d+(\\.\\d{1,2})?$/.test(v) && parseFloat(v) > 0,
        message: "Amount must be a positive number (e.g. 99.00)",
      },
    ],
  },
  code: {
    label: "code",
    value: form.code,
    rules: [
      required(),
      maxLength(14, "Code must be 14 characters or less"),
      pattern(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, - and _"),
    ],
  },
}));`,
  },
  {
    title: "Field-level error highlighting with hasError()",
    description: "After attempt(), hasError(key) returns true for any field whose rules are failing. Pass it to Input.invalid so the component owns the error appearance and accessibility state.",
    code: `import { Input, SearchableSelect } from "@voyzu/ui-components";

<Input
  invalid={validation.hasError("amount")}
  value={form.amount}
  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
/>

// SearchableSelect uses hasError prop instead:
<SearchableSelect
  options={accounts}
  value={form.account}
  onChange={(v) => setForm((p) => ({ ...p, account: v }))}
  hasError={validation.hasError("account")}
/>`,
  },
  {
    title: "Mandatory checkbox",
    description: "Map the boolean checkbox state to a non-empty string so required() can enforce acceptance. Pass hasError() to aria-invalid for accessibility.",
    code: `import { Checkbox } from "@voyzu/ui-components";

const validation = useFormValidation(() => ({
  name: { label: "name", value: form.name, rules: [required()] },
  acceptTerms: {
    label: "confirmation that you accept the terms and conditions",
    value: form.acceptTerms ? "accepted" : "",
    rules: [required()],
  },
}));

<label>
  <Checkbox
    checked={form.acceptTerms}
    required
    invalid={validation.hasError("acceptTerms")}
    onChange={(checked) => setForm((p) => ({ ...p, acceptTerms: checked }))}
  />
  Accept terms and conditions (required)
</label>
`,
  },
];

export default async function Page() {
  const codeHtmls = await Promise.all(CODE_EXAMPLES.map((e) => highlight(e.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Patterns</p>
        <h1 className={pageStyles.title}>Validation</h1>
        <p className={pageStyles.description}>
          Client-side form validation using the <code>useFormValidation</code> hook.
          Define field rules once; the hook computes error messages, tracks submission state,
          and feeds directly into <code>ValidationAlert</code> and the React <code>Input</code> invalid state.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ Input, Checkbox, ValidationAlert, useFormValidation, required, pattern, maxLength, minLength }"} from &quot;@voyzu/ui-components&quot;</code>
        </div>
      </div>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Rules</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Rule</th><th>Description</th></tr>
            </thead>
            <tbody>
              {RULES_TABLE.map((r) => (
                <tr key={r.name}>
                  <td style={{ whiteSpace: "nowrap" }}><code className={pageStyles.propName}>{r.name}</code></td>
                  <td>{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Return values</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Name</th><th>Type</th><th>Description</th></tr>
            </thead>
            <tbody>
              {RETURNS_TABLE.map((r) => (
                <tr key={r.name}>
                  <td style={{ whiteSpace: "nowrap" }}><code className={pageStyles.propName}>{r.name}</code></td>
                  <td><code className={pageStyles.propType}>{r.type}</code></td>
                  <td>{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Live demo</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
          Try submitting without filling in fields. Notice how the alert groups required fields together,
          how React Input controls turn red via <code>hasError()</code>, and how acceptance of the terms and
          conditions is required before submission.
        </p>
        <ValidationDemo />
      </section>

      {CODE_EXAMPLES.map((example, i) => (
        <section key={example.title} className={pageStyles.section}>
          <h2 className={pageStyles.sectionTitle}>{example.title}</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            {example.description}
          </p>
          <div className={pageStyles.story}>
            <div className={pageStyles.codeBlock} dangerouslySetInnerHTML={{ __html: codeHtmls[i]! }} />
          </div>
        </section>
      ))}
    </main>
  );
}
