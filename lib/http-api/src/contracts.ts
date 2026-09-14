import type { HttpApiRegistration, HttpApiRegisteredRoute } from "@voyzu/types/http-api";
import Schema from "typebox/schema";
import type { TSchema } from "typebox";
export const httpApiDocSegment = (id: string) => encodeURIComponent(id);
export const httpApiGroupUrl = (packageName: string, groupId: string) => `/http-api-reference/${packageName.replace("/", "-")}/${httpApiDocSegment(groupId)}`;
export function resolveHttpApiContracts(registrations: readonly HttpApiRegistration[]) {
  const routes = new Map<string, HttpApiRegisteredRoute>();
  const methods = new Set<string>();
  const roots = new Map<string, string>();
  const groups = new Map<string, {
    url: string;
    packageName: string;
  }>();
  const outputIds = new Set<string>();
  const navigationHeadings = new Map<string, string>();
  const membership = new Map<string, {
    packageName: string;
    sectionId: string;
    groupId: string;
    tag: string;
  }>();
  const fail = (message: string): never => {
    throw new Error(`HTTP API contract: ${message}`);
  };
  const record = (value: unknown, label: string) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  };
  const nonempty = (value: unknown, label: string) => {
    if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string`);
  };
  const identifier = (value: string, kind: string) => {
    if (!/^[a-z][a-z0-9_-]*(?:\.[A-Za-z0-9_-]+)+$/.test(value)) fail(`${kind} ${value} must be a namespaced identifier`);
    const outputKey = `${kind}:${value.toLowerCase()}`;
    if (outputIds.has(outputKey)) fail(`${kind} ${value} collides with another identifier`);
    outputIds.add(outputKey);
  };
  const cookieNames = (value: unknown, label: string) => {
    if (value === undefined) return;
    if (!Array.isArray(value) || value.some(name => typeof name !== "string" || !/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) || new Set(value).size !== value.length) fail(`${label} must contain unique cookie names`);
  };
  const schema = (value: TSchema, label: string, url = false, allowArray = false): void => {
    record(value, label);
    const json = value as unknown as Record<string, unknown>;
    if (url) {
      const alternatives = json.anyOf ?? json.oneOf;
      if (Array.isArray(alternatives)) for (const item of alternatives) schema(item as TSchema, label, true);else if (json.type === "array" && allowArray) schema(json.items as TSchema, label, true);else if (json.type !== "string" && typeof json.const !== "string") fail(`${label} must describe strings at the HTTP boundary`);
    }
    try {
      Schema.Compile(value);
    } catch {
      fail(`${label} is not a compilable DTO schema`);
    }
  };
  for (const registration of registrations) {
    const {
      packageName,
      routing,
      documentation
    } = registration;
    nonempty(packageName, "package name");
    record(routing, `${packageName} routing`);
    record(documentation, `${packageName} documentation`);
    if (!Array.isArray(routing.roots)) fail(`${packageName} roots must be an array`);
    for (const root of routing.roots) {
      if (typeof root !== "string" || !/^\/(?:[A-Za-z0-9._~-]+\/)*[A-Za-z0-9._~-]+$/.test(root)) fail(`${packageName} invalid root ${root}`);
      for (const [other, owner] of roots) if (owner !== packageName && (root === other || root.startsWith(other + "/") || other.startsWith(root + "/"))) fail(`${packageName} root ${root} conflicts with ${owner} ${other}`);
      roots.set(root, packageName);
    }
    record(routing.routes, `${packageName} routes`);
    for (const [id, route] of Object.entries(routing.routes)) {
      nonempty(id, "route ID");
      identifier(id, "route");
      record(route, id);
      if (routes.has(id)) fail(`duplicate route ID ${id}`);
      if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(route.method)) fail(`${id} invalid method`);
      if (typeof route.path !== "string" || !route.path.startsWith("/") || /[?#\\]/.test(route.path)) fail(`${id} invalid path`);
      if (!routing.roots.some(root => route.path === root || route.path.startsWith(root + "/"))) fail(`${id} path is outside ${packageName} roots`);
      const key = `${route.method} ${route.path.replace(/\[[^\]]+\]/g, "[]")}`;
      if (methods.has(key)) fail(`duplicate method/path ${key}`);
      methods.add(key);
      nonempty(route.summary, `${id} summary`);
      nonempty(route.description, `${id} description`);
      if ("tags" in route || "requestCookies" in route) fail(`${id} contains retired route metadata`);
      if (typeof route.loadHandler !== "function") fail(`${id} requires a lazy loadHandler`);
      const params = [...route.path.matchAll(/\[([^\]]+)\]/g)].map(match => match[1]);
      const declared = route.request?.path ?? {};
      if (params.length !== new Set(params).size || params.some(name => !declared[name]) || Object.keys(declared).some(name => !params.includes(name))) fail(`${id} path parameters do not match placeholders`);
      for (const [name, definition] of Object.entries(declared)) {
        if (definition.required === false) fail(`${id} path.${name} must be required`);
        schema(definition.schema, `${id} path.${name}`, true);
      }
      const query = route.request?.query;
      if (query) {
        schema(query.schema, `${id} query`);
        const querySchema = query.schema as unknown as {
          properties: Record<string, TSchema>;
          required?: string[];
        };
        const properties = querySchema.properties;
        record(properties, `${id} query properties`);
        record(query.parameters, `${id} query parameters`);
        if (Object.keys(properties).some(name => !query.parameters[name]) || Object.keys(query.parameters).some(name => !properties[name])) fail(`${id} query metadata must match DTO properties`);
        for (const [name, metadata] of Object.entries(query.parameters)) {
          schema(properties[name], `${id} query.${name}`, true, true);
          const required = querySchema.required?.includes(name) ?? false;
          if (metadata.required !== undefined && metadata.required !== required) fail(`${id} query.${name} required metadata disagrees with DTO`);
        }
      }
      cookieNames(route.request?.cookies, `${id} request cookies`);
      if (route.request?.body) schema(route.request.body, `${id} request body`);
      record(route.responses, `${id} responses`);
      if (!Object.keys(route.responses).length) fail(`${id} has no responses`);
      for (const [status, response] of Object.entries(route.responses)) {
        if (!/^[1-5][0-9]{2}$/.test(status)) fail(`${id} invalid response status ${status}`);
        record(response, `${id} ${status}`);
        nonempty(response.description, `${id} ${status} description`);
        if (response.body) schema(response.body, `${id} ${status} body`);
        cookieNames(response.cookies, `${id} ${status} cookies`);
      }
      routes.set(id, {
        ...route,
        id,
        packageName
      });
    }
    record(documentation.sections, `${packageName} sections`);
    const titles = new Set<string>();
    for (const [sectionId, section] of Object.entries(documentation.sections)) {
      nonempty(sectionId, "section ID");
      identifier(sectionId, "section");
      nonempty(section.title, `${sectionId} title`);
      nonempty(section.description, `${sectionId} description`);
      if (section.navigationHeadingId !== undefined) {
        const headingId = section.navigationHeadingId;
        nonempty(headingId, `${sectionId} navigation heading ID`);
        if (!/^[a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)+$/.test(headingId)) fail(`${sectionId} navigation heading ID must be a lowercase namespaced identifier`);
        const title = navigationHeadings.get(headingId);
        if (title !== undefined && title !== section.title) fail(`Navigation heading ${headingId} has conflicting titles`);
        navigationHeadings.set(headingId, section.title);
      }
      if (titles.has(section.title)) fail(`${packageName} duplicate section title ${section.title}`);
      titles.add(section.title);
      record(section.groups, `${sectionId} groups`);
      for (const [groupId, group] of Object.entries(section.groups)) {
        nonempty(groupId, "group ID");
        identifier(groupId, "group");
        if (groups.has(groupId)) fail(`duplicate documentation group ${groupId}`);
        nonempty(group.title, `${groupId} title`);
        nonempty(group.description, `${groupId} description`);
        if (!Array.isArray(group.routes)) fail(`${groupId} routes must be an array of route IDs`);
        groups.set(groupId, {
          url: httpApiGroupUrl(packageName, groupId),
          packageName
        });
        for (const id of group.routes) {
          nonempty(id, `${groupId} route ID`);
          if (membership.has(id)) fail(`${id} appears in multiple documentation groups`);
          membership.set(id, {
            packageName,
            sectionId,
            groupId,
            tag: `${packageName}: ${section.title}`
          });
        }
      }
    }
  }
  for (const id of routes.keys()) if (!membership.has(id)) fail(`missing documentation for ${id}`);
  for (const id of membership.keys()) if (!routes.has(id)) fail(`documentation references unknown route ${id}`);
  return {
    routes,
    groups,
    membership
  };
}
