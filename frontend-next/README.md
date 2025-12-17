# EmployeeSync - Next.js 14 Migration

This project has been migrated from React + Vite to Next.js 14 with the App Router. The backend remains as Node.js + Express + Sequelize.

## Project Structure

```
employee_leave/
├── backend/                 # Express.js backend (unchanged)
│   ├── src/
│   │   ├── config/         # Database and environment config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, audit middleware
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   ├── uploads/            # File uploads directory
│   └── data/               # Database and backups
│
├── frontend/               # Original React + Vite (legacy)
│
└── frontend-next/          # NEW: Next.js 14 frontend
    ├── src/
    │   ├── app/            # Next.js App Router pages
    │   │   ├── employee/   # Employee portal routes
    │   │   ├── hr/         # HR portal routes
    │   │   ├── mis/        # MIS/Admin portal routes
    │   │   ├── login/      # Authentication pages
    │   │   └── ...
    │   ├── components/     # React components
    │   │   └── layouts/    # Role-based layouts
    │   ├── context/        # React Context providers
    │   ├── lib/            # Utilities (api, firebase)
    │   └── services/       # API service functions
    ├── public/             # Static assets
    ├── vercel.json         # Vercel deployment config
    └── .env.local.example  # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (or SQLite for development)
- Firebase project (for auth/storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee_leave
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend-next
   npm install
   ```

4. **Configure environment variables**

   Backend (`.env` in `backend/`):
   ```env
   PORT=5000
   DATABASE_URL=postgres://user:password@localhost:5432/employee_leave
   JWT_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   FRONTEND_URL=http://localhost:3000
   ```

   Frontend (`.env.local` in `frontend-next/`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   
   # Firebase (optional)
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### Running Development Servers

1. **Start the backend** (Terminal 1):
   ```bash
   cd backend
   npm start
   ```

2. **Start the Next.js frontend** (Terminal 2):
   ```bash
   cd frontend-next
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Key Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Employee, HR, MIS)
- Protected routes with middleware

### API Integration
- Axios with interceptors for token management
- Automatic token refresh on 401 responses
- API proxy configured in `next.config.mjs`

### Firebase Integration
- Firebase Auth (optional, for additional auth providers)
- Firebase Storage (for file uploads)
- Configured in `src/lib/firebase.ts`

### Real-time Updates
- Socket.IO for real-time notifications
- Notification context for app-wide state

## Migration Notes

### Changes from React + Vite to Next.js 14

1. **Routing**: 
   - React Router → Next.js App Router
   - File-based routing in `src/app/` directory
   - Nested layouts for role-based UI

2. **Data Fetching**:
   - Client-side fetching with `useEffect` (kept for compatibility)
   - Can be upgraded to Server Components later

3. **Context Providers**:
   - Wrapped in `src/app/providers.tsx`
   - Client components marked with `'use client'`

4. **Navigation**:
   - `useNavigate` → `useRouter`
   - `<Link>` from `next/link`
   - `useLocation` → `usePathname`

5. **Environment Variables**:
   - Public variables prefixed with `NEXT_PUBLIC_`

## Deployment

### Vercel Deployment

1. **Connect repository** to Vercel

2. **Configure environment variables** in Vercel dashboard

3. **Update `vercel.json`** with your backend URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-backend-url.com/api/:path*"
       }
     ]
   }
   ```

4. **Deploy backend** separately (Railway, Render, or any Node.js host)

### Backend Deployment

The Express backend should be deployed separately. Options include:
- Railway
- Render
- DigitalOcean App Platform
- AWS EC2/ECS

Update the frontend environment variables with your deployed backend URL.

## Development Workflow

### Adding New Pages

1. Create a new file in `src/app/<route>/page.tsx`
2. For protected routes, the layout will handle authentication

### Adding New API Services

1. Create or update service in `src/services/`
2. Use the `api` instance from `src/lib/api.ts`

### Component Development

1. Server Components: Default, no directive needed
2. Client Components: Add `'use client'` at the top
3. Use Client Components for:
   - Hooks (useState, useEffect, etc.)
   - Browser APIs
   - Event handlers

## Troubleshooting

### CORS Issues
- Ensure backend CORS is configured for frontend URL
- Check `FRONTEND_URL` in backend `.env`

### Authentication Issues
- Clear localStorage and try again
- Check token expiration
- Verify JWT secrets match

### Build Errors
- Run `npm run build` to check for TypeScript errors
- Some pages use placeholder components during migration

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Run `npm run build` to verify production build
5. Submit a pull request

## License

Private - All rights reserved.
