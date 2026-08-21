DROP TRIGGER IF EXISTS organization_audit_trigger ON organization;
CREATE TRIGGER organization_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON organization
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/organization');

DROP TRIGGER IF EXISTS company_audit_trigger ON company;
CREATE TRIGGER company_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON company
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/organization');

DROP TRIGGER IF EXISTS app_user_assignment_audit_trigger ON app_user_assignment;
CREATE TRIGGER app_user_assignment_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON app_user_assignment
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/organization');

DROP TRIGGER IF EXISTS currency_audit_trigger ON currency;
CREATE TRIGGER currency_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON currency
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/organization');

DROP TRIGGER IF EXISTS country_audit_trigger ON country;
CREATE TRIGGER country_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON country
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/organization');
