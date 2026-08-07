# Financial Document Types

Financial Document Types is the read-only catalogue of documents Voyzu can post.

## Concepts

* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains document types, posting, and reversals.
* [What Is a Financial Ledger?](../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains immutable records and subledgers.
* [Control Accounts](../../voyzu-core-concepts/control-accounts.md) explains ledger-backed posting targets.

## Viewing document types

The list shows code, name, purpose, supporting ledger, and status. Search the catalogue or filter by purpose, supporting ledger, or status. Click a row to open its detail; Export can output the current catalogue.

The detail screen separates **Posting** from **Details**. Posting describes the ledger behavior and account roles. Details describes the document's identity and business purpose.

## In use

Document types define supported financial behavior. They are not user-created transaction templates, and their codes and posting semantics must remain stable after documents have been recorded.

## Making changes

The screen is read-only. Document types are supplied by the application and changed through development and deployment, including the corresponding validation and posting logic. Use Financial Document Defaults to select organization or company defaults for the supported types.

## See also

* [Financial Document Defaults](financial-document-defaults.md)
* [Company Financial Document Types](../company-ledger/financial-document-types.md)
* [Journals](../company-ledger/journal-entries.md)
