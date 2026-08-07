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

export interface VoyzuSurfaceRouteContext {
  params: Promise<{
    voyzuPath?: string[];
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface SurfaceFrameProps {
  slots: VoyzuSurfaceConfig["slots"];
  activeRoute?: VoyzuSurfaceRoute;
  showLeftNav: boolean;
  Main?: VoyzuSurfaceMainComponent;
  children: ReactNode;
}

export interface CreateVoyzuSurfaceRouterOptions {
  config: VoyzuSurfaceConfig;
  rootRedirect: string | ((user: VoyzuSurfaceUserAccess | null) => string | Promise<string>);
  Frame: (props: SurfaceFrameProps) => ReactNode;
  getCurrentUser?: () => Promise<VoyzuSurfaceUserAccess | null>;
  authorize?: (context: VoyzuSurfaceAccessContext) => VoyzuSurfaceAccessResult | Promise<VoyzuSurfaceAccessResult>;
  isRouteEnabled?: (route: VoyzuSurfaceRoute) => boolean | Promise<boolean>;
  loginPath?: string;
  AccessDenied?: (props: { route: VoyzuSurfaceRoute; user: VoyzuSurfaceUserAccess | null }) => ReactNode;
}

async function resolvePath(params: VoyzuSurfaceRouteContext["params"]): Promise<string> {
  const { voyzuPath } = await params;
  return "/" + (voyzuPath ?? []).join("/");
}

function matchRoute(
  config: VoyzuSurfaceConfig,
  path: string,
): { route: VoyzuSurfaceRoute; params: Record<string, string> } | null {
  for (const route of config.pageRoutes) {
    const routeParts = route.path.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);

    if (routeParts.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let matches = true;

    for (let index = 0; index < routeParts.length; index += 1) {
      const routePart = routeParts[index];
      const pathPart = pathParts[index];

      if (routePart.startsWith("[") && routePart.endsWith("]")) {
        params[routePart.slice(1, -1)] = pathPart;
        continue;
      }

      if (routePart !== pathPart) {
        matches = false;
        break;
      }
    }

    if (matches) return { route, params };
  }

  return null;
}

function normalizeSearchParams(
  query: Record<string, string | string[] | undefined> | undefined,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(query ?? {}).flatMap(([key, value]) => {
      if (typeof value === "string") return [[key, value]];
      if (Array.isArray(value) && typeof value[0] === "string") return [[key, value[0]]];
      return [];
    }),
  );
}

export function createVoyzuSurfaceRouter({
  config,
  rootRedirect,
  Frame,
  getCurrentUser,
  authorize,
  isRouteEnabled,
  loginPath = "/login",
  AccessDenied,
}: CreateVoyzuSurfaceRouterOptions) {
  return {
    async generateMetadata({ params }: VoyzuSurfaceRouteContext): Promise<Metadata> {
      const path = await resolvePath(params);
      const match = matchRoute(config, path);

      return {
        title: match?.route.pageTitle ?? "Voyzu",
      };
    },

    async Page({ params, searchParams }: VoyzuSurfaceRouteContext) {
      const path = await resolvePath(params);
      const query = await searchParams;

      if (path === "/") {
        const currentUser =
          typeof rootRedirect === "function" && getCurrentUser
            ? await getCurrentUser()
            : null;
        redirect(typeof rootRedirect === "function" ? await rootRedirect(currentUser) : rootRedirect);
      }

      const match = matchRoute(config, path);

      if (!match) {
        notFound();
      }

      const { route, params: routeParams } = match;
      if (isRouteEnabled && !(await isRouteEnabled(route))) {
        notFound();
      }
      const currentUser = route.auth?.required && getCurrentUser ? await getCurrentUser() : null;

      if (route.auth?.required && authorize) {
        const access = await authorize({ path, route, user: currentUser });

        if (access === "unauthenticated") {
          redirect(`${loginPath}?next=${encodeURIComponent(path)}`);
        }

        if (access === "denied") {
          if (AccessDenied) {
            return <AccessDenied route={route} user={currentUser} />;
          }

          notFound();
        }
      }

      const PageComponent = route.Page;
      const normalizedSearchParams = normalizeSearchParams(query);
      const activeRoute = route.helpPathResolver
        ? {
            ...route,
            helpPath: route.helpPathResolver({
              path,
              params: routeParams,
              searchParams: normalizedSearchParams,
            }),
          }
        : route;
      const page = (
        <PageComponent
          {...routeParams}
          surface={{
            path,
            route: activeRoute,
            searchParams: normalizedSearchParams,
            unframed: activeRoute.unframed === true,
            helpBaseUrl: activeRoute.helpBaseUrl,
          }}
        />
      );

      if (route.unframed) {
        return page;
      }

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
          <BreadcrumbsProvider base={route.breadcrumbBase ?? []}>
            {page}
          </BreadcrumbsProvider>
        </Frame>
      );
    },
  };
}
