# Validation layers

## Validation and operation policy layers

The word **validation** is often used broadly, but in the application there are several distinct layers. Each layer answers a different question and should be implemented in a different place.

The overall flow, from the origin request is:

```
1. API surface
2. API contract schemas
3. Request perimeter validation
4. Business validation
5. Service prerequisites
6. Operation policy
7. Database integrity
8. Response perimeter validation
```

A rule should be enforced at the earliest appropriate layer. Do not add an operation-policy blocker for an operation that should not exist in the API at all.

***

### 1. API surface

#### Question

**Is this operation available at all?**

#### Implementation

Typically implemented by:

```
server/api/
```

and by the routes and HTTP methods exported by the module.

For example:

```
GET     /control-accounts
GET     /control-accounts/{code}
PATCH   /control-accounts/{code}
```

If control accounts are fixed system data, the API should not expose:

```
POST    /control-accounts
DELETE  /control-accounts/{code}
```

Creation and deletion are therefore not operations that need to be rejected by business logic. They are simply not capabilities provided by the API.

#### Principle

> If an operation must never be performed, do not expose the API method.

***

### 2. API contract schemas

#### Question

**What request and response objects does this endpoint accept and produce?**

#### Implementation

Implemented as TypeBox schemas in the owning package's exported types and referenced directly by the module API definition.

```
the owning package's exported types
```

For example:

```ts
export const ControlAccountPatchRequestDto = StrictObject({
  glAccountId: Type.Integer({ minimum: 1 }),
});
export type ControlAccountPatchRequestDto = Type.Static<
  typeof ControlAccountPatchRequestDto
>;
```

The exported value is the runtime schema. The same-name exported type is inferred from that schema for compile-time use. Do not maintain a separate interface and runtime validator for the same DTO.

This DTO allows the linked GL account to be changed.

It does not allow the caller to change:

```
code
name
ledger
status
```

Those changes are therefore not supported by the PATCH operation.

The schema defines both the writable surface and object validity. Use `StrictObject` for every DTO object, including nested DTOs, so undeclared properties are rejected. TypeBox properties are required by default; use `Type.Optional(...)` only when omission is part of the contract.

Object-level rules belong in these schemas, including:

```
primitive types
required and optional properties
literal and enum membership
string length, pattern and format
integer and numeric bounds
array element types and cardinality
nested object shape
additional-property rejection
```

Route definitions reference schemas directly:

```ts
request: {
  path: {
    code: {
      description: "Control-account code.",
      schema: Type.String({ pattern: "^[A-Z0-9_-]+$" }),
    },
  },
  contentType: "application/json",
  body: ControlAccountPatchRequestDto,
},
responses: {
  "200": {
    description: "Updated control account.",
    body: ControlAccountResponseDto,
  },
},
```

The same schemas drive routing validation, generated API documentation and the combined OpenAPI document.

#### Principle

> Define each API object once as an executable TypeBox schema and derive its TypeScript type from that schema.

***

### 3. Request perimeter validation

#### Question

**Does this incoming request conform to the endpoint contract?**

#### Implementation

The shared API router validates the declared path parameters, query string, cookies, content type and body before invoking the handler.

Path and query values arrive from HTTP as strings. The router uses TypeBox `Value.Convert` when checking them so a numeric parameter can be declared as `Type.Integer(...)`. Converted values are discarded after validation: handlers continue to receive the original string values and perform their normal parsing when using them.

Query definitions keep presentation metadata alongside one schema for the complete query object:

```ts
query: {
  parameters: {
    companyId: { description: "Company identifier." },
    search: { description: "Free-text search." },
  },
  schema: Type.Object({
    companyId: Type.Optional(Type.Integer({ minimum: 1 })),
    search: Type.Optional(Type.String({ pattern: "\\S" })),
  }),
},
```

When `request.body` is declared, the body is required. A JSON body must contain valid JSON and conform to its schema. When no request content type is declared, `application/json` is the default. Non-JSON bodies require an explicit content type and must be non-empty.

The router returns HTTP `400` without calling the handler when validation fails:

```json
{
  "code": "INPUT_VALIDATION_ERROR",
  "message": "body/code must not have more than 20 characters"
}
```

Handlers and services must not repeat these structural checks. Normalization may still occur after perimeter validation, but it must not be used as a substitute for declaring the accepted input in the schema.

#### Principle

> Reject malformed API input once, before application code runs.

***

### 4. Business validation

#### Question

**Is this well-formed request internally consistent with business rules?**

#### Implementation

Implemented in:

```
<entity>.validator.ts
```

For example:

```
user.validator.ts
```

This layer validates rules that are not merely properties of an individual DTO field, for example:

```
a password and confirmation must match
a password length depends on the selected access mode
implementer access may only be enabled for administrators
```

For example:

```ts
export function validateUserInput(input: UserCreateRequestDto): string[] {
  const errors: string[] = [];
  if (input.implementerAccess === true && input.role !== "ADMIN") {
    errors.push("implementerAccess can only be enabled for admin users");
  }
  return errors;
}
```

Validators must not repeat checks already expressed by TypeBox, such as required fields, primitive types, enum membership, string length or pattern, integer bounds, array cardinality, or additional properties. They receive typed DTOs after perimeter validation and contain only cross-field or domain rules that do not require database state.

This layer also does not determine:

```
whether the GL account exists
whether the GL account is active
whether the account type is compatible
whether the operation is allowed
```

Those checks require application data and belong later in the flow.

#### Principle

> DTO schemas validate objects. `validator.ts` validates business relationships within an already valid object.

