DROP TRIGGER IF EXISTS app_user_audit_trigger ON app_user;
CREATE TRIGGER app_user_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON app_user
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/auth');
