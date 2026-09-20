# Emergency Ambulance Management System

A full-stack system designed to track, dispatch, and manage ambulance routing, traffic signal preemption, and alerts using real-time WebSockets and Leaflet Maps.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, React-Leaflet
- **Backend**: Node.js, Express, Socket.io, Prisma ORM
- **Database**: PostgreSQL
- **Deployment**: Docker Compose

## Prerequisites
- Docker and Docker Compose installed on your system.

## How to Run Locally

You can launch the entire stack seamlessly using Docker Compose.

### 1. Start the Containers
Open your terminal inside the root folder of this project (`d:\SE\`) and run:
```bash
docker-compose up -d --build
```
*This command pulls the PostgreSQL image, installs all frontend and backend dependencies, builds the TypeScript files, and starts everything up (Backend on port `3001`, Frontend on port `5173`).*

### 2. Initialize the Database & Seed Data
Once the containers are running (wait around 10-15 seconds for the database connection), you need to push the Prisma schema and load the demo simulation data. 

Execute these commands in your terminal:
```bash
docker-compose exec backend npx prisma db push
docker-compose exec backend npm run seed
```

### 3. Access the Application
Open your browser and navigate to:
[http://localhost:5173](http://localhost:5173)

**Demo Admin Login:**
- **Email**: `admin@ems.com`
- **Password**: `password123`

## Running Without Docker (Manual Fallback)
If you prefer not to use Docker, ensure you have PostgreSQL and Node.js v20+ installed natively:

1. Update `backend/.env` with your native Postgres connection string.
2. In the `backend/` folder: Run `npm install` -> `npx prisma db push` -> `npm run seed` -> `npm run dev`
3. In the `frontend/` folder: Run `npm install` -> `npm run dev`

## Useful Docker Commands

Stop the application:
```bash
docker-compose down
```

View live logs:
```bash
docker-compose logs -f backend
```
