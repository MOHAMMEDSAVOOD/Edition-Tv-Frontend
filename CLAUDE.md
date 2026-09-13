# CLAUDE.md — Claude Code Engineering Guidelines

This repository enforces strict software engineering discipline under the **AI Engineering OS**.

## Operating Commands & Build Tools

- **Build**: Run the local build script or build tool for this repo (e.g. `./gradlew bootJar` or `pnpm build`).
- **Test**: Run test suite (e.g. `./gradlew test` or `pnpm test`). Always capture and report exact pass/fail counts.
- **Lint & Typecheck**: Run formatters and linters (e.g. `pnpm lint`, `./gradlew spotlessCheck`).
- **Audit & Invariants**: Inspect `INVARIANTS.md` and `DEFINITION_OF_DONE.md` before finalizing changes.

## Development Principles

1. **Explore First**: Always inspect the repository files, directory structure, and existing abstractions before proposing edits.
2. **Atomic Edits**: Avoid broad rewrites. Keep changes minimal, targeted, and cohesive.
3. **No Phantom Claims**: Execute real test commands. Never claim code is verified without running the build/tests.
4. **Section 29 Report**: Conclude every completed task with the mandatory 8-section report (Summary, Files Changed, Engineering Decisions, Tests, Verification Status, Security, Risks, Next Steps).
