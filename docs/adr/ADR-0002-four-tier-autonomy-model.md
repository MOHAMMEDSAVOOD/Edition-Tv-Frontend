# ADR-0002: Four-Tier Autonomy & Permission Model

- **Status**: Accepted
- **Date**: 2026-09-13
- **Deciders**: Engineering Team & AI Agents

## Context & Problem Statement
Unrestricted AI agents can accidentally run destructive commands, commit unvetted code, or alter production databases. Conversely, requiring approval for reading files or running local tests destroys developer velocity.

## Decision Outcome
Adopt a 4-tier autonomy model:
- Level 0 (Read): Fully autonomous exploration.
- Level 1 (Development): Autonomous local editing, building, and testing.
- Level 2 (Git): Controlled gate for branch creation, commits, pushes, and PRs.
- Level 3 (Production/External): Mandatory human approval for cloud infrastructure, production DB migrations, and resource deletion.

### Positive Consequences
- Maximum developer velocity for local implementation and TDD.
- Safe-by-default boundary preventing accidental production damage.
