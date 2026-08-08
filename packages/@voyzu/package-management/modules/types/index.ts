export interface InstalledPackageResponseDto {
  id: number;
  code: string;
  description: string;
  repository: string;
  topNavigationVisible: boolean;
  pageRoutesVisible: boolean;
  navOrder: number;
  preinstalled: boolean;
  hasTopNavigation: boolean;
  required: boolean;
  pageRootPaths: string[];
  apiRootPaths: string[];
}

export interface InstalledPackageUpdateRequestDto {
  topNavigationVisible: boolean;
  pageRoutesVisible: boolean;
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
