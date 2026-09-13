# DEFINITION OF DONE (DoD)

A task is officially complete **only** when all applicable criteria below are satisfied. An agent must NOT declare completion merely because code generation finished.

---

## 12-Point Verification Checklist

1. [ ] **Requirements Satisfied**: All functional criteria specified by the developer are fulfilled without unauthorized scope creep.
2. [ ] **Implementation Complete**: Code is modular, adheres to SOLID principles, and introduces no giant functions, components, or god classes.
3. [ ] **Automated Tests Pass**: Relevant unit, integration, and contract tests have executed successfully with exact pass/fail counts documented.
4. [ ] **Type Checking Passes**: Strict typing passes without errors (e.g. `tsc --noEmit`, Java compiler type checks).
5. [ ] **Linting & Formatting Pass**: Repository linters and formatters pass cleanly (e.g. ESLint, Spotless, Checkstyle, Prettier, Ruff).
6. [ ] **Build Succeeds**: Project builds cleanly in local developer mode (`gradle build -x test`, `pnpm build`, `npm run build`).
7. [ ] **Security Checked**: No committed secrets, OWASP top 10 verified, inputs validated, outputs encoded, authorization policies verified.
8. [ ] **API Compatibility Maintained**: No silently broken contracts, schema regressions, or unversioned breaking changes.
9. [ ] **Database Integrity Checked**: Migrations are reversible, non-blocking where practical, indexed, and schema backward-compatibility is preserved.
10. [ ] **Git Diff Inspected**: Clean `git status` and `git diff`; no stray temporary files, console logs, or unformatted files.
11. [ ] **Documentation Updated**: Architecture docs, READMEs, API specifications, or ADRs are updated when architectural changes occur.
12. [ ] **Standard Report Delivered**: Final output adheres strictly to the Section 29 standard (Summary, Files Changed, Engineering Decisions, Tests, Verification Status, Security, Risks, Next Steps).
