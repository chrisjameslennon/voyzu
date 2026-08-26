const auth = {
  required: true,
  minRole: "STANDARD",
} as const;

const helpPath = "voyzu-platform-patterns/ui-reference";

export const pageRoutes = {
  alert: { id: "voyzu.ui-reference.page.alert", path: "/ui-reference", pageTitle: "Alert", loadPage: () => import("./server/pages/components/alert/page").then((module) => module.default), helpPath, auth },
  badge: { id: "voyzu.ui-reference.page.badge", path: "/ui-reference/components/badge", pageTitle: "Badge", loadPage: () => import("./server/pages/components/badge/page").then((module) => module.default), helpPath, auth },
  breadcrumbs: { id: "voyzu.ui-reference.page.breadcrumbs", path: "/ui-reference/components/breadcrumbs", pageTitle: "Breadcrumbs", loadPage: () => import("./server/pages/components/breadcrumbs/page").then((module) => module.default), helpPath, auth },
  button: { id: "voyzu.ui-reference.page.button", path: "/ui-reference/components/button", pageTitle: "Button", loadPage: () => import("./server/pages/components/button/page").then((module) => module.default), helpPath, auth },
  checkbox: { id: "voyzu.ui-reference.page.checkbox", path: "/ui-reference/components/checkbox", pageTitle: "Checkbox", loadPage: () => import("./server/pages/components/checkbox/page").then((module) => module.default), helpPath, auth },
  confirmDialog: { id: "voyzu.ui-reference.page.confirm-dialog", path: "/ui-reference/components/confirm-dialog", pageTitle: "Confirm Dialog", loadPage: () => import("./server/pages/components/confirm-dialog/page").then((module) => module.default), helpPath, auth },
  dataTable: { id: "voyzu.ui-reference.page.data-table", path: "/ui-reference/components/data-table", pageTitle: "Data Table", loadPage: () => import("./server/pages/components/data-table/page").then((module) => module.default), helpPath, auth },
  datePicker: { id: "voyzu.ui-reference.page.date-picker", path: "/ui-reference/components/date-picker", pageTitle: "Date Picker", loadPage: () => import("./server/pages/components/date-picker/page").then((module) => module.default), helpPath, auth },
  dropdownMenu: { id: "voyzu.ui-reference.page.dropdown-menu", path: "/ui-reference/components/dropdown-menu", pageTitle: "Dropdown Menu", loadPage: () => import("./server/pages/components/dropdown-menu/page").then((module) => module.default), helpPath, auth },
  editableGrid: { id: "voyzu.ui-reference.page.editable-grid", path: "/ui-reference/components/editable-grid", pageTitle: "Editable Grid", loadPage: () => import("./server/pages/components/editable-grid/page").then((module) => module.default), helpPath, auth },
  filterPanel: { id: "voyzu.ui-reference.page.filter-panel", path: "/ui-reference/components/filter-panel", pageTitle: "Filter Panel", loadPage: () => import("./server/pages/components/filter-panel/page").then((module) => module.default), helpPath, auth },
  input: { id: "voyzu.ui-reference.page.input", path: "/ui-reference/components/input", pageTitle: "Input", loadPage: () => import("./server/pages/components/input/page").then((module) => module.default), helpPath, auth },
  leftNav: { id: "voyzu.ui-reference.page.left-nav", path: "/ui-reference/components/left-nav", pageTitle: "Left Nav", loadPage: () => import("./server/pages/components/left-nav/page").then((module) => module.default), helpPath, auth },
  mobileNavDrawer: { id: "voyzu.ui-reference.page.mobile-nav-drawer", path: "/ui-reference/components/mobile-nav-drawer", pageTitle: "Mobile Drawer", loadPage: () => import("./server/pages/components/mobile-nav-drawer/page").then((module) => module.default), helpPath, auth },
  radio: { id: "voyzu.ui-reference.page.radio", path: "/ui-reference/components/radio", pageTitle: "Radio", loadPage: () => import("./server/pages/components/radio/page").then((module) => module.default), helpPath, auth },
  searchableSelect: { id: "voyzu.ui-reference.page.searchable-select", path: "/ui-reference/components/searchable-select", pageTitle: "Searchable Select", loadPage: () => import("./server/pages/components/searchable-select/page").then((module) => module.default), helpPath, auth },
  splitButton: { id: "voyzu.ui-reference.page.split-button", path: "/ui-reference/components/split-button", pageTitle: "Split Button", loadPage: () => import("./server/pages/components/split-button/page").then((module) => module.default), helpPath, auth },
  toast: { id: "voyzu.ui-reference.page.toast", path: "/ui-reference/components/toast", pageTitle: "Toast", loadPage: () => import("./server/pages/components/toast/page").then((module) => module.default), helpPath, auth },
  toggleSwitch: { id: "voyzu.ui-reference.page.toggle-switch", path: "/ui-reference/components/toggle-switch", pageTitle: "Toggle Switch", loadPage: () => import("./server/pages/components/toggle-switch/page").then((module) => module.default), helpPath, auth },
  topMenuBar: { id: "voyzu.ui-reference.page.top-menu-bar", path: "/ui-reference/components/top-menu-bar", pageTitle: "Top Menu Bar", loadPage: () => import("./server/pages/components/top-menu-bar/page").then((module) => module.default), helpPath, auth },
  validationAlert: { id: "voyzu.ui-reference.page.validation-alert", path: "/ui-reference/components/validation-alert", pageTitle: "Validation Alert", loadPage: () => import("./server/pages/components/validation-alert/page").then((module) => module.default), helpPath, auth },
  typography: { id: "voyzu.ui-reference.page.typography", path: "/ui-reference/css-modules/typography", pageTitle: "Typography", loadPage: () => import("./server/pages/css-modules/typography/page").then((module) => module.default), helpPath, auth },
  colors: { id: "voyzu.ui-reference.page.colors", path: "/ui-reference/css-variables/colors", pageTitle: "Colors", loadPage: () => import("./server/pages/css-variables/colors/page").then((module) => module.default), helpPath, auth },
  icons: { id: "voyzu.ui-reference.page.icons", path: "/ui-reference/patterns/icons", pageTitle: "Icons", loadPage: () => import("./server/pages/patterns/icons/page").then((module) => module.default), helpPath, auth },
  validation: { id: "voyzu.ui-reference.page.validation", path: "/ui-reference/patterns/validation", pageTitle: "Validation", loadPage: () => import("./server/pages/patterns/validation/page").then((module) => module.default), helpPath, auth },
  responsive: { id: "voyzu.ui-reference.page.responsive", path: "/ui-reference/patterns/responsive", pageTitle: "Responsive", loadPage: () => import("./server/pages/patterns/responsive/page").then((module) => module.default), helpPath, auth },
} as const;
