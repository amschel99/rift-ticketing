# Recovery System - Frontend Integration Guide

**Base URL:** `https://service.riftfi.xyz`

---

## Quick Reference

| What the user wants | Flow to use | Auth needed |
|---|---|---|
| Set up recovery options (while logged in) | [Recovery Setup](#1-recovery-setup) | JWT + OTP/password |
| Forgot password (externalId user) | [Password Reset](#2-password-reset-flow) | API key only |
| Lost phone/email (phone/email user) | [Account Recovery](#3-account-recovery-flow) | API key only |

---

## Authentication

There are two auth modes depending on the endpoint:

**Authenticated endpoints** (recovery setup/management) — user is logged in:
```
x-api-key: sk_...
Authorization: Bearer <jwt_token>
```

**Public endpoints** (password reset, account recovery) — user is locked out:
```
x-api-key: sk_...
```

### User identification

All recovery management endpoints support **two ways** to identify the user:

1. **JWT token** (recommended for phone/email users) — the user is identified from the `Authorization: Bearer` header automatically. No need to send `externalId` in the body.
2. **externalId** in the request body — for users who signed up with externalId + password.

If both are present, JWT takes priority.

---

## 1. Recovery Setup

These endpoints require the user to be **logged in** (JWT) and verified (OTP/password middleware).

The user should set up recovery options as early as possible after signup. They can add up to 2 recovery methods: a backup email and/or a backup phone number. These are separate from their primary login credentials.

### 1.1 Create Recovery Methods

Call this the first time the user sets up recovery.

```
POST /recovery/create
```

**Body (phone/email user — JWT provides identity):**
```json
{
  "emailRecovery": "backup@gmail.com",
  "phoneRecovery": "+254712345678"
}
```

**Body (externalId user):**
```json
{
  "externalId": "john123",
  "emailRecovery": "backup@gmail.com",
  "phoneRecovery": "+254712345678"
}
```

- At least one of `emailRecovery` or `phoneRecovery` is required
- Both can be provided at once

**Response (201):**
```json
{
  "message": "Recovery methods created successfully",
  "recovery": {
    "id": "uuid",
    "email": "backup@gmail.com",
    "phoneNumber": "+254712345678",
    "createdAt": "2026-02-18T..."
  }
}
```

**Error (400):** Returns error if recovery already exists — use the add/update endpoints instead.

### 1.2 Add a Recovery Method

Adds a second recovery method (e.g., user already has email, wants to add phone). Also creates the recovery record if none exists yet.

```
POST /recovery/add-method
```

**Body:**
```json
{
  "method": "phoneRecovery",
  "value": "+254712345678"
}
```

- `method`: `"emailRecovery"` or `"phoneRecovery"`
- `value`: the email address or phone number
- `externalId`: optional, only needed if no JWT

**Response (200):**
```json
{
  "message": "Recovery phoneRecovery added successfully",
  "recovery": {
    "id": "uuid",
    "email": "backup@gmail.com",
    "phoneNumber": "+254712345678",
    "updatedAt": "..."
  }
}
```

**Error (400):** Returns error if that method already exists — use update endpoint to change it.

### 1.3 Update a Recovery Method

Changes an existing recovery method value (e.g., user wants to change their backup email).

```
PUT /recovery/update-method
```

**Body:**
```json
{
  "method": "emailRecovery",
  "value": "newbackup@gmail.com"
}
```

- `externalId`: optional, only needed if no JWT

**Response (200):**
```json
{
  "message": "Recovery emailRecovery updated successfully",
  "recovery": {
    "id": "uuid",
    "email": "newbackup@gmail.com",
    "phoneNumber": "+254712345678",
    "updatedAt": "..."
  }
}
```

### 1.4 Remove a Recovery Method

Removes one recovery method. Cannot remove the last one — at least one must remain.

```
DELETE /recovery/remove-method
```

**Body:**
```json
{
  "method": "emailRecovery"
}
```

- `externalId`: optional, only needed if no JWT

**Response (200):**
```json
{
  "message": "Recovery emailRecovery removed successfully",
  "recovery": {
    "id": "uuid",
    "email": null,
    "phoneNumber": "+254712345678",
    "updatedAt": "..."
  }
}
```

**Error (400):** `"Cannot remove the last recovery method."` if only one method remains.

### 1.5 Get My Recovery Methods

Returns the user's current recovery methods (unmasked, since they're authenticated).

```
POST /recovery/my-methods
```

**Body:**
```json
{}
```

- `externalId`: optional, only needed if no JWT

**Response (200):**
```json
{
  "recovery": {
    "id": "uuid",
    "email": "backup@gmail.com",
    "phoneNumber": "+254712345678",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Response (404):** `"No recovery methods found for this user"` if none set up.

### 1.6 Delete All Recovery Methods

Removes recovery entirely. User will no longer be able to use password reset or account recovery.

```
DELETE /recovery/delete-all
```

**Body:**
```json
{}
```

- `externalId`: optional, only needed if no JWT

**Response (200):**
```json
{
  "message": "All recovery methods deleted successfully"
}
```

---

## 2. Password Reset Flow

**Who:** Users who signed up with `externalId` + password and forgot their password.

**No login required.** The user is locked out, so these endpoints only need `x-api-key`.

### Flow Diagram

```
User clicks "Forgot Password"
        |
        v
[Step 1] GET /recovery/options/:externalId
        |  --> Shows masked recovery options (e.g. "ba***@gmail.com")
        v
  User picks a recovery method
        |
        v
[Step 2] POST /recovery/request-reset
        |  --> Sends a link to the recovery email/phone
        v
  User clicks the link in email/SMS
  Link opens: https://yourapp.com/reset-password?token=abc123...
        |
        v
[Step 3] GET /recovery/validate-token/:token
        |  --> Check if token is valid before showing the form
        v
  If valid, show the "Enter new password" form
        |
        v
[Step 4] POST /recovery/reset-password
        |  --> Resets the password
        v
  Show success, redirect to login
```

### Step 1: Get Recovery Options

Shows the user which recovery methods they have (masked for privacy).

```
GET /recovery/options/:externalId
```

**Example:** `GET /recovery/options/john123`

**Headers:**
```
x-api-key: sk_...
```

**Response (200):**
```json
{
  "recoveryOptions": {
    "email": "ba***@gmail.com",
    "phone": "+254***78"
  }
}
```

**Frontend:** Display these to the user and let them choose which one to send the reset link to. If one is `null`, only show the other option.

### Step 2: Request Password Reset Link

Sends a reset link to the chosen recovery method.

```
POST /recovery/request-reset
```

**Headers:**
```
x-api-key: sk_...
```

**Body:**
```json
{
  "externalId": "john123",
  "method": "emailRecovery"
}
```

- `method`: `"emailRecovery"` or `"phoneRecovery"`

**Response (200):**
```json
{
  "message": "If an account exists with recovery methods, a reset link has been sent."
}
```

**Frontend:** Show a generic "check your email/phone" message. The response is intentionally vague to prevent user enumeration.

**What happens behind the scenes:** A link is sent to the recovery contact:
- Email: Sent via Cradle with a clickable link
- SMS: Sent via Cradle with the link as text

The link format: `{RECOVERY_URL}/reset-password?token=<64-char-hex-token>`

The token expires in **15 minutes** and is single-use. Requesting a new token invalidates any previous unused tokens.

### Step 3: Validate Token

When the user clicks the link and your frontend loads the `/reset-password?token=...` page, validate the token **before** showing the password form.

```
GET /recovery/validate-token/:token
```

**Example:** `GET /recovery/validate-token/a1b2c3d4e5f6...`

**Headers:**
```
x-api-key: sk_...
```

**Response (200) — Valid:**
```json
{
  "valid": true,
  "type": "PASSWORD_RESET",
  "expiresAt": "2026-02-18T12:30:00.000Z"
}
```

**Response (400) — Invalid:**
```json
{
  "valid": false,
  "message": "Token has expired"
}
```

Possible invalid reasons: `"Token not found"`, `"Token has already been used"`, `"Token has expired"`

**Frontend:**
- If `valid: true` and `type: "PASSWORD_RESET"` → show the new password form
- If `valid: false` → show an error page with a "Request new link" button
- You can use `expiresAt` to show a countdown timer

### Step 4: Reset Password

Submit the new password along with the token.

```
POST /recovery/reset-password
```

**Headers:**
```
x-api-key: sk_...
```

**Body:**
```json
{
  "token": "a1b2c3d4e5f6...64chars",
  "newPassword": "myNewSecurePassword"
}
```

- Password must be at least **8 characters**

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Frontend:** Show success message and redirect to login page. The token is now consumed and cannot be reused.

---

## 3. Account Recovery Flow

**Who:** Users who signed up with phone or email and **lost access** to that phone/email (e.g., lost phone, old email deactivated).

**No login required.** The user is locked out.

### Flow Diagram

```
User clicks "Lost access to my phone/email"
        |
        v
  User enters their OLD phone/email
        |
        v
[Step 1] GET /recovery/options-by-identifier?identifier=...&identifierType=...
        |  --> Shows masked recovery options
        v
  User picks a recovery method to receive the link
        |
        v
[Step 2] POST /recovery/request-account-recovery
        |  --> Sends a recovery link to the chosen recovery contact
        v
  User clicks the link in email/SMS
  Link opens: https://yourapp.com/recover-account?token=abc123...
        |
        v
[Step 3] GET /recovery/validate-token/:token
        |  --> Check if token is valid
        v
  If valid, show "Enter your new phone/email" form
        |
        v
  User enters their NEW phone/email
        |
        v
[Step 4] POST /otp/send
        |  --> Sends OTP to the NEW phone/email
        v
  User enters the OTP code
        |
        v
[Step 5] POST /recovery/recover-account
        |  --> Verifies OTP + updates the account
        v
  Show success, redirect to login (user logs in with new phone/email)
```

### Step 1: Get Recovery Options by Identifier

The user enters their old phone number or email (the one they lost access to). Show them which recovery options they have.

```
GET /recovery/options-by-identifier?identifier=user@oldemail.com&identifierType=email
```

**Headers:**
```
x-api-key: sk_...
```

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `identifier` | string | The old phone number or email the user lost access to |
| `identifierType` | string | `"email"` or `"phone"` |

**Response (200):**
```json
{
  "recoveryOptions": {
    "email": "ba***@gmail.com",
    "phone": "+254***78"
  }
}
```

**Response (200) — No account found:**
```json
{
  "recoveryOptions": {
    "email": null,
    "phone": null
  }
}
```

**Frontend:**
- If both are `null` → show "No recovery options found. Contact support."
- If one or both are available → let the user choose which recovery method to send the link to

### Step 2: Request Account Recovery Link

Sends a recovery link to the chosen recovery method.

```
POST /recovery/request-account-recovery
```

**Headers:**
```
x-api-key: sk_...
```

**Body:**
```json
{
  "identifier": "user@oldemail.com",
  "identifierType": "email",
  "method": "phoneRecovery"
}
```

| Field | Type | Description |
|---|---|---|
| `identifier` | string | The old phone/email the user lost access to |
| `identifierType` | string | `"email"` or `"phone"` |
| `method` | string | `"emailRecovery"` or `"phoneRecovery"` — which recovery contact to send the link to |

**Response (200):**
```json
{
  "message": "If an account exists with recovery methods, a recovery link has been sent."
}
```

**Frontend:** Show "Check your recovery email/phone for a link." The link format: `{RECOVERY_URL}/recover-account?token=<64-char-hex-token>`

### Step 3: Validate Token

Same endpoint as password reset. When the user clicks the link and your frontend loads `/recover-account?token=...`:

```
GET /recovery/validate-token/:token
```

**Headers:**
```
x-api-key: sk_...
```

**Response (200) — Valid:**
```json
{
  "valid": true,
  "type": "ACCOUNT_RECOVERY",
  "expiresAt": "2026-02-18T12:30:00.000Z"
}
```

**Frontend:**
- If `valid: true` and `type: "ACCOUNT_RECOVERY"` → show the "Enter new phone/email" form
- If `valid: false` → show error with "Request new link" option

### Step 4: Send OTP to the New Identifier

The user enters their **new** phone number or email. Send an OTP to verify they own it.

```
POST /otp/send
```

**Headers:**
```
x-api-key: sk_...
```

**Body (new email):**
```json
{
  "email": "user@newemail.com"
}
```

**Body (new phone):**
```json
{
  "phone": "+254700000000"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "The verification code was sent to ..."
}
```

**OTP formats:**
- **Phone**: 6-digit numeric code via Twilio SMS (e.g., `123456`)
- **Email**: 4-character alphanumeric code via Cradle (e.g., `K7NP`)

**Frontend:** Show an OTP input field. Keep the `token` from the URL in state — you'll need it in the next step.

### Step 5: Complete Account Recovery

Submit the recovery token, new identifier, and OTP together.

```
POST /recovery/recover-account
```

**Headers:**
```
x-api-key: sk_...
```

**Body:**
```json
{
  "token": "a1b2c3d4e5f6...64chars",
  "newIdentifier": "user@newemail.com",
  "identifierType": "email",
  "otpCode": "K7NP"
}
```

| Field | Type | Description |
|---|---|---|
| `token` | string | The recovery token from the URL |
| `newIdentifier` | string | The new phone number or email |
| `identifierType` | string | `"email"` or `"phone"` |
| `otpCode` | string | The OTP code the user received on the new phone/email |

**Response (200) — Success:**
```json
{
  "message": "Account recovery successful. Your identifier has been updated."
}
```

**Response (400) — Bad OTP:**
```json
{
  "message": "OTP verification failed: Invalid or expired OTP code"
}
```

**Response (409) — Duplicate:**
```json
{
  "message": "This email is already associated with another account"
}
```

**Frontend:**
- On success → show "Account recovered! You can now log in with your new email/phone." and redirect to login
- On OTP failure → let the user re-enter the OTP or resend it (call `/otp/send` again)
- On 409 → show "This email/phone is already in use by another account"

---

## Frontend Implementation Examples

### Pseudocode: Password Reset Page

```javascript
// Page: /reset-password?token=...
async function ResetPasswordPage() {
  const token = getQueryParam("token");

  // 1. Validate the token on page load
  const validation = await fetch(`/recovery/validate-token/${token}`, {
    headers: { "x-api-key": API_KEY }
  }).then(r => r.json());

  if (!validation.valid) {
    showError(validation.message);  // "Token has expired", etc.
    showButton("Request new link", () => navigateTo("/forgot-password"));
    return;
  }

  if (validation.type !== "PASSWORD_RESET") {
    showError("Invalid link type");
    return;
  }

  // 2. Show the password form
  showPasswordForm();

  // 3. On submit
  async function onSubmit(newPassword) {
    const result = await fetch("/recovery/reset-password", {
      method: "POST",
      headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword })
    }).then(r => r.json());

    if (result.message === "Password reset successful") {
      showSuccess("Password updated! Redirecting to login...");
      navigateTo("/login");
    }
  }
}
```

### Pseudocode: Account Recovery Page

```javascript
// Page: /recover-account?token=...
async function RecoverAccountPage() {
  const token = getQueryParam("token");

  // 1. Validate token
  const validation = await fetch(`/recovery/validate-token/${token}`, {
    headers: { "x-api-key": API_KEY }
  }).then(r => r.json());

  if (!validation.valid || validation.type !== "ACCOUNT_RECOVERY") {
    showError("Invalid or expired link");
    return;
  }

  // 2. Show "enter new phone/email" form
  showNewIdentifierForm();

  // 3. When user enters new identifier, send OTP
  async function onSendOTP(newIdentifier, type) {
    const body = type === "email"
      ? { email: newIdentifier }
      : { phone: newIdentifier };

    await fetch("/otp/send", {
      method: "POST",
      headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    showOTPInput();
  }

  // 4. When user enters OTP, complete recovery
  async function onSubmitOTP(newIdentifier, identifierType, otpCode) {
    const result = await fetch("/recovery/recover-account", {
      method: "POST",
      headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ token, newIdentifier, identifierType, otpCode })
    });

    if (result.ok) {
      showSuccess("Account recovered! Log in with your new credentials.");
      navigateTo("/login");
    } else {
      const error = await result.json();
      if (result.status === 409) {
        showError("This identifier is already used by another account.");
      } else {
        showError(error.message);
      }
    }
  }
}
```

### Pseudocode: Recovery Setup (Settings Page)

```javascript
// Settings page — user is logged in
async function RecoverySettings() {
  const jwt = getStoredJWT();

  // 1. Check if user has recovery methods
  const data = await fetch("/recovery/my-methods", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Authorization": `Bearer ${jwt}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})  // No externalId needed — JWT identifies user
  }).then(r => r.json());

  if (data.recovery) {
    // Show current methods with edit/remove buttons
    showRecoveryMethods(data.recovery);
  } else {
    // Show setup form
    showSetupForm();
  }

  // 2. Create recovery (first time)
  async function onCreate(emailRecovery, phoneRecovery) {
    await fetch("/recovery/create", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ emailRecovery, phoneRecovery })
    });
  }

  // 3. Update a method
  async function onUpdate(method, value) {
    await fetch("/recovery/update-method", {
      method: "PUT",
      headers: {
        "x-api-key": API_KEY,
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ method, value })
    });
  }

  // 4. Add a second method
  async function onAdd(method, value) {
    await fetch("/recovery/add-method", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ method, value })
    });
  }

  // 5. Remove a method
  async function onRemove(method) {
    await fetch("/recovery/remove-method", {
      method: "DELETE",
      headers: {
        "x-api-key": API_KEY,
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ method })
    });
  }
}
```

---

## All Endpoints Summary

### Recovery Setup (Authenticated — JWT + OTP/password)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/recovery/create` | Create recovery methods (first time) |
| POST | `/recovery/add-method` | Add a second recovery method |
| PUT | `/recovery/update-method` | Update an existing recovery method |
| DELETE | `/recovery/remove-method` | Remove a specific recovery method |
| POST | `/recovery/my-methods` | Get user's own recovery methods |
| DELETE | `/recovery/delete-all` | Delete all recovery methods |

