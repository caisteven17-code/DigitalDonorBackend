# Digital Donor - Mobile

Mobile donation app built with Expo React Native on the frontend and a Node.js microservice backend.

## Structure

- `frontend/` - Expo mobile app
- `backend/` - API gateway, users, donations, notifications, and payment services
- `.env` - backend Supabase and service environment variables
- `frontend/.env` - Expo public environment variables for the mobile app

## Requirements

- Node.js 18+
- npm
- Expo Go or an Android/iOS emulator

## Install

From the project root:

```bash
npm run install:all
```

## Environment Variables

Backend reads from the root `.env`.

Frontend reads from `frontend/.env`.

Current frontend auth setup expects:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Current backend setup expects:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Run From Root

Start backend and frontend together from `Digital Donor - Mobile`:

```bash
npm start
```

## PayMaya Support

The app includes `PayMaya` in the payment method picker, but Supabase must also allow `maya` in `hopecard_purchases.payment_method`.

Run this SQL file in the Supabase SQL Editor:

- [add_maya_payment_method.sql](/d:/UST/3rd%20Year/TRIBE/Digital%20Donor%20-%20Mobile/backend/database/add_maya_payment_method.sql)


email: donor@hopecard.com
password: donor123
