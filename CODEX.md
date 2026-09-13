# CODEX.md — OpenAI Codex CLI Engineering Guidelines

This repository enforces strict software engineering discipline under the **AI Engineering OS**.

## Rules of Engagement

1. **Repository Authority**: The code and existing configuration in this repository are the ground truth. Never assume architecture without checking actual files.
2. **Autonomy Gating**: Level 1 (Development) is active for editing and testing. Level 2 (Git commits/branches) and Level 3 (Production/Cloud) require explicit developer confirmation.
3. **Hermetic Testing**: Run tests via the repository's native test runner. Report exact output and test counts.
4. **Security Invariants**: Never commit secrets or bypass auth checks. Ensure all user inputs are sanitized and validated.
5. **Report Format**: Provide the structured Section 29 response upon task completion.
