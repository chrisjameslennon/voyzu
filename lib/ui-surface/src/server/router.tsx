import "server-only";
import { comparePageRoutes, parsePageParameters } from "../page-routing";

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { BreadcrumbsProvider } from "@voyzu/ui-components";

import type {
  VoyzuSurfaceAccessContext,
  VoyzuSurfaceAccessResult,
  VoyzuSurfaceConfig,
  VoyzuSurfaceMainComponent,
  RegisteredPageRoute,
  VoyzuSurfaceUserAccess,
} from "../types";

export interface VoyzuSurfacePageContext {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface VoyzuSurfaceRouteContext {
  params: Promise<{
    voyzuPath?: string[];
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface SurfaceFrameProps {
  slots: VoyzuSurfaceConfig["slots"];
  activeRoute?: RegisteredPageRoute;
  showLeftNav: boolean;
  Main?: VoyzuSurfaceMainComponent;
  children: ReactNode;
}

export interface CreateVoyzuPageRendererOptions {
  config: VoyzuSurfaceConfig;
  Frame: (props: SurfaceFrameProps) => ReactNode;
  getCurrentUser?: () => Promise<VoyzuSurfaceUserAccess | null>;
  authorize?: (context: VoyzuSurfaceAccessContext) => VoyzuSurfaceAccessResult | Promise<VoyzuSurfaceAccessResult>;
  isRouteEnabled?: (route: RegisteredPageRoute) => boolean | Promise<boolean>;
  loginPath?: string;
  AccessDenied?: (props: { route: RegisteredPageRoute; user: VoyzuSurfaceUserAccess | null }) => ReactNode;
}

export interface CreateVoyzuSurfaceRouterOptions extends CreateVoyzuPageRendererOptions {
  rootRedirect: string | ((user: VoyzuSurfaceUserAccess | null) => string | Promise<string>);
}

async function resolvePath(params: VoyzuSurfaceRouteContext["params"]): Promise<string> {
  const { voyzuPath } = await params;
  return "/" + (voyzuPath ?? []).map(encodeURIComponent).join("/");
}

function matchRoute(
  config: VoyzuSurfaceConfig,
  path: string,
): { route: RegisteredPageRoute; params: Record<string, string> } | null {
  for (const route of [...config.pageRoutes].sort(comparePageRoutes)) {
    const routeParts = route.path.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);
    if (routeParts.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let matches = true;
    for (let index = 0; index < routeParts.length; index += 1) {
      const routePart = routeParts[index];
      const pathPart = pathParts[index];
      if (routePart.startsWith("[") && routePart.endsWith("]")) {
        params[routePart.slice(1, -1)] = decodeURIComponent(pathPart);
      } else if (routePart !== pathPart) {
        matches = false;
        break;
      }
    }
    if (matches) return { route, params };
  }
  return null;
}

function normalizeParams(
  values: Record<string, string | string[] | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value]] : []),
  );
}

function routePath(route: RegisteredPageRoute, params: Record<string, string>): string {
  return route.path.replace(/\[([^/\]]+)\]/g, (_match, name: string) => encodeURIComponent(params[name] ?? ""));
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
    generateMetadata(route: RegisteredPageRoute): Metadata {
      return { title: route.pageTitle ?? "Voyzu" };
    },

    async Page(route: RegisteredPageRoute, { params, searchParams }: VoyzuSurfacePageContext) {
      const routeParams = normalizeParams(await params);
      const path = routePath(route, routeParams);
      const rawQuery = (await searchParams) ?? {};

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

      const pathParams = parsePageParameters(route, "pathParams", routeParams);
      const queryParams = parsePageParameters(route, "queryParams", rawQuery);
      const PageComponent = await route.loadPage();
      const activeRoute = route.helpPathResolver
        ? { ...route, helpPath: route.helpPathResolver({ path, pathParams, queryParams }) }
        : route;
      const page = (
        <PageComponent
          context={{ path, pathParams, queryParams, routeDefinition: activeRoute }}
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

export function createVoyzuSurfaceRouter({
  rootRedirect,
  ...options
}: CreateVoyzuSurfaceRouterOptions) {
  const renderer = createVoyzuPageRenderer(options);

  return {
    async generateMetadata({ params }: VoyzuSurfaceRouteContext): Promise<Metadata> {
      const match = matchRoute(options.config, await resolvePath(params));
      return match ? renderer.generateMetadata(match.route) : { title: "Voyzu" };
    },

    async Page({ params, searchParams }: VoyzuSurfaceRouteContext) {
      const path = await resolvePath(params);
      if (path === "/") {
        const currentUser =
          typeof rootRedirect === "function" && options.getCurrentUser
            ? await options.getCurrentUser()
            : null;
        redirect(typeof rootRedirect === "function" ? await rootRedirect(currentUser) : rootRedirect);
      }

      const match = matchRoute(options.config, path);
      if (!match) notFound();
      return renderer.Page(match.route, {
        params: Promise.resolve(match.params),
        searchParams,
      });
    },
  };
}
