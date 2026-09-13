# ENGINEERING STANDARDS & ARCHITECTURAL PRINCIPLES

This document establishes the mandatory engineering standards for all codebase interactions across backend, frontend, database, and infrastructure layers.

---

## 1. Core Principles

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- **DRY (Don't Repeat Yourself)**: Eliminate duplicated business logic and UI patterns.
- **KISS (Keep It Simple, Stupid)**: Favor clear, simple solutions over clever abstractions.
- **YAGNI (You Aren't Gonna Need It)**: Do not add speculative features or premature abstractions.
- **Separation of Concerns**: Strict boundaries between presentation, domain logic, persistence, and external adapters.
- **High Cohesion & Low Coupling**: Keep related logic grouped together; minimize hard dependencies across modules.
- **Fail-Fast**: Validate arguments and state early; fail with structured, descriptive domain exceptions.
- **Secure by Default**: Principle of least privilege, zero-trust input validation, explicit authorization.
- **Observable by Design**: Structured JSON logging, OpenTelemetry tracing, and key metric emission.

---

## 2. Anti-Patterns to Avoid

- **Giant Functions / Methods**: Functions exceeding 40-50 lines must be evaluated for extraction.
- **Giant UI Components**: React/Next.js components exceeding 150-200 lines should be split into smaller subcomponents.
- **God Classes**: Classes managing multiple concerns (e.g. database access, business rules, and HTTP parsing in one place).
- **Hidden Side Effects**: Functions that mutate external state unexpectedly without clear naming or contracts.
- **Silent Failures**: Empty catch blocks (`catch (e) {}`), swallowed errors, or returning null instead of throwing or returning `Optional`/`Result`.
- **Premature Optimization**: Complex caching or multi-threading before measuring actual bottlenecks.
- **Dependency Proliferation**: Adding npm or Gradle dependencies for trivial tasks (e.g. `left-pad`, trivial date helpers).

---

## 3. Layered Architecture Guidelines

### Backend Architecture
```
[ Controllers / REST Endpoints / STOMP Handlers ]
                   ↓ (DTOs / Request Objects)
[ Application Services / Use Cases ]
                   ↓ (Domain Models / Entities)
[ Domain Logic / Modulith Boundaries ]
                   ↓ (Repository Interfaces)
[ Infrastructure / Repositories / External Adapters (PostgreSQL, MinIO, RabbitMQ, OpenSearch) ]
```

### Frontend Architecture
```
[ Pages / App Router Views (`app/`) ]
                   ↓
[ Feature Components (`features/`) ]
                   ↓
[ Shared UI Components (`components/ui/`) ]
                   ↓
[ Hooks & State Stores (`hooks/`, `stores/`) ]
                   ↓
[ API Client Layer (`lib/api/`) ]
```

---

## 4. Code Quality & Review Gates

Every non-trivial code modification must undergo a self-review evaluating:
1. **Correctness**: Does it fulfill all functional requirements?
2. **Edge Cases**: Empty states, null values, network failures, timeouts, concurrent access.
3. **Security**: OWASP compliance, injection protection, auth check.
4. **Performance**: N+1 queries, memory consumption, bundle size impact.
5. **Maintainability**: Clear naming, clean types, comprehensive docstrings/javadocs on public interfaces.
