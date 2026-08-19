import "server-only";

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { BreadcrumbsProvider } from "@voyzu/ui-components";

import type {
  VoyzuSurfaceAccessContext,
  VoyzuSurfaceAccessResult,
  VoyzuSurfaceConfig,
  VoyzuSurfaceMainComponent,
  VoyzuSurfaceRoute,
  VoyzuSurfaceUserAccess,
} from "../types";

export interface VoyzuSurfacePageContext {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface SurfaceFrameProps {
  slots: VoyzuSurfaceConfig["slots"];
  activeRoute?: VoyzuSurfaceRoute;
  showLeftNav: boolean;
  Main?: VoyzuSurfaceMainComponent;
  children: ReactNode;
}

export interface CreateVoyzuPageRendererOptions {
  config: VoyzuSurfaceConfig;
  Frame: (props: SurfaceFrameProps) => ReactNode;
  getCurrentUser?: () => Promise<VoyzuSurfaceUserAccess | null>;
  authorize?: (context: VoyzuSurfaceAccessContext) => VoyzuSurfaceAccessResult | Promise<VoyzuSurfaceAccessResult>;
  isRouteEnabled?: (route: VoyzuSurfaceRoute) => boolean | Promise<boolean>;
  loginPath?: string;
  AccessDenied?: (props: { route: VoyzuSurfaceRoute; user: VoyzuSurfaceUserAccess | null }) => ReactNode;
}

function normalizeParams(
  values: Record<string, string | string[] | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value]] : []),
  );
}

function routePath(route: VoyzuSurfaceRoute, params: Record<string, string>): string {
  return route.path.replace(/\[([^/\]]+)\]/g, (_match, name: string) => params[name] ?? "");
}

export function createVoyzuPageRenderer({
  config,
  Frame,
  getCurrentUser,
  authorize,
  isRouteEnabled,
  loginPath = "/login",
  AccessDenied,
}: CreateVoyzuPageRendererOptions) {
  return {
    generateMetadata(route: VoyzuSurfaceRoute): Metadata {
      return { title: route.pageTitle ?? "Voyzu" };
    },

    async Page(route: VoyzuSurfaceRoute, { params, searchParams }: VoyzuSurfacePageContext) {
      const routeParams = normalizeParams(await params);
      const path = routePath(route, routeParams);
      const query = normalizeParams((await searchParams) ?? {});

      if (isRouteEnabled && !(await isRouteEnabled(route))) notFound();
      const currentUser = route.auth?.required && getCurrentUser ? await getCurrentUser() : null;

      if (route.auth?.required && authorize) {
        const access = await authorize({ path, route, user: currentUser });
        if (access === "unauthenticated") redirect(`${loginPath}?next=${encodeURIComponent(path)}`);
        if (access === "denied") {
          if (AccessDenied) return <AccessDenied route={route} user={currentUser} />;
          notFound();
        }
      }

      const PageComponent = route.Page;
      const activeRoute = route.helpPathResolver
        ? { ...route, helpPath: route.helpPathResolver({ path, params: routeParams, searchParams: query }) }
        : route;
      const page = (
        <PageComponent
          {...routeParams}
          surface={{
            path,
            route: activeRoute,
            searchParams: query,
            unframed: activeRoute.unframed === true,
            helpBaseUrl: activeRoute.helpBaseUrl,
          }}
        />
      );

      if (route.unframed) return page;
      const Main = config.mainRegistrations?.find(
        (registration) => registration.routeIds.includes(route.id),
      )?.Main;

      return (
        <Frame
          slots={config.slots}
          activeRoute={activeRoute}
          showLeftNav={config.leftNavRouteIds?.includes(route.id) === true}
          Main={Main}
        >
          <BreadcrumbsProvider base={route.breadcrumbBase ?? []}>{page}</BreadcrumbsProvider>
        </Frame>
      );
    },
  };
}
