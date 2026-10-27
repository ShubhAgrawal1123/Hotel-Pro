# HotelPro — Hotel Booking & Management

A college-project-ready hotel management application built with React + Vite, Express, MongoDB/Mongoose and JWT authentication. It includes a polished responsive dashboard, room/booking/guest workflows, settings, API validation and a demo seed script.

> **Demo note:** Dashboard figures are explicitly sample/demo figures until real database records are available. Payments are not processed; booking totals are estimates only.

## Prerequisites
- Node.js 20+ and npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- Git (optional)

## Windows PowerShell setup
1. Extract `HotelPro-Complete-Project.zip`, then open PowerShell in the extracted `hotelpro` folder.
2. Configure the backend environment:
```powershell
Copy-Item server/.env.example server/.env
```
Edit `server/.env` and set a long random `JWT_SECRET`. The default local MongoDB URL is suitable only for local development.
3. Install dependencies:
```powershell
npm install
npm run install:all
```
4. Seed the database (MongoDB must be running):
```powershell
npm run seed
```
5. Start both services:
```powershell
npm run dev
```
6. Open **http://localhost:5173**. The API runs at **http://localhost:5000/api**.

### Demo credentials
- Admin email: `admin@hotelpro.local`
- Password: `HotelPro123!`

The seed script creates this local demo account and fictional guests. Change the password and secret before any public deployment. Do not use these credentials in production.

## Run services separately
Backend:
```powershell
npm run dev --prefix server
```
Frontend in a second terminal:
```powershell
npm run dev --prefix client
```
Production frontend build:
```powershell
npm run build
```

## Environment variables
`server/.env.example` documents `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CLIENT_ORIGIN`. Never commit `.env`.

## API / Postman
Base URL: `http://localhost:5000/api`
- `POST /auth/register` — create guest account
- `POST /auth/login` — get JWT
- `GET /auth/me` — current user (Bearer token)
- `GET /rooms` — list rooms
- `POST /rooms` — admin: create room
- `PUT /rooms/:id` — admin: update room
- `DELETE /rooms/:id` — admin: delete room
- `GET /bookings` — list bookings (admin sees all; guest sees own)
- `POST /bookings` — create booking
- `PATCH /bookings/:id/status` — admin status update or owner cancellation
- `GET /guests` — admin guest list and booking summary
- `GET /settings` / `PUT /settings` — admin property settings

For protected routes, choose **Bearer Token** in Postman and paste the JWT returned by `/auth/login`. Send JSON bodies with `Content-Type: application/json`. Booking dates must be ISO dates; checkout must be after check-in. Overlapping active bookings for a room are rejected.

## GitHub
```powershell
git init
git add .
git commit -m "Build HotelPro hotel management app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```
Create the empty repository on GitHub first and replace the placeholder remote URL.

## Deployment
- Deploy the Express server to Render, Railway or another Node host.
- Use MongoDB Atlas and set `MONGODB_URI`, a unique `JWT_SECRET`, `CLIENT_ORIGIN`, and `PORT` in the host's environment settings.
- Build the frontend with `npm run build --prefix client` and deploy `client/dist` to a static host such as Vercel or Netlify. Set `VITE_API_URL` to the deployed API base URL (including `/api`).
- Configure CORS to the exact deployed frontend origin. Use HTTPS and rotate demo credentials before deployment.

## Scope and limitations
- This is a functional learning/demo project, not a certified property-management system.
- Dashboard chart data and the initial visual dashboard metrics are demo-labelled; room/booking/guest APIs persist to MongoDB.
- Images use remote Unsplash URLs and require internet access; a CSS fallback is provided.
- No payment gateway, email delivery, or production-grade audit logging is included.
- If you run `npm run build` without installing dependencies first, it will fail because Vite packages are not present.