### Password Reset (Public — API key only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/recovery/options/:externalId` | Get masked recovery options |
| POST | `/recovery/request-reset` | Send password reset link |
| GET | `/recovery/validate-token/:token` | Validate a recovery token |
| POST | `/recovery/reset-password` | Reset password with token |

### Account Recovery (Public — API key only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/recovery/options-by-identifier` | Get masked recovery options by phone/email |
| POST | `/recovery/request-account-recovery` | Send account recovery link |
| GET | `/recovery/validate-token/:token` | Validate a recovery token |
| POST | `/otp/send` | Send OTP to new phone/email |
| POST | `/recovery/recover-account` | Complete account recovery |

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Description of what went wrong"
}
```

| Status | Meaning |
|---|---|
| 400 | Bad request / validation error / invalid token / bad OTP |
| 401 | Missing API key or project context |
| 404 | User not found / no recovery methods found |
| 409 | Conflict (new identifier already in use by another account) |
| 429 | Rate limited (too many requests) |
| 500 | Internal server error |

---

## Rate Limiting

| Endpoint | Limit |
|---|---|
| `POST /recovery/request-reset` | 5 requests per 5 minutes per IP |
| `POST /recovery/request-account-recovery` | 5 requests per 5 minutes per IP |

If rate limited, the response status is `429`.

---

## Security Notes

- Recovery tokens are 64-char hex strings (256 bits of entropy via `crypto.randomBytes`)
- Tokens expire after **15 minutes** and are **single-use**
- Requesting a new token **invalidates all** previous unused tokens for the same user
- Lookup endpoints return generic "if account exists..." responses to **prevent user enumeration**
- Account recovery requires **OTP verification** of the new phone/email before updating
- New identifiers are checked for **uniqueness** within the project before updating
- Password must be at least **8 characters**

---

## Environment Configuration

The backend uses a `RECOVERY_URL` environment variable to build the links sent to users. This should point to your frontend's base URL.

```
RECOVERY_URL=https://hafla.live
```

The generated links will be:
- Password reset: `https://hafla.live/reset-password?token=<token>`
- Account recovery: `https://hafla.live/recover-account?token=<token>`

