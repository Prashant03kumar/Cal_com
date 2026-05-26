# Cal.com[Scaler Scheduler]

## Live Demo

- Live: `https://pkserver.in`

## Tech Stack

- React 18
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Node.js
- Express
- PostgreSQL
- Prisma ORM

## Database Schema

### `users`

- `id` (uuid, pk)
- `name` (text)
- `email` (text, unique)
- `timezone` (text)
- `created_at` (timestamp)

### `event_types`

- `id` (uuid, pk)
- `user_id` (uuid, fk -> users.id)
- `title` (text)
- `slug` (text, unique)
- `description` (text, nullable)
- `duration_minutes` (int)
- `is_active` (boolean)
- `created_at` (timestamp)

### `availability_schedules`

- `id` (uuid, pk)
- `user_id` (uuid, fk -> users.id)
- `name` (text)
- `timezone` (text)
- `is_default` (boolean)

### `availability_rules`

- `id` (uuid, pk)
- `schedule_id` (uuid, fk -> availability_schedules.id)
- `day_of_week` (int, 0-6)
- `start_time` (text, HH:MM)
- `end_time` (text, HH:MM)

### `bookings`

- `id` (uuid, pk)
- `event_type_id` (uuid, fk -> event_types.id)
- `booker_name` (text)
- `booker_email` (text)
- `booking_date` (text, YYYY-MM-DD)
- `start_time` (text, HH:MM)
- `end_time` (text, HH:MM)
- `status` (text: confirmed|cancelled)
- `cancel_reason` (text, nullable)
- `created_at` (timestamp)

## Local Setup

1. Clone repo and move to project root:
   - `cd calcom-clone`
2. Backend setup:
   - `cd backend`
   - `npm install`
   - Create/update `.env`:
     - `DATABASE_URL`
     - `PORT=4000`
   - Run migrations and seed:
     - `npx prisma migrate dev --name init`
     - `npx prisma db seed`
   - Start backend:
     - `npm run dev`
3. Frontend setup:
   - `cd ../frontend`
   - `npm install`
   - Start frontend:
     - `npm run dev`
4. Open app:
   - `http://pkserver.in`

## API Endpoints

### Health

- `GET /health`

### Event Types

- `GET /api/event-types`
- `POST /api/event-types`
- `GET /api/event-types/:id`
- `PUT /api/event-types/:id`
- `DELETE /api/event-types/:id`

### Availability

- `GET /api/availability`
- `POST /api/availability`

### Slots

- `GET /api/slots/:slug?date=YYYY-MM-DD`

### Bookings

- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/:id/cancel`

### Public

- `GET /api/public/event-types/:slug`

## Deployment

### Backend (Render)

1. Create Render PostgreSQL database (`calcom-clone-db`) and copy External Database URL.
2. Set backend env vars in Render:

3. Create Render Web Service:
   - Root directory: `backend`
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npm start`
4. After first deploy, run:
   - `npx prisma migrate deploy`
   - `npx prisma db seed`

### Frontend (Vercel)

1. Set frontend env var:
2. In Vercel project:
   - Root directory: `frontend`
   - Framework: `Vite`
3. Deploy and copy Vercel URL.
4. Update Render `FRONTEND_URL` with Vercel URL for CORS.

## Assumptions

- No user authentication in this assignment version.
- Single default user (`alex@calcom.demo`) is used by admin middleware.
- Dates and times are stored as strings (`YYYY-MM-DD`, `HH:MM`) instead of native date-time columns for slots.
- Booking availability is computed from rules + confirmed bookings only.
- Public booking pages are open routes.
