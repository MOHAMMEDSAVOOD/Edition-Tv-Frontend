# ADR-0003: Unified Agent Harness Lifecycle & Evidence Collection

- **Status**: Accepted
- **Date**: 2026-09-13
- **Deciders**: Engineering Team & AI Agents

## Context & Problem Statement
AI coding agents often jump directly into generating code without understanding requirements, leading to broken builds and unsubstantiated claims of completion.

## Decision Outcome
Adopt a unified 6-phase lifecycle: `DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP`. Every task generates an auditable `contract.json`, logs transitions in `events.jsonl`, and requires actual command exit code 0 stored in `evidence.json` before shipping.

### Positive Consequences
- Strict proof of work; phantom test claims are impossible.
- Clear audit trail for all changes.