Your frontend needs to have routes for both `/reset-password` and `/recover-account` that read the `token` query parameter and drive the corresponding flow.

# Recovery Flow - Frontend Integration Guide

Base API URL: your backend API (e.g. `https://api.riftfi.xyz`)
Frontend URL: `https://wallet.riftfi.xyz` (configured via `RECOVERY_URL` env var)

All API requests require the `x-api-key` header.

---

## Flow 1: Password Reset (for externalId users)

### Step 1 — User requests a reset

User provides their externalId and chooses a recovery method (email or phone).

```
POST /recovery/request-reset
```

```json
{
  "externalId": "user123",
  "method": "emailRecovery"
}
```


Response (always generic to prevent enumeration):

```json
{
  "message": "If an account exists with recovery methods, a reset link has been sent."
}
```

The backend sends an email/SMS with a link like:

```
https://wallet.riftfi.xyz/reset-password?token=abc123def456...
```

---

### Step 2 — Frontend: `/reset-password` page loads

When the user clicks the link, the frontend `/reset-password` page should:

1. Extract the `token` from the URL query params
2. Validate the token by calling:

```
GET /recovery/validate-token/{token}
```

**If valid:**

```json
{
  "valid": true,
  "type": "PASSWORD_RESET",
  "expiresAt": "2026-02-18T12:30:00.000Z"
}
```

