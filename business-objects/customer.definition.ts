import type { Party } from "./party.definition";
import type { CustomerAccount } from "./customer-account.definition";

/**
 * The canonical composed Customer business object.
 *
 * The root customer identity is supplied by the Party provider.
 * Package-specific customer data is composed beneath properties such as
 * `account`.
 */
export interface Customer extends Party {
  account: CustomerAccount;
}
