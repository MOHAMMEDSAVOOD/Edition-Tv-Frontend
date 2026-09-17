# Swagger & OpenAPI CLI Guide (Edition TV)

This repository includes both **`@apidevtools/swagger-cli`** and **`openapi-typescript`** for validating Swagger/OpenAPI schemas, bundling definitions, and generating TypeScript types.

---

## 1. Quick Commands

| Task | Command | Description |
|---|---|---|
| **Validate API Spec** | `npm run swagger:validate -- <spec-file>` | Validates Swagger 2.0 or OpenAPI 3.0 spec against official schemas |
| **Bundle Multiple Specs** | `npm run swagger:bundle -- <spec-file> -o bundled.json` | Resolves all `$ref` pointers into a single combined file |
| **Generate TS Types (Remote)** | `npm run api:types` | Generates TypeScript interfaces from `https://swagger.editiontv.com/v3/api-docs` |
| **Generate TS Types (Local)** | `npm run api:types:local` | Generates TypeScript interfaces from local `openapi.json` |
| **Custom Type Generation** | `npm run swagger:types -- <file-or-url> -o <output.d.ts>` | Flexible CLI command with custom input/output options |

---

## 2. Usage with `https://swagger.editiontv.com`

`https://swagger.editiontv.com` hosts the complete Edition TV Swagger UI and OpenAPI specifications behind Google Cloud Identity-Aware Proxy (IAP).

### Option A: Direct Sync from File or Generator (Recommended)
1. If updating from the live Swagger catalog:
   Run the generator script to compile the complete 37-controller backend spec:
   ```bash
   node scripts/build-openapi-spec.mjs
   ```
2. Or download the raw OpenAPI JSON from [`https://swagger.editiontv.com`](https://swagger.editiontv.com) and save as `openapi.json`.
3. Validate the schema:
   ```bash
   npm run swagger:validate -- openapi.json
   ```
4. Generate full TypeScript interfaces:
   ```bash
   npm run api:types:local
   ```
   The resulting types are written to `packages/api/schema.d.ts` and exported directly from `@edition/api`.

---

### Option B: Bundle Multi-File Schemas
If your Swagger definition is split across multiple YAML/JSON files:
```bash
npm run swagger:bundle -- openapi.yaml -o openapi.bundled.json -r
```
- `-r` / `--dereference`: Inlines all `$ref` components into a single standalone file.

---

### Option C: Validate Schema Before Commit
You can run:
```bash
npm run swagger:validate -- openapi.json
```
If there are duplicate endpoints, invalid parameter schemas, or broken types, `swagger-cli` exits with a detailed error message and non-zero exit code.
