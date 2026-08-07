import { uiReferenceModule } from "../modules/ui-reference/module";

const leftNav = [
  {
    label: "Components",
    items: [
      { label: "Alert", icon: "campaign", routeId: uiReferenceModule.pageRoutes.alert.id },
      { label: "Badge", icon: "label", routeId: uiReferenceModule.pageRoutes.badge.id },
      { label: "Breadcrumbs", icon: "more_horiz", routeId: uiReferenceModule.pageRoutes.breadcrumbs.id },
      { label: "Button", icon: "smart_button", routeId: uiReferenceModule.pageRoutes.button.id },
      { label: "Checkbox", icon: "check_box", routeId: uiReferenceModule.pageRoutes.checkbox.id },
      { label: "Confirm Dialog", icon: "help_center", routeId: uiReferenceModule.pageRoutes.confirmDialog.id },
      { label: "Data Table", icon: "table_chart", routeId: uiReferenceModule.pageRoutes.dataTable.id },
      { label: "Date Picker", icon: "calendar_today", routeId: uiReferenceModule.pageRoutes.datePicker.id },
      { label: "Dropdown Menu", icon: "arrow_drop_down_circle", routeId: uiReferenceModule.pageRoutes.dropdownMenu.id },
      { label: "Filter Panel", icon: "filter_list", routeId: uiReferenceModule.pageRoutes.filterPanel.id },
      { label: "Input", icon: "input", routeId: uiReferenceModule.pageRoutes.input.id },
      { label: "Left Nav", icon: "left_panel_open", routeId: uiReferenceModule.pageRoutes.leftNav.id },
      { label: "Mobile Drawer", icon: "menu", routeId: uiReferenceModule.pageRoutes.mobileNavDrawer.id },
      { label: "Radio", icon: "radio_button_checked", routeId: uiReferenceModule.pageRoutes.radio.id },
      { label: "Searchable Select", icon: "arrow_drop_down_circle", routeId: uiReferenceModule.pageRoutes.searchableSelect.id },
      { label: "Split Button", icon: "vertical_split", routeId: uiReferenceModule.pageRoutes.splitButton.id },
      { label: "Toast", icon: "notifications", routeId: uiReferenceModule.pageRoutes.toast.id },
      { label: "Toggle Switch", icon: "toggle_on", routeId: uiReferenceModule.pageRoutes.toggleSwitch.id },
      { label: "Top Menu Bar", icon: "tab", routeId: uiReferenceModule.pageRoutes.topMenuBar.id },
      { label: "Validation Alert", icon: "error", routeId: uiReferenceModule.pageRoutes.validationAlert.id },
    ],
  },
  {
    label: "CSS Modules",
    items: [
      { label: "Typography", icon: "title", routeId: uiReferenceModule.pageRoutes.typography.id },
    ],
  },
  {
    label: "CSS Variables",
    items: [
      { label: "Colors", icon: "palette", routeId: uiReferenceModule.pageRoutes.colors.id },
    ],
  },
  {
    label: "Patterns",
    items: [
      { label: "Icons", icon: "interests", routeId: uiReferenceModule.pageRoutes.icons.id },
      { label: "Validation", icon: "rule", routeId: uiReferenceModule.pageRoutes.validation.id },
      { label: "Responsive", icon: "devices", routeId: uiReferenceModule.pageRoutes.responsive.id },
    ],
  },
] as const;

export default leftNav;
