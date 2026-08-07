# System information

System Information is a read-only diagnostics page for administrators. It is rendered on the server from the current Voyzu process and database connection; it does not require a separate API.

## Operating system

Shows the operating system, architecture, host, CPU, RAM usage, disk usage, runtime user, temporary directory, and network addresses available to the server.

## Install

Shows the Voyzu, Node.js, Next.js, and React versions together with the instance root, `.run` workspace, platform root, web application root, and relevant package files. **Workspace mode** describes how the instance workspace was created; `NODE_ENV` on the Process panel describes the running web server.

## Process

Shows the web server process ID, executable, command, start time, uptime, CPU time, memory usage, filesystem activity, and active Node.js resource types. Development lock information appears when Next.js provides a lock file; a production `next start` process may not create one.

## Database

Shows the connected PostgreSQL server version, database name, server address, current user, connection-pool activity, and the size of the connected Voyzu database.

Use this page when confirming the environment, diagnosing resource usage, or collecting deployment details for support. Values describe the server running Voyzu, which may be Windows or Linux.
