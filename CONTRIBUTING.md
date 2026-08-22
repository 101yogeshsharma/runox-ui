# Contributing to Runox UI

First off, thank you for considering contributing to Runox UI. It's people like you that make Runox UI such a great tool.

## Styling Conventions

All component styles must follow these rules. The CSS custom properties in `src/styles/globals.css` are the single source of truth for design tokens.

### Spacing

Use the density scale — never raw px/rem values:

```css
/* Correct */
padding: calc(1rem * var(--rnx-space-scale, 1));
gap: calc(0.5rem * var(--rnx-space-scale, 1));

/* Wrong */
padding: 16px;
gap: 0.5rem;
```

Font sizes use `var(--rnx-text-scale, 1)` with the same pattern.

### Colors

Only semantic CSS variables (`--background`, `--foreground`, `--primary`, `--border`, `--muted`, etc.). Never hardcode hex values outside `globals.css` token definitions or `src/utils/contrast.ts`.

### Radius

- Default: `border-radius: var(--radius)`
- Derived: `calc(var(--radius) ± Npx)` when a step is needed
- Pills/circles: `border-radius: var(--radius-full)` — never `9999px`
- Named steps: `var(--radius-sm|md|lg|xl)` from `@theme`

### Borders

- Default width is `1px` with `var(--border)`
- `2px` only for focus rings, dropzones, and drag indicators
- Any other width requires a `/* border-exception: <reason> */` comment

### Class naming

New components use strict BEM: `.rnx-<block>`, `.rnx-block__element`, `.rnx-block__element--modifier`. Interactive state uses `data-state` attributes. Block names are never abbreviated (use `rnx-navigation-menu`, not `rnx-nav-menu`). A CSS file must never define selectors under two different block prefixes.

Renaming an existing public class requires shipping the new class alongside the old for one minor version (shared selector list) plus a dev-mode deprecation warning via `src/utils/warn.ts`.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](https://github.com/101yogeshsharma/runox-ui/issues) to see if someone else in the community has already created a ticket. If not, go ahead and make one!

## Fork & create a branch

If this is something you think you can fix, then fork Runox UI and create a branch with a descriptive name.

## Local Setup

1. Install Node.js >= 18
2. Clone your fork and run `npm install`
3. Start the testbench app using `npm run dev -w runox-testbench`
4. Make your changes in `packages/ui`
5. Ensure linting and tests pass: `npm run lint` and `npm run test`

## Changeset

We use Changesets to manage versions and changelogs. Before you commit, run:

```bash
npx changeset
```

Select the packages you modified (typically `@runox/ui`), choose the version bump type (patch for bug fixes, minor for new features), and write a summary of your changes. This will generate a file in `.changeset` which should be included in your commit.

## Pull Request

When you're ready, open a Pull Request. We will review it and merge it. Make sure you have included tests for your changes, and that all CI checks pass.
