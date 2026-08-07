import { RequestExample } from "@voyzu/api-reference/client/components";

import styles from "./guide-pages.module.css";

const companiesListBasicAuthExample = {
  method: "GET" as const,
  path: "/api/companies",
  code: `curl --request GET \\
  --url http://localhost:3000/api/companies \\
  --header 'Authorization: Basic BASE64_OF_USER_CODE_COLON_PASSWORD'`,
};

const companiesListConcreteBasicAuthExample = {
  method: "GET" as const,
  path: "/api/companies",
  code: `curl --request GET \\
  --url http://localhost:3000/api/companies \\
  --header 'Authorization: Basic QVBJX1VTRVI6cGFzc3dvcmRwYXNzd29yZA=='`,
};

export async function AuthenticationPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Getting Started</p>
        <h1 className={styles.title}>Authentication</h1>
        <p className={styles.description}>
          Voyzu supports API authentication for external callers and local authentication for users working through the
          web application.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>API Authentication</h2>
        <p className={styles.sectionText}>
          API calls use HTTP Basic authentication. Construct one exact value as <code>USER_CODE:PASSWORD</code>. The
          colon is mandatory and has no surrounding spaces. Base64-encode that entire value—including the user code,
          colon, and password—and place the result after <code>Basic</code> in the Authorization header. Do not encode
          only the password or encode the two parts separately. The user must be active and enabled for API access.
        </p>
        <div className={styles.example}>
          <RequestExample example={companiesListBasicAuthExample} />
        </div>
        <p className={styles.sectionText}>
          For example, the complete unencoded value <code>API_USER:passwordpassword</code> encodes to{" "}
          <code>QVBJX1VTRVI6cGFzc3dvcmRwYXNzd29yZA==</code>.
        </p>
        <div className={styles.example}>
          <RequestExample example={companiesListConcreteBasicAuthExample} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Local Authentication</h2>
        <p className={styles.sectionText}>
          An endpoint can receive either an external API call or an application call from the Voyzu web app. External
          callers provide authentication credentials in the request. If API credentials are not received, the endpoint
          falls back to cookie authentication from the signed-in browser session. If cookie authentication fails, an
          endpoint that requires an authenticated user returns <code>401 Unauthorized</code>.
        </p>
        <p className={styles.sectionText}>
          This means browser users can call endpoints through the application after signing in locally, while external
          systems, scripts, integrations, and test clients should use API authentication. If an Authorization header is
          supplied but the credentials are invalid, Voyzu returns <code>401 Unauthorized</code> instead of falling back
          to cookies.
        </p>
      </section>
    </main>
  );
}
