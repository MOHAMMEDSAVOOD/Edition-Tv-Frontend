# CONTRIBUTING GUIDELINES

We welcome contributions from both human engineers and AI coding agents. Adherence to our engineering standards ensures consistent quality and velocity.

---

## 1. Branching & Git Discipline

- Create focused feature branches:
  - `feat/feature-name`
  - `fix/issue-description`
  - `refactor/subsystem-name`
- Commit messages must follow Conventional Commits:
  - `feat(auth): implement refresh token rotation`
  - `fix(editor): resolve lock release race condition`
  - `test(media): add FFmpeg transcode failure test`
  - `docs(api): document websocket presence endpoint`

---

## 2. Pull Request Standards

Before submitting a PR:
1. Verify all tests pass locally (`pnpm test` or `./gradlew test`).
2. Run linters and code formatters.
3. Verify that new functionality includes unit/integration tests.
4. Update relevant documentation or architecture records.
5. Provide a clear summary with exact test verification results.
