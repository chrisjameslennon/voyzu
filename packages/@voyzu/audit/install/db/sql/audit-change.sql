CREATE TABLE IF NOT EXISTS audit_change (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 10000),
    audit_event_id BIGINT NOT NULL,
    field_path TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,

    CONSTRAINT fk_audit_event FOREIGN KEY (audit_event_id) REFERENCES audit_event(id),
    CONSTRAINT chk_value_present CHECK (old_value IS NOT NULL OR new_value IS NOT NULL)
);
