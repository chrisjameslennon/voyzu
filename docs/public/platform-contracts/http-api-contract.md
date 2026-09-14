# HTTP API Contract

## Example package contract definition with explanations

```typescript
// voyzu.package.ts - HTTP API routing and documentation contracts shown.
// One illustrative route showing path, query, body and cookie declarations.
// All schemas below reference DTOs; DTO imports are not shown.
// Other package properties are omitted. Error responses below are illustrative;
// actual routes must declare all statuses their handlers/runtime can return.

export default {
  contracts: {
    httpApiRouting: {
      // Every HTTP API route in this package must fall within a declared root.
      roots: ["/finance"],

      // Flat map: keys are stable, system-wide route identifiers.
      // A package may import definitions from modules and flatten
      routes: {
        "finance.journals.update": {
          // HTTP routing uses method + path.
          // The route ID is also used for documentation and OpenAPI operationId.
          method: "PATCH",
          path: "/finance/journals/[code]",

          // Short operation title used in generated documentation and OpenAPI.
          // OpenAPI tags are derived from the documentation section.
          summary: "Update Journal Entry",
          // Used in the documentation page and OpenAPI operation description.
          description:
            "Updates a draft journal entry and refreshes the authenticated session cookie. Posted journals cannot be changed. Optionally notifies interested users about the update.",

          request: {
            // Named URL parameters correspond to placeholders in the path.
            path: {
              code: {
                description: "Journal entry business code.",
                required: true,
                schema: JournalCodeDto,
              },
            },

            // Query metadata describes parameters; the schema defines their shape.
            // Example URL: /finance/journals/JNL-001?notify=true
            // The query DTO defines notify as an optional "true"/"false" string;
            // URL parsing/conversion needs explicit rules.
            query: {
              parameters: {
                notify: {
                  description: "Notify interested users about the update.",
                  required: false,
                },
              },
              schema: JournalUpdateQueryDto,
            },

            // Every listed cookie name is required in the request.
            // A missing name returns 400 INPUT_VALIDATION_ERROR.
            // Only presence is checked; values are not schema-validated.
            // Extra cookies are allowed; omit cookies for no presence checks.
            // Authentication still verifies the session token separately.
            cookies: ["voyzu_auth"],

            // Media type and schema of the request body.
            contentType: "application/json",
            body: JournalUpdateRequestDto,
          },

          // Each status code describes a possible response.
          responses: {
            "200": {
              description: "The updated journal entry.",
              contentType: "application/json",
              body: JournalUpdateResponseDto,

              // Every listed name must appear in this response's Set-Cookie.
              // A missing name throws in development; production logs the error
              // and returns the original response, matching output validation.
              // Setting or clearing a cookie both count as presence.
              // Extra cookies are allowed; omit cookies for no presence checks.
              // Values and attributes are not validated by this contract.
              // Shared helpers centralize set/clear behaviour and cookie options
              // such as secure, httpOnly, sameSite, path and max age.
              cookies: ["voyzu_auth"],
            },

            
            // For an operation returning no content, declare a response such as:
            // "204": { description: "Operation completed." }
            // Omit body and contentType for that response.

            // illustrative "unhappy path" responses
            "400": {
              description: "The request is invalid.",
              contentType: "application/json",
              body: InputValidationErrorResponseDto,
            },

            "409": {
              description: "The journal is no longer a draft.",
              contentType: "application/json",
              body: ConflictErrorResponseDto,
            },


          },

          // Load implementation code only when needed.
          // The handler performs the operation and uses shared cookie helpers.
          // Authentication/authorization remain HTTP API runtime/handler concerns;
          // documenting 401 and 403 does not itself enforce them.
          loadHandler: () =>
            import("./modules/journals/server/http-api/journal.http.handlers")
              .then(module => module.handleUpdate),
        },
      },
    },

    httpApiDocumentation: {
      // Documentation organisation is independent of source modules and paths.
      // Every route must belong to a group within a section.
      // Declaration order controls section, group and operation display order.
      sections: {
        "finance.general-ledger": {
          // OpenAPI tag: "@voyzu/finance: General Ledger" (package + section title).
          title: "General Ledger",
          // Optional navigationHeadingId merges groups across packages under this title.
          // Platform sections use navigationHeadingId: "voyzu.platform", title: "Platform".
          // Used as section introductory text and the OpenAPI tag description.
          description: "Manage journals and ledger postings.",
          groups: {
            "finance.journals": {
              // Each group has a documentation page, with operation anchors.
              // Groups provide the second navigation level within a package.
              title: "Journal Entries",
              description: "Retrieve and manage financial journal entries.",
              // List stable HTTP API route IDs in display order.
              // References may include routes owned by other installed packages.
              // Operation details come from the route definitions.
              routes: ["finance.journals.update"],
            },
          },
        },
      },
    },
  },
};
```

