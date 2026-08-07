# API Reference

Voyzu includes a comprehensive API. All UI functions are supported within the published API, and the API includes many additional methods.

The API Reference is built into the main Voyzu application. After signing in, select **API Reference** from the top navigation or browse to:

```
http://localhost:3000/api-reference
```

## Generating API Reference documentation

API definitions can change during development. Rebuild the generated operation documents and the single combined OpenAPI document from the installation root:

```shellscript
npm run voyzu:build-api-reference
```

The generated operation documents are grouped by package beneath `apps/web/app/generated-files` in the Voyzu runtime. The combined OpenAPI document is served from `/voyzu/openapi.json`.

For more information on defining API documentation in package source, see [API patterns](../voyzu-platform-patterns/api-patterns.md).
