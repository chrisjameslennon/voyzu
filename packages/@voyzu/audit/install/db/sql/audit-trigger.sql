CREATE OR REPLACE FUNCTION audit_trigger_fn() RETURNS TRIGGER AS $$
DECLARE
  v_event_id    BIGINT;
  v_company_id  BIGINT;
  v_entity_id   TEXT;
  v_entity_code TEXT;
  v_action      TEXT;
  v_old_record  JSONB;
  v_new_record  JSONB;
  v_key         TEXT;
  v_old_value   JSONB;
  v_new_value   JSONB;
  v_entity_type TEXT;
  v_actor_type  TEXT;
  v_actor_id    TEXT;
  v_mutation_id TEXT;
  v_package_code TEXT;
BEGIN
  -- Prevent accidental recursion
  IF TG_TABLE_NAME IN ('audit_event', 'audit_change') THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  IF TG_NARGS < 1 OR NULLIF(BTRIM(TG_ARGV[0]), '') IS NULL THEN
    RAISE EXCEPTION 'audit_trigger_fn requires a package code for %.%', TG_TABLE_SCHEMA, TG_TABLE_NAME;
  END IF;
  v_package_code := BTRIM(TG_ARGV[0]);

  v_action := TG_OP;

  IF TG_OP = 'INSERT' THEN
    NEW.creation_date := COALESCE(NEW.creation_date, NOW());
    NEW.creation_actor_type := COALESCE(NEW.creation_actor_type, 'SYSTEM'::actor_type);
    NEW.creation_mutation_id := COALESCE(NEW.creation_mutation_id, gen_random_uuid());
    NEW.updated_date := COALESCE(NEW.updated_date, NEW.creation_date);
    NEW.updated_actor_type := COALESCE(NEW.updated_actor_type, NEW.creation_actor_type);
    NEW.updated_user_id := COALESCE(NEW.updated_user_id, NEW.creation_user_id);
    NEW.updated_mutation_id := COALESCE(NEW.updated_mutation_id, NEW.creation_mutation_id);
  ELSIF TG_OP = 'UPDATE' THEN
    IF to_jsonb(NEW) - ARRAY[
      'creation_date','creation_actor_type','creation_user_id','creation_mutation_id',
      'updated_date','updated_actor_type','updated_user_id','updated_mutation_id',
      'deletion_date','deletion_actor_type','deletion_user_id','deletion_mutation_id'
    ] IS DISTINCT FROM to_jsonb(OLD) - ARRAY[
      'creation_date','creation_actor_type','creation_user_id','creation_mutation_id',
      'updated_date','updated_actor_type','updated_user_id','updated_mutation_id',
      'deletion_date','deletion_actor_type','deletion_user_id','deletion_mutation_id'
    ] THEN
      IF NEW.updated_mutation_id IS NULL OR NEW.updated_mutation_id IS NOT DISTINCT FROM OLD.updated_mutation_id THEN
        NEW.updated_date := NOW();
        IF NEW.updated_actor_type IS NULL OR NEW.updated_actor_type IS NOT DISTINCT FROM OLD.updated_actor_type THEN
          NEW.updated_actor_type := 'SYSTEM'::actor_type;
        END IF;
        IF NEW.updated_user_id IS NOT DISTINCT FROM OLD.updated_user_id THEN
          NEW.updated_user_id := NULL;
        END IF;
        NEW.updated_mutation_id := gen_random_uuid();
      ELSE
        NEW.updated_date := COALESCE(NEW.updated_date, NOW());
        NEW.updated_actor_type := COALESCE(NEW.updated_actor_type, 'SYSTEM'::actor_type);
      END IF;
    END IF;
  END IF;

  -- Entity type: omit schema if public, else schema.table
  IF TG_TABLE_SCHEMA = 'public' THEN
    v_entity_type := TG_TABLE_NAME;
  ELSE
    v_entity_type := TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME;
  END IF;

  -- INSERT / UPDATE: use NEW
  IF TG_OP IN ('INSERT','UPDATE') THEN
    v_new_record := to_jsonb(NEW);
    v_entity_id := COALESCE(v_new_record->>'id', v_new_record->>'code');
    v_entity_code := v_new_record->>'code';
    v_company_id := NULLIF(v_new_record->>'company_id','')::BIGINT;
    IF TG_OP = 'INSERT' THEN
      v_actor_type := v_new_record->>'creation_actor_type';
      v_actor_id := v_new_record->>'creation_user_id';
      v_mutation_id := v_new_record->>'creation_mutation_id';
    ELSE
      v_actor_type := v_new_record->>'updated_actor_type';
      v_actor_id := v_new_record->>'updated_user_id';
      v_mutation_id := v_new_record->>'updated_mutation_id';
    END IF;
  END IF;

  -- UPDATE / DELETE: use OLD
  IF TG_OP IN ('UPDATE','DELETE') THEN
    v_old_record := to_jsonb(OLD);
    IF TG_OP = 'DELETE' THEN
      v_entity_id := COALESCE(v_old_record->>'id', v_old_record->>'code');
      v_entity_code := v_old_record->>'code';
      v_company_id := NULLIF(v_old_record->>'company_id','')::BIGINT;
      v_actor_type := COALESCE(v_old_record->>'deletion_actor_type', v_old_record->>'updated_actor_type');
      v_actor_id := COALESCE(v_old_record->>'deletion_user_id', v_old_record->>'updated_user_id');
      v_mutation_id := COALESCE(v_old_record->>'deletion_mutation_id', v_old_record->>'updated_mutation_id');
    END IF;
  END IF;

  v_mutation_id := COALESCE(NULLIF(v_mutation_id, ''), gen_random_uuid()::TEXT);

  -- Insert audit event
  INSERT INTO audit_event (
    package_code,
    company_id,
    actor_type,
    actor_id,
    action,
    entity_type,
    entity_id,
    entity_code,
    mutation_id
  ) VALUES (
    v_package_code,
    v_company_id,
    v_actor_type::actor_type,
    v_actor_id,
    v_action,
    v_entity_type,
    v_entity_id,
    v_entity_code,
    v_mutation_id
  )
  RETURNING id INTO v_event_id;

  -- UPDATE: record changed fields
  IF TG_OP = 'UPDATE' THEN
    FOR v_key IN SELECT jsonb_object_keys(v_new_record)
    LOOP
      IF v_key IN (
        'creation_date','creation_actor_type','creation_user_id',
        'creation_mutation_id',
        'updated_date','updated_actor_type','updated_user_id',
        'updated_mutation_id',
        'deletion_date','deletion_actor_type','deletion_user_id',
        'deletion_mutation_id'
      ) THEN
        CONTINUE;
      END IF;

      v_old_value := v_old_record->v_key;
      v_new_value := v_new_record->v_key;

      IF v_old_value IS DISTINCT FROM v_new_value THEN
        INSERT INTO audit_change (
          audit_event_id,
          field_path,
          old_value,
          new_value
        )
        VALUES (
          v_event_id,
          v_key,
          v_old_value,
          v_new_value
        );
      END IF;
    END LOOP;

    RETURN NEW;
  END IF;

  -- INSERT: record all non-null fields
  IF TG_OP = 'INSERT' THEN
    FOR v_key IN SELECT jsonb_object_keys(v_new_record)
    LOOP
      IF v_key IN (
        'creation_date','creation_actor_type','creation_user_id',
        'creation_mutation_id',
        'updated_date','updated_actor_type','updated_user_id',
        'updated_mutation_id',
        'deletion_date','deletion_actor_type','deletion_user_id',
        'deletion_mutation_id'
      ) THEN
        CONTINUE;
      END IF;

      v_new_value := v_new_record->v_key;
      IF v_new_value IS NOT NULL THEN
        INSERT INTO audit_change (
          audit_event_id,
          field_path,
          old_value,
          new_value
        )
        VALUES (
          v_event_id,
          v_key,
          NULL,
          v_new_value
        );
      END IF;
    END LOOP;

    RETURN NEW;
  END IF;

  -- DELETE: record all non-null old fields
  IF TG_OP = 'DELETE' THEN
    FOR v_key IN SELECT jsonb_object_keys(v_old_record)
    LOOP
      IF v_key IN (
        'creation_date','creation_actor_type','creation_user_id',
        'creation_mutation_id',
        'updated_date','updated_actor_type','updated_user_id',
        'updated_mutation_id',
        'deletion_date','deletion_actor_type','deletion_user_id',
        'deletion_mutation_id'
      ) THEN
        CONTINUE;
      END IF;

      v_old_value := v_old_record->v_key;
      IF v_old_value IS NOT NULL THEN
        INSERT INTO audit_change (
          audit_event_id,
          field_path,
          old_value,
          new_value
        )
        VALUES (
          v_event_id,
          v_key,
          v_old_value,
          NULL
        );
      END IF;
    END LOOP;

    RETURN OLD;
  END IF;

  RETURN NULL; -- unreachable
END;
$$ LANGUAGE plpgsql;
