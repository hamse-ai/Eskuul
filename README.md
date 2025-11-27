#Eskuul – Learning Resource Management System

###A full-stack web application for uploading, managing, and accessing educational content. Built with Node.js, Express, PostgreSQL, React, and JWT authentication.

##📌 Table of Contents

Project Description

Features

Tech Stack

System Architecture

Folder Structure

Installation & Setup

1. Clone Repository

2. Backend Setup

3. Frontend Setup

Environment Variables

Running the Project Locally

Deployment

Deploy Backend (Render)

Deploy Frontend (Vercel)

API Endpoints

Demo Links

Project Description

Eskuul is a system that allows students to upload educational resources (PDFs, notes, past papers, etc.) which must be approved by an admin before becoming publicly available.
The system provides secure authentication, role-based authorization, and a clean user interface for accessing resources.

##Features
👤 Authentication

User Registration

Login (JWT + Cookies)

Role-based access (Student, Admin)

##📚 Resource Management

File Upload (PDFs, images, etc.)

Admin-only approval of uploaded resources

Resource listing with filters

Secure file access

##⚙️ System

Secure API using JWT

Fully deployed frontend + backend

Publicly accessible URL

Clean UI (React + Vite)

##Tech Stack
Frontend

React (Vite)

Axios

TailwindCSS

Backend

Node.js / Express

PostgreSQL (pg)

JWT

Multer (file upload)

##Deployment

Frontend: Vercel

Backend: Render

Database: Render PostgreSQL

##System Architecture
React (Vercel) ---> Node.js Backend (Render) ---> PostgreSQL Database (Render)


Frontend communicates with the backend via a public API URL.

```Folder Structure
root/
│── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── uploads/
│
└── frontend/
    ├── src/
    ├── public/
    ├── index.html
    └── vite.config.js
```

Installation & Setup
1. Clone Repository
```
git clone https://github.com/hamse-ai/Eskuul.git
cd Eskuul
```
2. Backend Setup (Node.js / Express)
Install dependencies:
```
cd server
npm install
```
Add .env file:
```
PORT=10000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-frontend.vercel.app
```
Start backend:
```
npm start

```
Backend runs on:
```
http://localhost:10000
```
3. Frontend Setup (React / Vite)

Install dependencies:
```
cd frontend
npm install
```

Create .env:

```
VITE_API_URL=https://your-backend.onrender.com
```
Start:
```
npm run dev
```

Frontend runs on:
```
http://localhost:5173
```
Environment Variables

Backend .env
```
PORT=
DATABASE_URL=
JWT_SECRET=
CORS_ORIGIN=
```
Frontend .env
VITE_API_URL=


Make sure frontend always uses the deployed backend URL, not localhost.

Running the Project Locally
Start backend:
```
cd backend
npm run dev
```
Start frontend:

```
cd frontend
npm run dev
```
Deployment
Deploy Backend (Render)

Go to https://render.com

Create new Web Service

Select the backend folder

Add environment variables

Set "Start Command":

node server.js


##Deploy

Copy the public backend URL
Example:

https://eskuul.onrender.com

Deploy Frontend (Vercel)

Go to https://vercel.com

Import the repo

Select the frontend folder

Add environment variable:

VITE_API_URL=https://eskuul.onrender.com


Deploy

Frontend URL example:

https://eskuul.vercel.app

##API Endpoints
Auth
Method	Endpoint	Description

```
POST	/api/auth/register	Register user
POST	/api/auth/login	Login user
POST	/api/auth/logout	Logout user
Resources
Method	Endpoint	Requires Auth	Role
POST	/api/resources/upload	Yes	Student
GET	/api/resources	No	-
PATCH	/api/resources/:id/approve	Yes	Admin
````
Demo Links
🎥 Video Demo

✔ Add your Loom/Drive link here

🌍 Live App

Frontend:

https://eskuul.vercel.app


Backend API:

https://eskuul.onrender.com

📁 GitHub Repo
https://github.com/<your-username>/<your-repo>

📄 SRS Document

Paste link here.

If you want, I can also create:
✅ Your Google Doc
✅ A script for the 5–10 min video presentation
✅ A clean architecture diagram
