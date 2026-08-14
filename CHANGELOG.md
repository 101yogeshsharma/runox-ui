# @runox/ui

## 0.2.0

### Minor Changes

-   **Liquid Glass Enhancements**: Implemented true liquid glass chromatic refraction effect across Card components utilizing SVG displacement filters and chromatic aberration layers.
-   **Performance Optimization**: Lazy-loaded heavy dependencies (`react-hook-form`, `zod`, `@hookform/resolvers`) in code previews, drastically improving initial page load time.
-   **CSS Variable Interpolation Bug**: Fixed Tailwind CSS class purging bugs for `border-radius` variables by providing a static map for standard sizes instead of dynamic string interpolation.
-   **Animation Fixes**: Resolved an issue with the Accordion component where a static `hidden` attribute bypassed CSS `grid-template-rows` height transitions, ensuring butter-smooth expanding and collapsing.
-   **Accessibility Improvements**: Improved accessibility across `Accordion`, `ThemeToggle`, `MobileNav`, and `Sidebar` with proper `aria-hidden`, `inert`, and `aria-label` attributes.
-   **Hover States**: Adjusted Slider component's hover and active styling to use a subtle 5% transparent overlay instead of flooding the track background with `var(--ring)`.
-   **Next.js Alignment**: Removed deprecated `legacyBehavior` on `<Link>` elements, transitioning `Button` components to use `asChild` / `as="span"` wrappers.
-   **General UI Polish**: Enhanced layout contrast, shadow depths, and typography hierarchy to establish a stronger, premium visual language.
