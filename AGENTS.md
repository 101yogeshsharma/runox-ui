# Implementation Planning Rule

Trigger: user asks for an implementation plan covering multiple stages, whether or not they use the word "phased."

If the plan has 3+ phases:

- Create `plans/<feature-name>/` (kebab-case).
- One file per phase: `phase-1-<short-name>.md`, `phase-2-<short-name>.md`, ...
- Add `overview.md`: lists phases in order, and dependencies between them.

If the plan has 1–2 phases:

- Write a single `plans/<feature-name>.md` — no subfolder.

Each phase document must include these sections, in order:

1. Objective — what this phase delivers
2. Scope — explicitly in and out of scope
3. Steps — ordered, concrete implementation steps
4. Files/modules affected
5. Dependencies — other phases or external systems
6. Risks and open questions
7. Testing/validation approach
8. Rollback plan (if applicable)
9. Definition of done

Rules:

- Do not restate context already covered in overview.md.
- If a plan for the same feature already exists, update it in place — do not create a duplicate folder.

# Git Commits and Pushes Rule
- **NEVER** automatically run `git commit` or `git push` unless the user explicitly requests it.
- **ALWAYS** ask for the user's permission and wait for approval before committing or pushing changes to the repository.
