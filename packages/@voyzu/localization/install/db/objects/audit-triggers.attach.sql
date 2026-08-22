DROP TRIGGER IF EXISTS currency_audit_trigger ON currency;
CREATE TRIGGER currency_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON currency
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/localization');

DROP TRIGGER IF EXISTS country_audit_trigger ON country;
CREATE TRIGGER country_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON country
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@voyzu/localization');
