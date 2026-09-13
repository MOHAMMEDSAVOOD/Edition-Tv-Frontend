# @edition/auth

Shared Firebase Authentication client for the Edition TV monorepo.

- Initialises the Firebase Web SDK lazily and only in the browser from
  `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
  `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
  (optional `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`).
- Sessions are persisted by Firebase (IndexedDB). No tokens in localStorage or cookies.
- Every API call sends `Authorization: Bearer <Firebase ID token>`; the Spring
  backend verifies it and exposes `GET /auth/me` → `{ id, username, email, firstName, lastName, roles }`.

## API

| Export | Purpose |
| --- | --- |
| `signInWithEmail(email, password)` | Email/password sign-in |
| `signInWithGoogle()` | Google popup sign-in |
| `registerWithEmail(email, password, displayName?)` | Create account |
| `sendPasswordReset(email)` | Firebase password-reset email |
| `signOut()` | Sign out |
| `getIdToken(forceRefresh?)` | Current ID token or `null` |
| `onAuthStateChanged(cb)` | Subscribe; returns unsubscribe |
| `fetchMe(apiBaseUrl?)` | `GET /auth/me` with bearer token → `MeProfile` |
| `AuthProvider` / `useAuth()` | React context caching the Firebase user and `/auth/me` profile (`{ user, loading, profile, roles, hasRole, hasAnyRole, refreshProfile, signOut }`) |
| `authService` | Facade: `login`, `loginWithGoogle`, `register`, `forgotPassword`, `me`, `logout` |
| `hasRole`, `hasAnyRole`, `STAFF_ROLES`, `displayNameOf`, `describeAuthError` | Helpers |
