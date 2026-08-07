# Validation layers

## Validation and operation policy layers

The word **validation** is often used broadly, but in the application there are several distinct layers. Each layer answers a different question and should be implemented in a different place.

The overall flow, from the origin request is:

```
1. API surface
2. Request DTO
3. Request validation
4. Service prerequisites
5. Operation policy
6. Database integrity
7. Return data DTO
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

### 2. Request DTO

#### Question

**Which properties may be supplied or changed through the operation?**

#### Implementation

Implemented in the request DTOs, typically in:

```
the owning package's exported types
```

For example:

```ts
interface ControlAccountPatchRequestDto {
  glAccountId: number;
}
```

This DTO allows the linked GL account to be changed.

It does not allow the caller to change:

```
code
name
ledger
status
```

Those changes are therefore not supported by the PATCH operation.

The DTO defines the writable surface of the API. A property that is not present in the request DTO is not available for modification.

#### Principle

> The API method defines the broad operation. The request DTO defines which changes are possible within that operation.

***

### 3. Request validation

#### Question

**Is the supplied request correctly formed?**

#### Implementation

Implemented in:

```
<entity>.validator.ts
```

For example:

```
control-account.validator.ts
```

This layer validates the shape and basic values of the request:

```
glAccountId is present
glAccountId is an integer
glAccountId is greater than zero
```

Every DTO validator must define an exhaustive field-validator map. This is non-negotiable:

```ts
type FieldValidator<T> = (value: T) => string | null;

function createPatchValidator() {
  return {
    glAccountId: validateGlAccountId,
  } satisfies {
    [K in keyof ControlAccountPatchRequestDto]-?: FieldValidator<ControlAccountPatchRequestDto[K]>;
  };
}
```

The mapped type ties the validator to the DTO at compile time. Adding, removing, or renaming a DTO property therefore requires the validator to be updated in the same change. The `-?` is required: optional DTO properties must still have an explicit validator that decides how `undefined` is handled.

Nested and cross-field rules may run after the field map, but they do not replace it. Validators that first narrow an `unknown` request must still declare the exhaustive typed map alongside their structural checks.

Typical failures produce:

```
InputValidationError
```

This layer does not determine:

```
whether the GL account exists
whether the GL account is active
whether the account type is compatible
whether the operation is allowed
```

Those checks require application data and belong later in the flow.

#### Principle

> `validator.ts` validates the request object, not the business circumstances surrounding the request.

***

### 4. Service prerequisites

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

### 5. Operation policy

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

### 6. Database integrity

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

### 7. Return data DTO

#### Question

**Does the data returned by the application conform to its response DTO?**

#### Implementation

The repository returns a database row, and the module mapper converts that row into the response DTO. Before the service returns the DTO, it validates the mapped response using `validateResponse` from the entity's validator:

```text
database row
  -> <entity>.mapper.ts
  -> response DTO
  -> validateResponse
  -> service caller or API response
```

For example:

```ts
import { checkResponse } from "@voyzu/capability/validation";

function checkedResponse(dto: CompanyResponseDto): CompanyResponseDto {
  return checkResponse(
    dto,
    validateResponse(dto),
    `company (id=${dto.id})`,
  );
}
```

An invalid response indicates a defect or data-integrity problem rather than invalid caller input. Possible causes include:

```text
unexpected or legacy database data
an incomplete repository query
an incorrect row-to-DTO mapping
a response DTO and mapper that have drifted apart
missing system-generated audit information
```

In development, response validation must throw an error so the mismatch is found and corrected immediately. In production, it must log the validation error and return the response so a validation diagnostic does not itself cause an application outage.

Entity response validators should use the same exhaustive field-map pattern as request validation. Every property in the response DTO, including nested audit metadata, must be accounted for. All service paths that return the entity—including reads and the results of create, update, patch, and state transitions—must pass through the checked response.

Large composed report and posting DTOs must also be checked at the final service boundary. They may use `withResponseValidation` from `@voyzu/capability/validation`, which checks the complete returned object recursively for invalid DTO values and applies the same development and production policy. Their typed construction remains the compile-time contract; reusable entity DTOs nested within them should still use their entity's exhaustive validator when mapped.

#### Principle

> Validate the mapped response DTO at the final service boundary: fail fast in development and report the mismatch without interrupting production.

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

control-account.validator.ts:
  validates that glAccountId is a positive integer.

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

control-account.mapper.ts / validateResponse:
  maps the stored row into ControlAccountResponseDto;
  validates the complete response, including audit metadata;
  throws in development or logs an error in production if it is invalid.
```

***
