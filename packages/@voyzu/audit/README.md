# Voyzu Audit

Preinstalled Voyzu package providing audit stamps, event persistence, APIs and
audit UI components.

Audit events may have a null `company_id`. The standalone schema deliberately
does not add a foreign key to a business package's `company` table.
