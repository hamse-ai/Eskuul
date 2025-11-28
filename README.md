# Eskuul - Education Platform

A full-stack educational management system with role-based access for Admin, Teacher, and Student users.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Neon) |
| Auth | JWT + Bcrypt |

## Prerequisites

- Node.js v14+
- npm or yarn
- PostgreSQL database (or Neon cloud)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/hamse-ai/Eskuul.git
cd Eskuul
```

### 2. Server Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
PORT=3000
CLIENT_URL=http://localhost:5173
```

### 3. Database Migrations
Run the SQL migrations against your PostgreSQL database:
```bash
psql -U <username> -d <database> -f migrations/complete_schema.sql
```

### 4. Client Setup
```bash
cd ../client
npm install
```

## Running the Application

### Development Mode

**Terminal 1 - Server:**
```bash
cd server
npm run dev
# Runs on or your custom port http://localhost:3000
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

### Production Build
```bash
# Client
cd client
npm run dev

# Server
cd server
node server.js
```

## User Roles

| Role | Capabilities |
|------|--------------|
| **Student** | View approved PDFs, take quizzes, view progress |
| **Teacher** | Upload PDFs, create quizzes, manage content |
| **Admin** | Approve/reject content, manage platform |

## API Endpoints

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`
- **PDFs:** `POST /api/pdfs/upload`, `GET /api/pdfs/approved`
- **Quizzes:** `POST /api/quizzes/create`, `GET /api/quizzes/approved`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Check `CLIENT_URL` matches frontend port |
| Database connection failed | Verify `DATABASE_URL` in `.env` |
| Port in use | Change `PORT` in `.env` or kill existing process |
