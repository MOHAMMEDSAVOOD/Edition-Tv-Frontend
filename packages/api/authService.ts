/**
 * Auth lives in `@edition/auth` (Firebase). This module only re-exports the
 * facade so existing `import { authService } from "@edition/api"` keeps working.
 */
export { authService } from "@edition/auth";
export type { LoginResult, MeProfile, Role } from "@edition/auth";
