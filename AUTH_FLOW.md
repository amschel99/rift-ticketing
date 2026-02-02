# Authentication & Payment Flow

## ✅ Complete Flow

### 1. User Signup
- User signs up with `externalId` and `password`
- **Rift SDK**: Creates user in Rift with `rift.auth.signup()`
- **Auto-login**: Immediately logs in to get JWT token
- **Database**: User saved with:
  - `externalId` (from signup)
  - `riftUserId` (from Rift)
  - `bearerToken` (JWT token from Rift login) ✅
  - `email`, `name`, `role`

### 2. User Login
- User logs in with `externalId` and `password`
- **Rift SDK**: Authenticates with `rift.auth.login()`
- **JWT Token**: Gets `accessToken` from Rift
- **Database**: 
  - If user exists: Updates `bearerToken` with new JWT token ✅
  - If user doesn't exist: Creates user record with JWT token ✅

### 3. Event Creation
- Authenticated user creates event
- **Database**: Event saved with:
  - `title`, `description`, `date`, `location`, `price`, `capacity`
  - `organizerId` (links to user)
  - `category`, `isOnline`, `shareableUrl`

### 4. RSVP & Checkout Link Creation
- User RSVPs to an event
- **Database**: RSVP record created
- **Rift SDK**: 
  - Uses saved `bearerToken` from user's DB record ✅
  - Calls `rift.merchant.createInvoice()` with:
    - `description`: Event ticket name
    - `chain`: 'BASE'
    - `token`: 'USDC'
    - `amount`: Event price
    - `recipientEmail`: User's email
- **Database**: Invoice record saved with `invoiceUrl`
- **Response**: Returns `paymentUrl` to frontend
- **Frontend**: Redirects user to Rift checkout page

## Key Points

✅ **Users are saved in database** after Rift auth
✅ **JWT tokens are saved in database** (`bearerToken` field)
✅ **Events are saved in database**
✅ **Invoice creation uses saved JWT token** from database
✅ **Checkout links are created** via `rift.merchant.createInvoice()`

## Database Schema

- **User**: Stores `bearerToken` (JWT from Rift) ✅
- **Event**: Stores event details
- **RSVP**: Links user to event
- **Invoice**: Stores payment info with `invoiceUrl` (checkout link)

## API Endpoints

- `POST /api/auth/signup` - Creates user in Rift + DB
- `POST /api/auth/login` - Authenticates with Rift, saves token to DB
- `POST /api/events` - Creates event (saved in DB)
- `POST /api/events/[id]/rsvp` - Creates RSVP + Invoice (uses saved JWT token)
