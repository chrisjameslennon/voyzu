export interface OrganizationSwitcherProps {
  isCollapsed: boolean;
  allCompanies?: boolean;
  /** Optional consumer-owned selection endpoint; Organization supplies the default. */
  selectionUrl?: string;
  onSelected?: (organizationId: number) => void;
}
