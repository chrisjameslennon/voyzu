import type { UiSurfaceMenuGroup } from "@voyzu/types/ui-surface";

export default [
  {
    "label": "Components",
    "items": {
      "ui-reference.menu1.alert": {
        "label": "Alert",
        "icon": "campaign",
        "routeId": "voyzu.ui-reference.page.alert"
      },
      "ui-reference.menu1.badge": {
        "label": "Badge",
        "icon": "label",
        "routeId": "voyzu.ui-reference.page.badge"
      },
      "ui-reference.menu1.breadcrumbs": {
        "label": "Breadcrumbs",
        "icon": "more_horiz",
        "routeId": "voyzu.ui-reference.page.breadcrumbs"
      },
      "ui-reference.menu1.button": {
        "label": "Button",
        "icon": "smart_button",
        "routeId": "voyzu.ui-reference.page.button"
      },
      "ui-reference.menu1.checkbox": {
        "label": "Checkbox",
        "icon": "check_box",
        "routeId": "voyzu.ui-reference.page.checkbox"
      },
      "ui-reference.menu1.confirm-dialog": {
        "label": "Confirm Dialog",
        "icon": "help_center",
        "routeId": "voyzu.ui-reference.page.confirm-dialog"
      },
      "ui-reference.menu1.context-switcher": {
        "label": "Context Switcher",
        "icon": "switch_account",
        "routeId": "voyzu.ui-reference.page.context-switcher"
      },
      "ui-reference.menu1.data-table": {
        "label": "Data Table",
        "icon": "table_chart",
        "routeId": "voyzu.ui-reference.page.data-table"
      },
      "ui-reference.menu1.date-picker": {
        "label": "Date Picker",
        "icon": "calendar_today",
        "routeId": "voyzu.ui-reference.page.date-picker"
      },
      "ui-reference.menu1.dropdown-menu": {
        "label": "Dropdown Menu",
        "icon": "arrow_drop_down_circle",
        "routeId": "voyzu.ui-reference.page.dropdown-menu"
      },
      "ui-reference.menu1.editable-grid": {
        "label": "Editable Grid",
        "icon": "grid_on",
        "routeId": "voyzu.ui-reference.page.editable-grid"
      },
      "ui-reference.menu1.filter-panel": {
        "label": "Filter Panel",
        "icon": "filter_list",
        "routeId": "voyzu.ui-reference.page.filter-panel"
      },
      "ui-reference.menu1.input": {
        "label": "Input",
        "icon": "input",
        "routeId": "voyzu.ui-reference.page.input"
      },
      "ui-reference.menu1.left-nav": {
        "label": "Left Nav",
        "icon": "left_panel_open",
        "routeId": "voyzu.ui-reference.page.left-nav"
      },
      "ui-reference.menu1.mobile-drawer": {
        "label": "Mobile Drawer",
        "icon": "menu",
        "routeId": "voyzu.ui-reference.page.mobile-nav-drawer"
      },
      "ui-reference.menu1.radio": {
        "label": "Radio",
        "icon": "radio_button_checked",
        "routeId": "voyzu.ui-reference.page.radio"
      },
      "ui-reference.menu1.searchable-select": {
        "label": "Searchable Select",
        "icon": "arrow_drop_down_circle",
        "routeId": "voyzu.ui-reference.page.searchable-select"
      },
      "ui-reference.menu1.split-button": {
        "label": "Split Button",
        "icon": "vertical_split",
        "routeId": "voyzu.ui-reference.page.split-button"
      },
      "ui-reference.menu1.textarea": {
        "label": "Textarea",
        "icon": "notes",
        "routeId": "voyzu.ui-reference.page.textarea"
      },
      "ui-reference.menu1.toast": {
        "label": "Toast",
        "icon": "notifications",
        "routeId": "voyzu.ui-reference.page.toast"
      },
      "ui-reference.menu1.toggle-switch": {
        "label": "Toggle Switch",
        "icon": "toggle_on",
        "routeId": "voyzu.ui-reference.page.toggle-switch"
      },
      "ui-reference.menu1.top-menu-bar": {
        "label": "Top Menu Bar",
        "icon": "tab",
        "routeId": "voyzu.ui-reference.page.top-menu-bar"
      },
      "ui-reference.menu1.validation-alert": {
        "label": "Validation Alert",
        "icon": "error",
        "routeId": "voyzu.ui-reference.page.validation-alert"
      }
    }
  },
  {
    "label": "CSS Modules",
    "items": {
      "ui-reference.menu2.typography": {
        "label": "Typography",
        "icon": "title",
        "routeId": "voyzu.ui-reference.page.typography"
      }
    }
  },
  {
    "label": "CSS Variables",
    "items": {
      "ui-reference.menu3.colors": {
        "label": "Colors",
        "icon": "palette",
        "routeId": "voyzu.ui-reference.page.colors"
      }
    }
  },
  {
    "label": "Patterns",
    "items": {
      "ui-reference.menu4.icons": {
        "label": "Icons",
        "icon": "interests",
        "routeId": "voyzu.ui-reference.page.icons"
      },
      "ui-reference.menu4.validation": {
        "label": "Validation",
        "icon": "rule",
        "routeId": "voyzu.ui-reference.page.validation"
      },
      "ui-reference.menu4.responsive": {
        "label": "Responsive",
        "icon": "devices",
        "routeId": "voyzu.ui-reference.page.responsive"
      }
    }
  }
] as const satisfies readonly UiSurfaceMenuGroup[];
