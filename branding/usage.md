---
description: Place the Assign identity clearly, label linked marks and preserve accessible contrast.
---

# Usage and accessibility

## Placement and attribution

Use a supplied mark to identify Assign accurately. Keep it separate from partner marks, headlines and controls using the [clear-space rule](/branding/logos#clear-space). Use a plain surface if a photograph or pattern makes the symbol hard to distinguish.

Do not modify the geometry, add shadows or gradients, put other artwork inside the mark, or imply an affiliation or endorsement that does not exist. Do not add a registration symbol or assert trademark registration on the strength of these assets.

## Accessible names

When the mark is the only content of a link, name the destination, for example `Assign home`. When it sits beside visible text that already names the same link, use an empty image alternative to avoid repeating that text.

```html
<a href="https://assign.so/">
  <img src="/branding/assign-mark-oil.svg" alt="Assign home" width="24" height="24">
</a>
```

For a decorative inline SVG beside visible Assign text, hide the SVG from assistive technology. A source SVG's built-in label does not replace the accessible name and keyboard behavior of its containing control. Follow the [W3C guidance for functional images](https://www.w3.org/WAI/tutorials/images/functional/).

## Contrast

Choose a clearly visible mark: prefer Oil black on light surfaces and white on dark surfaces. Aim for at least **3:1** against the adjacent surface when the graphic carries functional information. Check the complete control and its focus state in context.

WCAG's [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) applies to required visual information in controls and meaningful graphics, with specified exceptions. Logos also have exceptions under the [text contrast criterion](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Those exceptions are not a reason to make the identity difficult to see.

Test keyboard access, focus visibility, image alternatives, light/dark backgrounds and zoom in the final placement. Following a brand guide alone does not establish accessibility conformance for a page or application.
