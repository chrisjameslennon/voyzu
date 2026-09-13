export interface OrganizationSwitcherProps {
  isCollapsed: boolean;
  allCompanies?: boolean;
  /** Optional consumer-owned selection endpoint; ERP supplies the default. */
  selectionUrl?: string;
  onSelected?: (organizationId: number) => void;
}