Show the new password form.

**If invalid:**

```json
{
  "valid": false,
  "message": "Token has expired"
}
```

Show an error message (token expired, already used, or not found). Offer a link to request a new reset.

---

### Step 3 — User submits new password

```
POST /recovery/reset-password
```

```json
{
  "token": "abc123def456...",
  "newPassword": "newSecurePassword123"
}
```

**Success (200):**

```json
{
  "message": "Password reset successful"
}
```

Redirect user to login.

**Errors (400):**

```json
{ "message": "Token and new password are required" }
{ "message": "Password must be at least 8 characters long" }
{ "message": "Token has expired" }
{ "message": "Token has already been used" }
```

---

## Flow 2: Account Recovery (for phone/email users who lost access)

This flow is for users who signed up with email/phone and lost access to that email/phone. They use their recovery method to update their primary identifier.

### Step 1 — Look up recovery options

User provides their old email or phone number.

```
GET /recovery/options-by-identifier?identifier=old@email.com&identifierType=email
```

Response (masked values):

```json
{
  "recoveryOptions": {
    "email": "re***@gmail.com",
    "phone": "+254***89"
  }
}
```

If no account or no recovery methods exist, returns nulls (no error, to prevent enumeration):

```json
{
  "recoveryOptions": { "email": null, "phone": null }
}
```

