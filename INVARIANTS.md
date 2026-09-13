# ENGINEERING INVARIANTS

These rules are absolute and non-negotiable. Every AI agent and human engineer must adhere to them at all times.

---

## NEVER

1. **NEVER commit secrets**: No API keys, passwords, bearer tokens, private keys, database credentials, or `.env` files containing live secrets.
2. **NEVER bypass security**: Do not disable authentication, authorization, CORS restrictions, CSRF protections, or TLS verification to make things work.
3. **NEVER delete or weaken tests to make CI pass**: Failing tests indicate broken contracts or bugs. Fix the implementation, never weaken the assertion without explicit justification.
4. **NEVER fabricate test results**: Never state "tests should pass" or report unexecuted tests as verified. You must execute the test suite and cite exact numbers (`X passed, Y failed`).
5. **NEVER claim verification without running verification**: An implementation is not verified until the build, linter, or test suite has executed with exit code 0.
6. **NEVER silently break APIs**: Never remove fields, alter response schemas, change HTTP status codes, or modify signatures without deprecation warnings and backward compatibility.
7. **NEVER modify production or run destructive operations without human approval**: Autonomy Level 3 operations (production DB migration, cloud resource deletion, prod deploy) require explicit human consent.
8. **NEVER introduce unnecessary dependencies**: Evaluate standard library options first. Check bundle impact, licensing, maintenance status, and security track record before adding packages.
9. **NEVER rewrite working systems without justification**: Do not refactor functional, tested subsystems unless explicitly requested or required by an architectural decision.
10. **NEVER overwrite user work or modify unrelated files**: Confine changes strictly to the task scope.

---

## ALWAYS

1. **ALWAYS inspect existing code before modifying**: Understand directory structure, existing patterns, dependencies, and architectural boundaries before writing code.
2. **ALWAYS follow repository rules and active ADRs**: The actual codebase and existing configurations are the primary source of truth.
3. **ALWAYS reuse existing abstractions**: Use existing UI components, utility classes, client wrappers, and domain models rather than reinventing them.
4. **ALWAYS test meaningful changes**: Write unit or integration tests for new business logic, bug fixes, and schema changes following TDD where feasible.
5. **ALWAYS inspect the final Git diff**: Verify every changed file before declaring completion. Ensure no debug code, console dumps, or temporary artifacts remain.
6. **ALWAYS report verification accurately**: Distinguish strictly between `IMPLEMENTED`, `TESTED`, `VERIFIED`, `NOT VERIFIED`, and `KNOWN RISKS`.
7. **ALWAYS document architectural decisions**: Major decisions must be recorded in `docs/adr/` or `ADR/`.
8. **ALWAYS preserve backward compatibility**: Ensure database migrations are forward/backward compatible and APIs gracefully handle legacy consumers.
9. **ALWAYS enforce least privilege**: Configure minimal permissions for MCP tools, IAM roles, database users, and file access.
