const breadcrumbBase = [{ label: "Settings", href: "/settings/users" }];
export const pageRoutes = {
  "voyzu.parties.page.list": {
    path: "/settings/parties", pageTitle: "Parties", breadcrumbBase,
    httpApiDocumentationGroupId: "parties.operations",
    loadPage: () => import("./server/pages/PartiesListPage").then(m => m.PartiesListPage),
    auth: { required: true, minRole: "STANDARD" },
  },
  "voyzu.parties.page.new": {
    path: "/settings/parties/new", pageTitle: "New Party",
    breadcrumbBase: [...breadcrumbBase, { label: "Parties", href: "/settings/parties" }],
    httpApiDocumentationGroupId: "parties.operations",
    loadPage: () => import("./server/pages/NewPartyPage").then(m => m.NewPartyPage),
    auth: { required: true, minRole: "STANDARD" },
  },
  "voyzu.parties.page.detail": {
    path: "/settings/parties/[code]", pathParams: { code: { type: "string" } }, pageTitle: "Party",
    breadcrumbBase: [...breadcrumbBase, { label: "Parties", href: "/settings/parties" }],
    httpApiDocumentationGroupId: "parties.operations",
    loadPage: () => import("./server/pages/PartyDetailPage").then(m => m.PartyDetailPage),
    auth: { required: true, minRole: "STANDARD" },
  },
} as const;
