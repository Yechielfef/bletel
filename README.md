# Bletel website

## Change the homepage booklet cover

The angled booklet on the homepage is drawn by the browser from one plain cover image. No mockup app, render script, subscription or assistant is needed.

1. Export the new front cover as a **JPEG**, upright and not mirrored. Use the complete cover, without extra borders. Recommended size: 1650 x 2550 pixels (or the same portrait proportions).
2. Rename it exactly **current-cover.jpg**.
3. On GitHub, open the **img** folder, choose **Add file > Upload files**, and upload it there, replacing **img/current-cover.jpg**. Commit to **main**. If someone sent a ZIP, unzip it first and upload the JPEG, not the ZIP itself.
4. Wait for GitHub Pages to deploy, then refresh the homepage. The curve, right-hand binding, left-hand page edge, lighting and floating shadow stay in place automatically. A cached browser can take a few minutes to show the replacement; a hard refresh helps.

Only the flat image needs changing for the hero's appearance. Keep its filename and location unchanged. This does not change the issue number badge, issue reader/PDF, archive thumbnail or social preview: update those separately when publishing a new issue. The live hero artwork is referenced once, in `index.html` as `href="img/current-cover.jpg"`.

## Restore the original homepage mockup

The original **img/cover-mockup-v2.webp** is preserved unchanged.

In `index.html`, replace only the `<svg class="live-booklet" ...>...</svg>` inside `<span class="mock-lift">` with:

```html
<img alt="Cover of this week's Bletel" height="1400" src="img/cover-mockup-v2.webp?v=4" width="1282" fetchpriority="high" decoding="async"/>
```

The `live-booklet-style` style block may be removed too, but leaving it is harmless when the SVG is absent. Keep the surrounding `mock-lift`, `mock-float`, link, badges and shadows unchanged. Commit to `main` and wait for Pages to deploy. This restores the original hero without undoing unrelated homepage work.
