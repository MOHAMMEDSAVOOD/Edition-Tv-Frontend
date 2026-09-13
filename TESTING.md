# TESTING STANDARDS & METHODOLOGY

Tests are not an afterthought; they are the executable specification of correctness.

---

## 1. Testing Hierarchy

```
        / \
       / E2E \       Playwright / Cypress (Critical journeys)
      /-------\
     /  Integ  \     Testcontainers / SpringBootTest / MockServer (Integration & DB)
    /-----------\
   /    Unit     \   JUnit 5 / Vitest / Jest (Business rules & Domain logic)
  /---------------\
```

---

## 2. Testing Principles

1. **Tests are Proof**:
   - Never claim: *"Tests should pass."* or *"Code looks good."*
   - Always report exact counts: *"Executed `./gradlew test`: 184 tests passed, 0 failed."*
2. **Never Weaken Tests**:
   - If a test fails after your changes, investigate the root cause.
   - Do not comment out assertions or delete tests simply to obtain a green build.
3. **Test-Driven Development (TDD) Preferred**:
   - For bug fixes: Write a reproducing failing test first, then fix the code until the test passes.
   - For new features: Define interface contract tests before implementing complex logic.
4. **Fast and Isolated**:
   - Unit tests must be hermetic and execute in milliseconds without network or live database requirements.
   - Integration tests must spin up isolated ephemeral fixtures (e.g. Testcontainers or test DB schemas).

---

## 3. Test Categories

- **Unit Tests**: Test single classes, pure functions, utility methods, and domain entities with isolated mocks.
- **Integration Tests**: Verify database queries, transactional outbox handlers, REST controller endpoints, and Spring Modulith interactions.
- **Contract Tests**: Verify API response schemas match OpenAPI specifications.
- **End-to-End (E2E) Tests**: Verify complete user flows across UI, API, and persistence.
- **Security Tests**: Test role-based access control (RBAC), unauthorized endpoints (401/403), and injection handling.

---

## 4. Test Reporting Standard

When reporting completed work, the test section must include:
```markdown
### Tests
- **Command**: `./gradlew test` (or `pnpm test`)
- **Results**: 42 passed, 0 failed, 0 skipped.
- **Covered Scenarios**:
  - Valid input generates expected record.
  - Unauthorized user receives 403 Forbidden.
  - Invalid payload returns 400 Bad Request with error detail.
```
