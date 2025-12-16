# Full-Stack HR Management System

A comprehensive full-stack application for HR management with separate backend and frontend.

## Backend (Node.js + Express + PostgreSQL/SQLite)

Located in `backend/` folder.

### Features
- JWT Authentication with role-based access (Employee, HR, MIS)
- Employee management: profile CRUD, document upload, leave requests, notifications
- HR functionalities: validation, bulk upload, contract management, reports, etc.
- MIS: backups, audit logs, role assignment, system notifications
- Shared: notifications, export tools, audit logs

### Setup
1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Configure `.env` file with database and email settings
4. Run: `npm start` (production) or `npm run dev` (development)
5. Server runs on port 5000

### API Endpoints
- `/api/auth` - Authentication
- `/api/employee` - Employee operations
- `/api/hr` - HR operations
- `/api/mis` - MIS operations

## Frontend (React + TailwindCSS)

Located in `frontend/` folder.

### Features
- Responsive UI with TailwindCSS
- Role-based dashboards: Employee, HR, MIS
- Authentication and notifications
- Integration with backend APIs

### Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run: `npm run dev`
4. Open http://localhost:5174 (or assigned port)

## Technologies
- Backend: Node.js, Express, Sequelize, JWT, bcrypt, multer, nodemailer
- Frontend: React, Vite, TailwindCSS, Axios
- Database: PostgreSQL or SQLite

## Usage
1. Start backend server
2. Start frontend dev server
3. Access the application in browser
4. Register/login with appropriate roles


## If ever the API integration has an issue, then try to run this:
1. taskkill /F /IM node.exe 2>$null; Start-Sleep -Seconds 2; cd backend; node server.js
2. then split terminal then - cd frontend then "npm run dev".