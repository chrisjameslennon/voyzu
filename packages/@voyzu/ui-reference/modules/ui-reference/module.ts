import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import AlertPage from "./server/pages/components/alert/page";
import BadgePage from "./server/pages/components/badge/page";
import BreadcrumbsPage from "./server/pages/components/breadcrumbs/page";
import ButtonPage from "./server/pages/components/button/page";
import CheckboxPage from "./server/pages/components/checkbox/page";
import ConfirmDialogPage from "./server/pages/components/confirm-dialog/page";
import DataTablePage from "./server/pages/components/data-table/page";
import DatePickerPage from "./server/pages/components/date-picker/page";
import DropdownMenuPage from "./server/pages/components/dropdown-menu/page";
import FilterPanelPage from "./server/pages/components/filter-panel/page";
import InputPage from "./server/pages/components/input/page";
import LeftNavPage from "./server/pages/components/left-nav/page";
import MobileNavDrawerPage from "./server/pages/components/mobile-nav-drawer/page";
import RadioPage from "./server/pages/components/radio/page";
import SearchableSelectPage from "./server/pages/components/searchable-select/page";
import SplitButtonPage from "./server/pages/components/split-button/page";
import ToastPage from "./server/pages/components/toast/page";
import ToggleSwitchPage from "./server/pages/components/toggle-switch/page";
import TopMenuBarPage from "./server/pages/components/top-menu-bar/page";
import ValidationAlertPage from "./server/pages/components/validation-alert/page";
import TypographyPage from "./server/pages/css-modules/typography/page";
import ColorsPage from "./server/pages/css-variables/colors/page";
import IconsPage from "./server/pages/patterns/icons/page";
import ResponsivePage from "./server/pages/patterns/responsive/page";
import ValidationPage from "./server/pages/patterns/validation/page";

const auth = {
  required: true,
  minRole: "COMPANY_USER",
} as const;

const helpPath = "voyzu-platform-patterns/ui-reference";

export const uiReferenceModule = {
  pageRoutes: {
    alert: { id: "voyzu.ui-reference.page.alert", path: "/ui-reference", pageTitle: "Alert", Page: AlertPage, helpPath, auth },
    badge: { id: "voyzu.ui-reference.page.badge", path: "/ui-reference/components/badge", pageTitle: "Badge", Page: BadgePage, helpPath, auth },
    breadcrumbs: { id: "voyzu.ui-reference.page.breadcrumbs", path: "/ui-reference/components/breadcrumbs", pageTitle: "Breadcrumbs", Page: BreadcrumbsPage, helpPath, auth },
    button: { id: "voyzu.ui-reference.page.button", path: "/ui-reference/components/button", pageTitle: "Button", Page: ButtonPage, helpPath, auth },
    checkbox: { id: "voyzu.ui-reference.page.checkbox", path: "/ui-reference/components/checkbox", pageTitle: "Checkbox", Page: CheckboxPage, helpPath, auth },
    confirmDialog: { id: "voyzu.ui-reference.page.confirm-dialog", path: "/ui-reference/components/confirm-dialog", pageTitle: "Confirm Dialog", Page: ConfirmDialogPage, helpPath, auth },
    dataTable: { id: "voyzu.ui-reference.page.data-table", path: "/ui-reference/components/data-table", pageTitle: "Data Table", Page: DataTablePage, helpPath, auth },
    datePicker: { id: "voyzu.ui-reference.page.date-picker", path: "/ui-reference/components/date-picker", pageTitle: "Date Picker", Page: DatePickerPage, helpPath, auth },
    dropdownMenu: { id: "voyzu.ui-reference.page.dropdown-menu", path: "/ui-reference/components/dropdown-menu", pageTitle: "Dropdown Menu", Page: DropdownMenuPage, helpPath, auth },
    filterPanel: { id: "voyzu.ui-reference.page.filter-panel", path: "/ui-reference/components/filter-panel", pageTitle: "Filter Panel", Page: FilterPanelPage, helpPath, auth },
    input: { id: "voyzu.ui-reference.page.input", path: "/ui-reference/components/input", pageTitle: "Input", Page: InputPage, helpPath, auth },
    leftNav: { id: "voyzu.ui-reference.page.left-nav", path: "/ui-reference/components/left-nav", pageTitle: "Left Nav", Page: LeftNavPage, helpPath, auth },
    mobileNavDrawer: { id: "voyzu.ui-reference.page.mobile-nav-drawer", path: "/ui-reference/components/mobile-nav-drawer", pageTitle: "Mobile Drawer", Page: MobileNavDrawerPage, helpPath, auth },
    radio: { id: "voyzu.ui-reference.page.radio", path: "/ui-reference/components/radio", pageTitle: "Radio", Page: RadioPage, helpPath, auth },
    searchableSelect: { id: "voyzu.ui-reference.page.searchable-select", path: "/ui-reference/components/searchable-select", pageTitle: "Searchable Select", Page: SearchableSelectPage, helpPath, auth },
    splitButton: { id: "voyzu.ui-reference.page.split-button", path: "/ui-reference/components/split-button", pageTitle: "Split Button", Page: SplitButtonPage, helpPath, auth },
    toast: { id: "voyzu.ui-reference.page.toast", path: "/ui-reference/components/toast", pageTitle: "Toast", Page: ToastPage, helpPath, auth },
    toggleSwitch: { id: "voyzu.ui-reference.page.toggle-switch", path: "/ui-reference/components/toggle-switch", pageTitle: "Toggle Switch", Page: ToggleSwitchPage, helpPath, auth },
    topMenuBar: { id: "voyzu.ui-reference.page.top-menu-bar", path: "/ui-reference/components/top-menu-bar", pageTitle: "Top Menu Bar", Page: TopMenuBarPage, helpPath, auth },
    validationAlert: { id: "voyzu.ui-reference.page.validation-alert", path: "/ui-reference/components/validation-alert", pageTitle: "Validation Alert", Page: ValidationAlertPage, helpPath, auth },
    typography: { id: "voyzu.ui-reference.page.typography", path: "/ui-reference/css-modules/typography", pageTitle: "Typography", Page: TypographyPage, helpPath, auth },
    colors: { id: "voyzu.ui-reference.page.colors", path: "/ui-reference/css-variables/colors", pageTitle: "Colors", Page: ColorsPage, helpPath, auth },
    icons: { id: "voyzu.ui-reference.page.icons", path: "/ui-reference/patterns/icons", pageTitle: "Icons", Page: IconsPage, helpPath, auth },
    validation: { id: "voyzu.ui-reference.page.validation", path: "/ui-reference/patterns/validation", pageTitle: "Validation", Page: ValidationPage, helpPath, auth },
    responsive: { id: "voyzu.ui-reference.page.responsive", path: "/ui-reference/patterns/responsive", pageTitle: "Responsive", Page: ResponsivePage, helpPath, auth },
  },
  apiDefinitions: {},
} as const satisfies VoyzuPackageModuleDefinition;

export default uiReferenceModule;
