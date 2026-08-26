import { pageRoutes as uiReferencePageRoutes } from "../modules/ui-reference/pages.routes";

const leftNav = [
  {
    label: "Components",
    items: [
      { label: "Alert", icon: "campaign", routeId: uiReferencePageRoutes.alert.id },
      { label: "Badge", icon: "label", routeId: uiReferencePageRoutes.badge.id },
      { label: "Breadcrumbs", icon: "more_horiz", routeId: uiReferencePageRoutes.breadcrumbs.id },
      { label: "Button", icon: "smart_button", routeId: uiReferencePageRoutes.button.id },
      { label: "Checkbox", icon: "check_box", routeId: uiReferencePageRoutes.checkbox.id },
      { label: "Confirm Dialog", icon: "help_center", routeId: uiReferencePageRoutes.confirmDialog.id },
      { label: "Data Table", icon: "table_chart", routeId: uiReferencePageRoutes.dataTable.id },
      { label: "Date Picker", icon: "calendar_today", routeId: uiReferencePageRoutes.datePicker.id },
      { label: "Dropdown Menu", icon: "arrow_drop_down_circle", routeId: uiReferencePageRoutes.dropdownMenu.id },
      { label: "Editable Grid", icon: "grid_on", routeId: uiReferencePageRoutes.editableGrid.id },
      { label: "Filter Panel", icon: "filter_list", routeId: uiReferencePageRoutes.filterPanel.id },
      { label: "Input", icon: "input", routeId: uiReferencePageRoutes.input.id },
      { label: "Left Nav", icon: "left_panel_open", routeId: uiReferencePageRoutes.leftNav.id },
      { label: "Mobile Drawer", icon: "menu", routeId: uiReferencePageRoutes.mobileNavDrawer.id },
      { label: "Radio", icon: "radio_button_checked", routeId: uiReferencePageRoutes.radio.id },
      { label: "Searchable Select", icon: "arrow_drop_down_circle", routeId: uiReferencePageRoutes.searchableSelect.id },
      { label: "Split Button", icon: "vertical_split", routeId: uiReferencePageRoutes.splitButton.id },
      { label: "Toast", icon: "notifications", routeId: uiReferencePageRoutes.toast.id },
      { label: "Toggle Switch", icon: "toggle_on", routeId: uiReferencePageRoutes.toggleSwitch.id },
      { label: "Top Menu Bar", icon: "tab", routeId: uiReferencePageRoutes.topMenuBar.id },
      { label: "Validation Alert", icon: "error", routeId: uiReferencePageRoutes.validationAlert.id },
    ],
  },
  {
    label: "CSS Modules",
    items: [
      { label: "Typography", icon: "title", routeId: uiReferencePageRoutes.typography.id },
    ],
  },
  {
    label: "CSS Variables",
    items: [
      { label: "Colors", icon: "palette", routeId: uiReferencePageRoutes.colors.id },
    ],
  },
  {
    label: "Patterns",
    items: [
      { label: "Icons", icon: "interests", routeId: uiReferencePageRoutes.icons.id },
      { label: "Validation", icon: "rule", routeId: uiReferencePageRoutes.validation.id },
      { label: "Responsive", icon: "devices", routeId: uiReferencePageRoutes.responsive.id },
    ],
  },
] as const;

export default leftNav;
