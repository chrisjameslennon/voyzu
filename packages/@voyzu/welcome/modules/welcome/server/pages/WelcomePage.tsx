import detail from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

const HELP_URL = "https://voyzu.gitbook.io/docs/extending-voyzu/commands";
const DEVELOPMENT_HELP_URL = "https://voyzu.gitbook.io/docs/extending-voyzu/develop-a-new-package";

export function WelcomePage() {
  return (
    <main style={{ maxWidth: "72rem", margin: "0 auto", padding: "3rem 2.5rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p className={typography.eyebrow}>VOYZU PLATFORM</p>
        <h1 className={typography.pageTitle}>Welcome to Voyzu</h1>
        <p className={typography.headingByline}>
          Your Voyzu platform is ready. Add or develop packages to provide the business capabilities your organisation needs.
        </p>
      </header>

      <p className={typography.bodyText} style={{ marginBottom: "1.5rem" }}>
        This Welcome package is installed by default with the Voyzu platform. You can hide this welcome screen in{" "}
        <a className={typography.link} href="/settings/packages">Package Management</a>.
      </p>

      <section className={detail.card}>
        <div className={detail.cardHeader}>
          <h2 className={`${typography.sectionHeading} ${detail.cardHeaderTitle}`}>Install Voyzu packages</h2>
        </div>
        <div className={detail.fieldGroup}>
          <p className={typography.bodyText}>
            Package installation is controlled from the instance root using Voyzu&apos;s package scripts. Download and
            install a package with <code>npm run voyzu:install -- &lt;github-address&gt; &lt;package-name&gt;</code>, then
            restart the web server so the composed application can load it.
          </p>
          <p className={typography.bodyText}>
            <a className={typography.link} href={HELP_URL} target="_blank" rel="noreferrer">View all Voyzu commands</a>
          </p>
        </div>
      </section>

      <section className={detail.card} style={{ marginTop: "1rem" }}>
        <div className={detail.cardHeader}>
          <h2 className={`${typography.sectionHeading} ${detail.cardHeaderTitle}`}>Develop your own packages</h2>
        </div>
        <div className={detail.fieldGroup}>
          <p className={typography.bodyText}>
            Voyzu is designed to be extended. Create focused packages for your organisation, your customers, your
            industry, or the wider Voyzu community using the same package contracts and application patterns as official packages.
          </p>
          <p className={typography.bodyText}>
            <a className={typography.link} href={DEVELOPMENT_HELP_URL} target="_blank" rel="noreferrer">Learn how to develop a new Voyzu package</a>
          </p>
        </div>
      </section>
    </main>
  );
}
