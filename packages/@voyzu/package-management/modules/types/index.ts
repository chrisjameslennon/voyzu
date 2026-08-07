export type InstalledPackageStatus = "ACTIVE" | "INACTIVE";

export interface InstalledPackageResponseDto {
  id: number;
  code: string;
  description: string;
  repository: string;
  status: InstalledPackageStatus;
  navOrder: number;
  preinstalled: boolean;
  hasTopNavigation: boolean;
  required: boolean;
  rootPaths: string[];
}

export interface InstalledPackageUpdateRequestDto {
  status: InstalledPackageStatus;
}

export interface InstalledPackageMoveRequestDto {
  direction: "up" | "down";
}

export interface HomePageRouteResponseDto {
  route: string;
}

export interface HomePageRouteUpdateRequestDto {
  route: string;
}