***

### 5. Service prerequisites

#### Question

**Can the service assemble the minimum complete information required to assess and perform the operation?**

#### Implementation

Implemented in:

```
<entity>.service.ts
```

For example:

```
control-account.service.ts
```

The service orchestrates the operation. Its responsibilities include:

```
resolving company and settings scope
checking permissions
opening the transaction
loading the current record
loading the proposed linked record
loading or resolving applicable definitions
assembling the operation-policy input
calling the operation policy
performing the mutation
mapping the result
handling persistence errors
```

For an `UpdateGLAccount` operation, the service must establish that:

```
the current control account exists
the proposed GL account exists
the control-account definition exists
the caller may modify the applicable company settings
the required derived properties are available
```

Examples of service-prerequisite failures include:

```
Control account not found
GL account not found
Company settings are not writable
Control-account definition not found
```

These are not necessarily operation-policy blockers. They mean that the service cannot assemble the minimum information required for the policy to make a valid decision.

The operation policy is like a medical consultant: the service must provide a complete referral with the minimum required information.

#### Principle

> The service gathers and verifies the information required by the policy; the policy should not query for missing information itself.

***

### 6. Operation policy

#### Question

**Given complete information, is this supported operation permitted under the current business circumstances?**

#### Implementation

Implemented in:

```
domain/operation-policy.ts
```

For example:

```
domain/operation-policy.ts
```

The operation-policy file contains pure functions such as:

```
UpdateGLAccount(...)
Deactivate(...)
Reactivate(...)
Delete(...)
```

Each meaningful operation should have its own function, even where two operations currently have identical blockers. Their rules may diverge later.

The functions:

```
receive DTO-shaped input
perform no database access
perform no mutation
throw no infrastructure errors
return all applicable blockers
```

An empty blocker array means the operation is valid.

For example, `UpdateGLAccount` may need:

```
Current control account:
  code
  current GL account ID
  has postings

Proposed GL account:
  ID
  status
  account type

Applicable requirement:
  required account type
```

It can then evaluate rules such as:

```
the proposed GL account is different from the current one
the current control account has no postings
the proposed GL account is active
the proposed GL account has the required account type
```

A typical result is:

```ts
interface OperationBlocker {
  code: string;
  message: string;
}
```

The client can use blockers to disable or explain controls.

The server uses the same blockers to authoritatively reject the operation.

```
Client use:
  guidance and presentation

Server use:
  authoritative enforcement
```

#### Principle

> The policy evaluates business validity using complete inputs. It does not validate malformed requests or resolve missing records.

***

### 7. Database integrity

#### Question

**Are structural invariants protected even if application logic fails or concurrent changes occur?**

#### Implementation

Implemented in:

```
database DDL
constraints
foreign keys
transactions
repository mutation queries
```

Examples include:

```
NOT NULL constraints
foreign keys
unique constraints
check constraints
transaction isolation
conditional updates
```

Not every business rule belongs in the database, but structural integrity should not depend solely on client or service behaviour.

#### Principle

> Application policy expresses business rules; the database protects fundamental data integrity.

***

### 8. Response perimeter validation

#### Question

**Does the data returned by the application conform to its response DTO?**

#### Implementation

The repository returns a database row and the module mapper converts it into a response DTO. The API router validates the final HTTP response against the response definition declared by the route:

```text
database row
  -> <entity>.mapper.ts
  -> response DTO
  -> HTTP response
  -> router TypeBox validation
```

An invalid response indicates a defect or data-integrity problem rather than invalid caller input. Possible causes include:

```text
unexpected or legacy database data
an incomplete repository query
an incorrect row-to-DTO mapping
a response DTO and mapper that have drifted apart
missing system-generated audit information
```

The router checks that the status is declared, that the response content type is correct, and, for JSON responses with a body schema, that the body conforms to that schema. A response with a body schema defaults to `application/json`; PDF, CSV and other response types must declare their content type explicitly.

In development, an invalid response throws so the mismatch is found immediately. In production, it logs the validation error and returns the response so a validation diagnostic does not itself cause an application outage.

Response object constraints belong in the response TypeBox schema, including nested DTOs and audit metadata. Do not add `validateResponse`, `checkResponse`, `withResponseValidation`, or field-map validation to mappers and services. Those duplicate the contract and can drift away from the schema enforced by the router.

#### Principle

> Validate the final response once at the API perimeter: fail fast in development and report the mismatch without interrupting production.

***

## Control-account example

Control accounts are fixed system data.

The layers therefore work as follows:

### Creation

```
API surface:
  No POST method exists.
```

No creation policy is required.

### Deletion

```
API surface:
  No DELETE method exists.
```

No delete policy is required.

### Changing code, name, ledger, or status

```
Request DTO:
  These fields are not present in ControlAccountPatchRequestDto.
```

These changes are not supported by the API.

### Changing the linked GL account

```
API surface:
  PATCH exists.

Request DTO:
  glAccountId is writable.

ControlAccountPatchRequestDto:
  validates at the router perimeter that glAccountId is a positive integer.

control-account.service.ts:
  resolves scope;
  loads the current control account;
  loads the proposed GL account;
  resolves the fixed control-account requirement;
  assembles the minimum policy input.

domain/operation-policy.ts:
  determines whether the proposed GL-account change is permitted.

control-account.repo.ts / database:
  performs the update and protects persistence integrity.

control-account.mapper.ts / response DTO:
  maps the stored row into ControlAccountResponseDto;
  the router validates the complete response, including audit metadata;
  throws in development or logs an error in production if it is invalid.
```

***
