# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default-Deny Catch-All**: Every path not explicitly matched is denied by `match /{document=**} { allow read, write: if false; }`.
2. **Verified Authentication**: Every write (`create`, `update`, `delete`) requires `isSignedIn()` AND `request.auth.token.email_verified == true`.
3. **Path Variable Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) validates `{userId}` and `{vehicleId}` via `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **PII Isolation & Zero Blanket Reads**: `/users/{userId}` contains PII (`email`, `displayName`, `city`). Access (`get`) is restricted strictly to `isOwner(userId)` (`request.auth.uid == userId`). `list` on `/users` is completely forbidden (`allow list: if false;`).
5. **Relational Master Gate on Subcollection**: A `/users/{userId}/vehicles/{vehicleId}` document can only exist if `/users/$(userId)` exists (`exists(/databases/$(database)/documents/users/$(userId))`) and its `uid == request.auth.uid`, and `incoming().ownerId == userId && userId == request.auth.uid`.
6. **Secure List Enforcer on Vehicles**: `allow list` on `/users/{userId}/vehicles/{vehicleId}` strictly verifies `isSignedIn() && request.auth.uid == userId && resource.data.ownerId == request.auth.uid` without `get()`/`exists()` inside `list`.
7. **Temporal & Identity Immutability**: `createdAt` and `updatedAt` must equal `request.time` on `create`. On `update`, `createdAt`, `uid`, `email`, and `ownerId` are immutable (`incoming().createdAt == existing().createdAt`, `incoming().uid == existing().uid`, `incoming().ownerId == existing().ownerId`), and `updatedAt == request.time`.
8. **Strict Key & Size Enforcement**: Every entity validation helper (`isValidUserProfile`, `isValidUserVehicle`) uses `data.keys().hasAll(...)` and `data.keys().hasOnly(...)` along with strict `.size()` bounds and enum allowlists.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 — Identity Spoofing on Profile Create**:
   ```json
   {
     "uid": "victim-uid-999",
     "displayName": "Attacker",
     "email": "attacker@example.com",
     "city": "London",
     "primaryMake": "BMW",
     "primaryModel": "M3",
     "primaryYear": "2025",
     "chassisCode": "G80",
     "exteriorPaint": "Mint Green",
     "brakeSystem": "M Carbon Ceramic",
     "preferredFinish": "silver",
     "createdAt": "SERVER_TIMESTAMP",
     "updatedAt": "SERVER_TIMESTAMP"
   }
   ```
   *Rejected by*: `data.uid == request.auth.uid && userId == request.auth.uid`.

2. **Payload 2 — Shadow Field Injection ("isAdmin": true)**:
   ```json
   {
     "uid": "user-1",
     "displayName": "Driver",
     "email": "driver@example.com",
     "city": "London",
     "primaryMake": "BMW",
     "primaryModel": "M3",
     "primaryYear": "2025",
     "chassisCode": "G80",
     "exteriorPaint": "Mint Green",
     "brakeSystem": "M Carbon Ceramic",
     "preferredFinish": "silver",
     "isAdmin": true,
     "createdAt": "SERVER_TIMESTAMP",
     "updatedAt": "SERVER_TIMESTAMP"
   }
   ```
   *Rejected by*: `data.keys().hasOnly([...])`.

3. **Payload 3 — Unverified Email Write**:
   Auth token has `email_verified: false`.
   *Rejected by*: `isVerifiedUser()` (`request.auth.token.email_verified == true`).

4. **Payload 4 — Cross-User PII Read (`get /users/other-user`)**:
   Authenticated as `user-1`, reading `/users/user-2`.
   *Rejected by*: `allow get: if isSignedIn() && isValidId(userId) && request.auth.uid == userId`.

5. **Payload 5 — Blanket User Directory Scraping (`list /users`)**:
   Authenticated user attempts collection query on `/users`.
   *Rejected by*: `allow list: if false`.

6. **Payload 6 — Denial-of-Wallet Oversized String (`notes` > 500 chars)**:
   ```json
   {
     "ownerId": "user-1",
     "make": "BMW",
     "model": "M3",
     "year": "2025",
     "chassisCode": "G80",
     "exteriorPaint": "Mint Green",
     "brakeSystem": "M Carbon Ceramic",
     "targetWheelSlug": "type-52",
     "targetFinish": "silver",
     "notes": "A... (10,000 characters)",
     "createdAt": "SERVER_TIMESTAMP",
     "updatedAt": "SERVER_TIMESTAMP"
   }
   ```
   *Rejected by*: `data.notes is string && data.notes.size() <= 500`.

7. **Payload 7 — ID Poisoning (`vehicleId` with special characters / > 128 chars)**:
   Path: `/users/user-1/vehicles/bad$id!@#`
   *Rejected by*: `isValidId(vehicleId)` regex `^[a-zA-Z0-9_\-]+$`.

8. **Payload 8 — Orphaned Vehicle Creation Without Parent Profile**:
   Authenticated `user-1` creates `/users/user-1/vehicles/v-1` before `/users/user-1` exists.
   *Rejected by*: `get(/databases/$(database)/documents/users/$(userId)).data.uid == request.auth.uid`.

9. **Payload 9 — Immutable Field Tampering on Update (`createdAt` or `uid` mutation)**:
   Update payload modifies `createdAt` or `uid` on `/users/user-1`.
   *Rejected by*: `incoming().createdAt == existing().createdAt && incoming().uid == existing().uid` and `affectedKeys().hasOnly(...)`.

10. **Payload 10 — Forged Client Timestamp (`createdAt` in the past/future)**:
    Payload supplies `createdAt: Timestamp.fromMillis(1000000)` instead of `serverTimestamp()`.
    *Rejected by*: `incoming().createdAt == request.time`.

11. **Payload 11 — Invalid Enum Value (`preferredFinish: "neon-pink"`)**:
    Payload sets `preferredFinish` to a value outside `['silver', 'satin-black', 'gloss-black', 'champagne', 'dark-tint']`.
    *Rejected by*: `data.preferredFinish in ['silver', 'satin-black', 'gloss-black', 'champagne', 'dark-tint']`.

12. **Payload 12 — Cross-User Vehicle Subcollection List (`list /users/user-2/vehicles`)**:
    Authenticated `user-1` attempts to list vehicles under `user-2`.
    *Rejected by*: `allow list: if isSignedIn() && request.auth.uid == userId && resource.data.ownerId == request.auth.uid`.
