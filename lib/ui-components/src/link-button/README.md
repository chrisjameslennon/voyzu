# LinkButton

Compact outlined navigation link using shared semantic colours and control radius.

```tsx
import { LinkButton } from "@voyzu/ui-components";
<LinkButton href="/inventory/items/COFFEE">View inventory item</LinkButton>
```

Required: href. Content: children. Optional: icon (Material Symbol), className and native anchor attributes such as target, rel, aria-label and onClick. It retains native link behaviour including opening in a new tab. Use Button for actions; use the typography link class for inline prose. Give icon-only links an aria-label. There is no disabled link state.
