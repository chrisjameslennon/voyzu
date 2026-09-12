# API Routing Contract

## API and Documentation Routing

```typescript
// voyzu.package.ts — proposed shape
// One illustrative route showing path, query, body and cookie declarations.
// DTOs would normally be imported from separate schema files.

import Type from "typebox";

export default {
  contracts: {
    apiRouting: {
      // Every API route in this package must fall within a declared root.
      roots: ["/finance"],

      // Flat map: keys are stable, system-wide route identifiers.
      // Modules may organise the source files but are not part of this shape.
      routes: {
        "finance.journals.update": {
          // HTTP routing uses method + path.
          // The route ID is also used for documentation and OpenAPI operationId.
          method: "PATCH",
          path: "/finance/journals/[code]",

          // Operation title and explanation used in generated documentation.
          summary: "Update Journal Entry",
          description:
            "Updates a draft journal entry. Optionally remembers it as the last viewed journal.",

          request: {
            // Named URL parameters correspond to placeholders in the path.
            path: {
              code: {
                description: "Journal entry business code.",
                required: true,
                schema: Type.String({
                  pattern: "^[A-Z0-9][A-Z0-9_-]*$",
                }),
              },
            },

            // Query metadata describes parameters; the schema defines their shape.
            // Example URL: /finance/journals/JNL-001?remember=true
            // Shown as a string because URL parsing/conversion needs explicit rules.
            query: {
              parameters: {
                remember: {
                  description: "Set a cookie remembering this journal.",
                  required: false,
                },
              },
              schema: Type.Object(
                {
                  remember: Type.Optional(
                    Type.Union([
                      Type.Literal("true"),
                      Type.Literal("false"),
                    ]),
                  ),
                },
                { additionalProperties: false },
              ),
            },

            // Optional cookie supplied by the browser.
            // Declaring cookies documents them; the handler implements their use.
            cookies: {
              lastJournal: {
                description: "Previously remembered journal code.",
                required: false,
                example: "JNL-001",
              },
            },

            // Media type and schema of the request body.
            contentType: "application/json",
            body: Type.Object(
              {
                description: Type.String({ minLength: 1 }),
              },
              { additionalProperties: false },
            ),
          },

          // Each status code describes a possible response.
          responses: {
            "200": {
              description: "The updated journal entry.",
              contentType: "application/json",
              body: Type.Object(
                {
                  code: Type.String(),
                  description: Type.String(),
                },
                { additionalProperties: false },
              ),

              // Cookie set by the handler when remember=true.
              // These attributes describe the intended Set-Cookie behaviour.
              cookies: {
                lastJournal: {
                  description: "The journal code to remember.",
                  required: false,
                  example: "JNL-001",
                  action: "set", // Also supports "clear".
                  httpOnly: true,
                  secure: true,
                  sameSite: "lax",
                  path: "/",
                  maxAgeSeconds: 86400,
                },
              },
            },

            "400": {
              description: "The request is invalid.",
              contentType: "application/json",
              body: Type.Object({
                message: Type.String(),
              }),
            },

            "401": {
              description: "Authentication is required.",
              contentType: "application/json",
              body: Type.Object({
                message: Type.String(),
              }),
            },

            "403": {
              description: "The caller cannot update this journal.",
              contentType: "application/json",
              body: Type.Object({
                message: Type.String(),
              }),
            },

            "404": {
              description: "The journal entry was not found.",
              contentType: "application/json",
              body: Type.Object({
                message: Type.String(),
              }),
            },

            "409": {
              description: "The journal is no longer a draft.",
              contentType: "application/json",
              body: Type.Object({
                message: Type.String(),
              }),
            },

            "500": {
              description: "An unexpected server error occurred.",
              contentType: "application/json",
              body: Type.Object({
                message: Type.String(),
              }),
            },

            // For an operation returning no content, declare a response such as:
            // "204": { description: "Operation completed." }
            // Omit body and contentType for that response.
          },

          // Load implementation code only when needed.
          // The handler performs the operation and implements cookie behaviour.
          // Authentication/authorization remain API runtime/handler concerns;
          // documenting 401 and 403 does not itself enforce them.
          loadHandler: () =>
            import("./modules/journals/server/api/journal.http.handlers")
              .then(module => module.handleUpdate),
        },
      },
    },

    apiDocumentation: {
      // Optional documentation organisation, independent of source modules.
      // Routes without a group appear in default package API documentation.
      groups: {
        "finance.journals": {
          title: "Journal Entries",
          description: "Retrieve and manage financial journal entries.",

          // Route references determine group membership and display order.
          // References may include routes owned by other installed packages.
          routes: ["finance.journals.update"],
        },
      },
    },
  },
};
```

## But

Cookies are not right, secure can be default. cookie shape validation may be worth while

```
cookies: {
  lastJournal: {
    description: "The journal code to remember.",
    required: false,
    schema: Type.String({
      pattern: "^[A-Z0-9][A-Z0-9_-]*$",
      examples: ["JNL-001"],
    }),
  },
},
```

## Contract Validation

- must match routes
- must conform to interface
- api documentation must cover all routes

## changes

tags are gone, use route id as operation id
