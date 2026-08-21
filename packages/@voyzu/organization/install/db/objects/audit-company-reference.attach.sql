DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'audit_event_company_fk'
      AND conrelid = 'audit_event'::regclass
  ) THEN
    ALTER TABLE audit_event
      ADD CONSTRAINT audit_event_company_fk
      FOREIGN KEY (company_id) REFERENCES company(id);
  END IF;
END $$;
