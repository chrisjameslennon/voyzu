# HTTP API Reference

Voyzu includes a comprehensive HTTP API. All UI functions are supported within the published HTTP API, and the HTTP API includes many additional methods.

The HTTP API Reference is built into the main Voyzu application. After signing in, select **HTTP API Reference** from the top navigation or browse to:

```
http://localhost:3000/http-api-reference
```

## Generating HTTP API Reference documentation

HTTP API definitions can change during development. Rebuild the generated operation documents and the single combined OpenAPI document from the installation root:

```shellscript
npm run voyzu:build-http-api-reference
```

The generated operation documents are grouped by package beneath `apps/web/.generated/http-api-reference` in the Voyzu runtime. The combined OpenAPI document is served from `/voyzu/openapi.json`.

For more information on defining HTTP API documentation in package source, see [HTTP API patterns](../voyzu-platform-patterns/http-api-patterns.md).
