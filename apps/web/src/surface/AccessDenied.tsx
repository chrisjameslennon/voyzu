import type { RegisteredPageRoute, VoyzuSurfaceUserAccess } from "@voyzu/ui-surface/types";

import styles from "@voyzu/ui-surface/css-modules/surface.module.css";

interface AccessDeniedProps {
  route: RegisteredPageRoute;
  user: VoyzuSurfaceUserAccess | null;
}

export function AccessDenied({ route, user }: AccessDeniedProps) {
  return (
    <main className={styles.main}>
      <section>
        <h1>Access denied</h1>
        <p>
          {user
            ? `Your current role cannot access ${route.pageTitle}.`
            : "You need to sign in to access this page."}
        </p>
      </section>
    </main>
  );
}
