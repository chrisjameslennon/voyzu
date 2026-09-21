# Audit package: primary-key capture TODO

## Approach

Discover the audited table's primary-key columns when attaching its audit trigger, then pass those column names as trigger arguments. This supports composite keys and keys named something other than `id` or `code`, without a catalog lookup on every audited row.

The installation SQL creates the table first, then dynamically generates and executes its `CREATE TRIGGER` statement:

1. Identify the table and its primary-key constraint in PostgreSQL's catalogs (`pg_constraint` and `pg_attribute`).
2. Read the primary-key column names in constraint order.
3. Generate the trigger attachment with those names as arguments, quoting identifiers and argument literals correctly.
4. Execute the generated statement.

Only the attachment is generated dynamically. During ordinary writes, the trigger reads its stored arguments and extracts the corresponding values from `NEW` for inserts and updates, or `OLD` for deletes.

## Proposed trigger arguments

| Position | Meaning |
| --- | --- |
| `TG_ARGV[0]` | Package code. |
| `TG_ARGV[1]` | Display-code field, such as `code`. |
| `TG_ARGV[2...]` | Primary-key column names discovered during attachment. |

For `ap_control_account`, whose primary key is `(finance_organization_id, code)`, installation would generate:

```sql
CREATE TRIGGER ap_control_account_audit_trigger
BEFORE INSERT OR UPDATE OR DELETE ON ap_control_account
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_fn(
  '@voyzu/ledger',
  'code',
  'finance_organization_id',
  'code'
);
```

This is the proposed argument convention; the trigger function must be updated to consume the primary-key arguments.

## Key storage

Store the captured key as a JSONB object containing the column names and their values. For example:

```json
{
  "finance_organization_id": 1,
  "code": "PAYABLES"
}
```

Use the same representation for single-column keys, for example `{ "id": 15451 }`. Keep the human-readable entity code separate.

This replaces the assumption that `COALESCE(row.id, row.code)` uniquely identifies every affected row. The audit schema, semantic contract, DTOs and consumers will need to accommodate the structured key; the exact replacement for the existing text `entityId` remains to be designed.

## Implementation tasks

- Add reusable installation SQL for discovering primary keys and generating trigger attachments.
- Update the trigger to extract every configured key field and store the JSONB object.
- Update audit persistence, contracts and consumers together.
- Regenerate the attachment whenever a migration changes a table's primary key.
- Define explicit handling for tables without a primary key, rather than silently falling back to `code`.
- Decide how to retain both old and new identifiers when an update changes a primary-key value.
- Keep organization attribution separate: capturing `finance_organization_id` in the key does not automatically populate the audit record's organization reference.

The design avoids per-row primary-key discovery. Its remaining extraction and storage overhead should be measured during implementation before making performance guarantees.