---

### Step 2 — User requests recovery link

```
POST /recovery/request-account-recovery
```

```json
{
  "identifier": "old@email.com",
  "identifierType": "email",
  "method": "emailRecovery"
}
```

Response (always generic):

```json
{
  "message": "If an account exists with recovery methods, a recovery link has been sent."
}
```

The backend sends a link like:

```
https://wallet.riftfi.xyz/recover-account?token=xyz789...
```

---

### Step 3 — Frontend: `/recover-account` page loads

When the user clicks the link, the frontend `/recover-account` page should:

1. Extract the `token` from the URL query params
2. Validate the token:

```
GET /recovery/validate-token/{token}
```

**If valid:**

```json
{
  "valid": true,
  "type": "ACCOUNT_RECOVERY",
  "expiresAt": "2026-02-18T12:30:00.000Z"
}
```

Show a form with:
- New email or phone number input
- A dropdown/toggle for identifier type (`email` or `phone`)
- An OTP input field
- A button to request OTP for the new identifier (use your existing OTP endpoint)

**If invalid:** Show error, offer link to start over.

---

### Step 4 — User submits new identifier

User first requests an OTP to their **new** email/phone (via your existing OTP send endpoint), then submits:

```
POST /recovery/recover-account
```

```json
{
  "token": "xyz789...",
  "newIdentifier": "new@email.com",
  "identifierType": "email",
  "otpCode": "123456"
}
```

**Success (200):**

```json
{
  "message": "Account recovery successful. Your identifier has been updated."
}
```

Redirect user to login with their new email/phone.

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `token, newIdentifier, identifierType, and otpCode are required` |
| 400 | `identifierType must be 'email' or 'phone'` |
| 400 | `Token has expired` / `Token has already been used` |
| 400 | `Invalid token type for account recovery` |
| 400 | `OTP verification failed: ...` |
| 409 | `This email is already associated with another account` |

---

## Frontend Page Summary

| Page | URL | What to show |
|------|-----|-------------|
| `/reset-password` | `?token=xxx` | Validate token → show new password form → `POST /recovery/reset-password` |
| `/recover-account` | `?token=xxx` | Validate token → show new identifier + OTP form → `POST /recovery/recover-account` |

### UI States for both pages

1. **Loading** — Validating token...
2. **Token valid** — Show the form
3. **Token invalid** — Show error message + link to request a new one
4. **Submitting** — Loading spinner on submit button
5. **Success** — Confirmation message + redirect to login
6. **Error** — Show API error message, let user retry