# Contributing to Runox UI

First off, thank you for considering contributing to Runox UI. It's people like you that make Runox UI such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](https://github.com/Torque-Foundry/runox-ui/issues) to see if someone else in the community has already created a ticket. If not, go ahead and make one!

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