## Registration and validation

Package definitions register HTTP routes through `contracts.httpApiRouting` and documentation through `contracts.httpApiDocumentation`. Source modules may export route maps for the package to import and flatten. Module exports alone do not register HTTP routes. HTTP roots belong to the routing contract, not package.json.

Composition validates the complete registry before writing generated output. Route IDs must be globally unique; method/path combinations must also be unique, including equivalent parameterized paths with different placeholder names. Paths must fall within their owning package's declared roots. Root ownership cannot overlap between packages.

Route, section and group IDs are namespaced identifiers, such as `finance.journals.update`. Use letters, digits, underscores and hyphens within dot-separated segments. IDs start with a lowercase namespace, and IDs differing only by case are rejected to avoid generated-file collisions.

Path parameter declarations must match the path placeholders and cannot be optional. Query metadata must match DTO properties; explicit required flags must agree with the DTO. Composition also validates schemas, required metadata, cookie-name arrays, response declarations and lazy handler loaders. Handler loaders are not invoked during composition or documentation generation.

## Request and response behaviour

- Path and query DTOs validate strings without coercion. Query parameters declared as arrays receive arrays of strings. Repeated scalar parameters return `400 INPUT_VALIDATION_ERROR`; undeclared query parameters are ignored. Handlers explicitly convert accepted values when needed.
- Request cookie declarations list required names. Missing names return `400 INPUT_VALIDATION_ERROR`. Extra cookies are allowed. Cookie values and attributes are not validated by the HTTP contract; authentication verifies session tokens separately.
- Response cookie declarations list names required in outgoing `Set-Cookie` for that status. Setting and clearing both count as presence. Missing names throw in development; production logs the error and returns the original response, matching response-shape validation. This check also runs for responses without bodies.
- Shared helpers from `@voyzu/http-api/cookies` own cookie policy, lifetimes and set/clear behaviour. Handlers and server actions use the same helpers.
- Omit both body and contentType to document a response without a body. Documentation then omits the media type and body example; OpenAPI omits response content.

## Documentation and OpenAPI

Installed-package navigation follows package → section → group → operation. Platform packages share one Platform navigation section, with one group and operations page per package, labelled with its package name. A section can declare `navigationHeadingId` (a lowercase namespaced identifier) to place its groups directly under a shared navigation heading. Sections with the same heading ID merge in declaration order and must have identical titles; that title supplies the heading label. Without this metadata, the package heading and section hierarchy apply. Platform contracts declare `navigationHeadingId: "voyzu.platform"` and `title: "Platform"`; the generator has no platform-specific grouping or label. Each group has a page with operation anchors. Section, group and operation declaration order controls display order. Operation filenames and anchors use stable route IDs rather than summaries or HTTP paths.

Every route must appear exactly once in a documentation group's ordered `routes` list. Cross-package references are supported; composition rejects missing coverage, unresolved references and repeated references, including duplicates within one group. The routing contract owns each operation's required `summary` and `description`, along with parameter and response descriptions. The documentation contract supplies section and group titles, introductory descriptions and route ordering. Declare these contracts directly in `voyzu.package.ts`; source modules may supply the route definitions.

Section titles must be unique within a package. OpenAPI tags use `<documentation package name>: <section title>`, for example `@voyzu/finance: General Ledger`. This allows the same section title in different packages. Section descriptions supply top-level OpenAPI tag descriptions. Groups provide the second navigation level in Voyzu. Each route ID becomes its OpenAPI `operationId`.

Page routes may declare `httpApiDocumentationGroupId`. Composition validates the reference and resolves its generated URL. If omitted, the implementor menu links to the HTTP API documentation landing page at `/http-api-reference`.

## Refreshing generated output

Use `npm run voyzu:compose -- --routing-only` to refresh HTTP API contracts, page/navigation registries and documentation. This preserves internal API composition, runtime configuration and installed-package selection. Generated HTTP registrations and reference files live under `apps/web/.generated/http-api-routes` and `apps/web/.generated/http-api-reference`.
