The application is a multi-repo NextJS application using a PostgreSQL database. The best technical documentation entry point is docs\public\extending-voyzu\add-a-new-package.md.

After platform changes, sync the local changes (including uncommitted changes and deletions) into the sibling voyzu-packages/.run/voyzu runtime. Only refresh composition when the changes require it, and refresh only the relevant composition using the narrowest available command. Do not run full composition by default; ordinary source or documentation changes need no composition refresh. Preserve runtime configuration and installed-package generated output; do not start a Next.js server or commit unless requested.

In the voyzu-packages development environment, Chokidar automatically syncs package changes into .run; no manual sync or composition is needed for package changes.
