const leftNav = [
  {
    label: "Components",
    items: [
      { label: "Alert", icon: "campaign", routeId: "voyzu.ui-reference.page.alert" },
      { label: "Badge", icon: "label", routeId: "voyzu.ui-reference.page.badge" },
      { label: "Breadcrumbs", icon: "more_horiz", routeId: "voyzu.ui-reference.page.breadcrumbs" },
      { label: "Button", icon: "smart_button", routeId: "voyzu.ui-reference.page.button" },
      { label: "Checkbox", icon: "check_box", routeId: "voyzu.ui-reference.page.checkbox" },
      { label: "Confirm Dialog", icon: "help_center", routeId: "voyzu.ui-reference.page.confirm-dialog" },
      { label: "Context Switcher", icon: "switch_account", routeId: "voyzu.ui-reference.page.context-switcher" },
      { label: "Data Table", icon: "table_chart", routeId: "voyzu.ui-reference.page.data-table" },
      { label: "Date Picker", icon: "calendar_today", routeId: "voyzu.ui-reference.page.date-picker" },
      { label: "Dropdown Menu", icon: "arrow_drop_down_circle", routeId: "voyzu.ui-reference.page.dropdown-menu" },
      { label: "Editable Grid", icon: "grid_on", routeId: "voyzu.ui-reference.page.editable-grid" },
      { label: "Filter Panel", icon: "filter_list", routeId: "voyzu.ui-reference.page.filter-panel" },
      { label: "Input", icon: "input", routeId: "voyzu.ui-reference.page.input" },
      { label: "Left Nav", icon: "left_panel_open", routeId: "voyzu.ui-reference.page.left-nav" },
      { label: "Mobile Drawer", icon: "menu", routeId: "voyzu.ui-reference.page.mobile-nav-drawer" },
      { label: "Radio", icon: "radio_button_checked", routeId: "voyzu.ui-reference.page.radio" },
      { label: "Searchable Select", icon: "arrow_drop_down_circle", routeId: "voyzu.ui-reference.page.searchable-select" },
      { label: "Split Button", icon: "vertical_split", routeId: "voyzu.ui-reference.page.split-button" },
      { label: "Textarea", icon: "notes", routeId: "voyzu.ui-reference.page.textarea" },
      { label: "Toast", icon: "notifications", routeId: "voyzu.ui-reference.page.toast" },
      { label: "Toggle Switch", icon: "toggle_on", routeId: "voyzu.ui-reference.page.toggle-switch" },
      { label: "Top Menu Bar", icon: "tab", routeId: "voyzu.ui-reference.page.top-menu-bar" },
      { label: "Validation Alert", icon: "error", routeId: "voyzu.ui-reference.page.validation-alert" },
    ],
  },
  {
    label: "CSS Modules",
    items: [
      { label: "Typography", icon: "title", routeId: "voyzu.ui-reference.page.typography" },
    ],
  },
  {
    label: "CSS Variables",
    items: [
      { label: "Colors", icon: "palette", routeId: "voyzu.ui-reference.page.colors" },
    ],
  },
  {
    label: "Patterns",
    items: [
      { label: "Icons", icon: "interests", routeId: "voyzu.ui-reference.page.icons" },
      { label: "Validation", icon: "rule", routeId: "voyzu.ui-reference.page.validation" },
      { label: "Responsive", icon: "devices", routeId: "voyzu.ui-reference.page.responsive" },
    ],
  },
] as const;

export default leftNav;
