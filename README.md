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


#update npm to the latest version
npm install -g npm@11.3.0

#you may need to re-install npm to get updated dependencies the terminal will let you know
npm audit fix --force

# for some reason the regular install does not pickup the calendar package so it will have to be installed seperatly
npm install react-calendar
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory with the following (example for SQLite):

YOU MUST CREATE A .env file in the ROOT directory of your editor as git does not pull one with it.
add the following entries to you .env shown below 

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

# you will get a migrate error and will need to reset the database to migrate it properly
npx prisma migrate reset
# type y for yes to wipe and reset database

# Seed the database with initial data
# this should run automatically
npx prisma db seed
```
- This will create the database schema and seed an admin user and sample tables.

### 5. Start the Development Server
```bash
npm run dev

# the first loading of screens will be slow as they are still initializing. just give them time.
```
Visit [http://localhost:3001](http://localhost:3001) in your browser.

## Admin Access
- The seeded admin user credentials are:
  - **Email:** `admin@fibonaccisflame.com`
  - **Password:** `admin`
- Log in and access the Admin Dashboard from the navigation menu.
- Feel free to register a new account and verify that it cannot access admin tools and can also make reservations.

## Environment Variables
- `DATABASE_URL` - Connection string for your database
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Base URL of your app (e.g., `http://localhost:3001`)

## Deployment Notes
- For production, use a remote database (SQLite is not recommended for production).
- Set all environment variables in your deployment platform's dashboard.
- Follow your chosen deployment platform's documentation for Next.js deployment specifics.

## Customization
- Update branding, logo, and color scheme in the `/public` directory and Tailwind config.
- Adjust the Prisma schema in `/prisma/schema.prisma` for custom data needs.

## License
MIT

---

**Enjoy managing reservations at Fibonacci's Flame Grill and Tap!**