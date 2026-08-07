import type { InstalledPackageStatus } from "../../../types";

export interface InstalledPackageRow {
  id: number;
  code: string;
  description: string;
  status: InstalledPackageStatus;
  nav_order: number;
}
