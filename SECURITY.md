# SECURITY POLICY & STANDARDS

Security is enforced by default at every layer of the architecture.

---

## 1. Zero Tolerance Policies

1. **No Committed Secrets**:
   - Never commit API keys, database credentials, AWS access keys, JWT signing secrets, or private certificates.
   - Scan every diff before commit using automated secret scanning (`git diff`, `gitleaks`, or regex checks).
   - `.env` files in git repositories must only contain dummy/mock values (`.env.example`).
2. **Strict Principle of Least Privilege**:
   - Database roles must only have permissions required for their specific workload.
   - API endpoints must enforce granular RBAC/ABAC permissions.
   - Agents operate at Level 1 (Development) by default and cannot perform Level 3 (Production) actions without human authorization.

---

## 2. OWASP Top 10 Mitigation

- **A01: Broken Access Control**: Verify user permissions on every backend endpoint and service call. Never rely on frontend route guards alone.
- **A02: Cryptographic Failures**: Use strong, modern cryptography (Argon2id, bcrypt, AES-256-GCM, TLS 1.3). Never roll custom cryptographic algorithms.
- **A03: Injection**: Use parameterized SQL queries (JPA, Hibernate, prepared statements). Never concatenate unescaped input into SQL, shell commands, or HTML.
- **A04: Insecure Design**: Threat model before writing code. Enforce business logic constraints in the domain model.
- **A05: Security Misconfiguration**: Disable default passwords, verbose debug stacktraces in production, and unneeded HTTP headers. Enable CSP, HSTS, X-Frame-Options.
- **A06: Vulnerable and Outdated Components**: Keep dependencies updated. Audit dependencies via `npm audit` or `gradle dependencyCheck`.
- **A07: Identification and Authentication Failures**: Enforce rate limiting on login/auth endpoints. Implement secure session invalidation and short-lived JWTs.
- **A08: Software and Data Integrity Failures**: Verify integrity of third-party packages, Docker base images, and external dependencies.
- **A09: Security Logging and Monitoring Failures**: Log all authentication events, privilege escalations, and failed authorization attempts with structured timestamps.
- **A10: Server-Side Request Forgery (SSRF)**: Validate and restrict external URLs fetched by media workers or ingestion pipelines to approved CIDR ranges.

---

## 3. Reporting Security Vulnerabilities

If an agent or engineer identifies a security vulnerability:
1. Do NOT commit code or tests containing live exploit vectors to public repositories.
2. File an urgent issue or notify the security lead directly.
3. Prepare a patched branch with a regression test validating the remediation.
