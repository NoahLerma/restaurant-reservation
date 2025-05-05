# Fibonacci's Flame Grill and Tap - Restaurant Reservation System

A modern, full-featured restaurant reservation system built with Next.js (App Router), Prisma, NextAuth.js, and Tailwind CSS.

## Features
- User registration, login, and authentication (NextAuth.js)
- Admin dashboard for managing reservations, tables, and users
- Public reservation calendar and booking system
- Table management (add, edit, delete, link reservations)
- Reservation status management (pending, confirmed, cancelled)
- User profile management and reservation history
- Responsive, modern UI with custom branding

## Tech Stack
- **Frontend/Backend:** Next.js (App Router, React, API routes)
- **Database ORM:** Prisma
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Database:** SQLite (development) / PostgreSQL, MySQL, or other (production)

## Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/) for version control
- A code editor (e.g., [VS Code](https://code.visualstudio.com/))
- For production deployment: A database service (PostgreSQL recommended)

## Getting Started

### 1. Clone the Repository
```bash
 git clone <https://github.com/NoahLerma/restaurant-reservation.git>
 cd restaurant-reservation
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory with the following (example for SQLite):

SWLite is fine for this since it will not be published to a production environment leave .env as is

```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3001"
```
- For production, use a remote database (e.g., PostgreSQL, MySQL) and update `DATABASE_URL` accordingly.

### 4. Set Up the Database
Run Prisma migrations and seed the database:
```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Seed the database with initial data
npx prisma db seed
```
- This will create the database schema and seed an admin user and sample tables.

### 5. Start the Development Server
```bash
npm run dev
```
Visit [http://localhost:3001](http://localhost:3001) in your browser.

## Admin Access
- The seeded admin user credentials are:
  - **Email:** `admin@fibonaccisflame.com`
  - **Password:** `admin`
- Log in and access the Admin Dashboard from the navigation menu.
- Feel free to register a new account and verify that it cannot access admin tools and can also make resrvations.

## Environment Variables
- `DATABASE_URL` - Connection string for your database
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Base URL of your app (e.g., `http://localhost:3001`)

## Deployment Notes
- For production, use a remote database (SQLite is not recommended for production on platforms like Netlify or Vercel).
- Set all environment variables in your deployment platform's dashboard.
- See the Netlify or Vercel documentation for Next.js deployment specifics.

## Customization
- Update branding, logo, and color scheme in the `/public` directory and Tailwind config.
- Adjust the Prisma schema in `/prisma/schema.prisma` for custom data needs.

## License
MIT

---

**Enjoy managing reservations at Fibonacci's Flame Grill and Tap!**