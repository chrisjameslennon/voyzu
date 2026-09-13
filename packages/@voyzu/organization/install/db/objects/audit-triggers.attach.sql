DROP TRIGGER IF EXISTS organization_audit_trigger ON organization;
CREATE TRIGGER organization_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON organization
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/organization');

DROP TRIGGER IF EXISTS organization_user_access_audit_trigger ON organization_user_access;
CREATE TRIGGER organization_user_access_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON organization_user_access
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/organization');

DROP TRIGGER IF EXISTS document_link_audit_trigger ON document_link;
CREATE TRIGGER document_link_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON document_link
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/organization');
