# Peak Performance Admin - Full Stack Setup Guide

This guide will walk you through setting up the complete full-stack application with a Node.js backend and React frontend.

## 🏗️ Project Structure

```
peak-performance-admin/
├── backend/                 # Node.js + Express + Prisma backend
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Data models
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth & error handling
│   │   ├── utils/          # Helper functions
│   │   └── config/         # Configuration files
│   ├── prisma/             # Database schema & migrations
│   └── package.json        # Backend dependencies
├── src/                    # React frontend (existing)
│   ├── components/         # UI components
│   ├── services/           # API services
│   └── ...
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **Git**

### 1. Database Setup

1. **Install PostgreSQL** on your system
2. **Create a new database:**
   ```sql
   CREATE DATABASE peak_performance_db;
   ```

### 2. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env with your database credentials
   DATABASE_URL="postgresql://username:password@localhost:5432/peak_performance_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   ```

4. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

5. **Push database schema:**
   ```bash
   npm run db:push
   ```

6. **Seed the database:**
   ```bash
   npm run db:seed
   ```

7. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. **Navigate to the root directory:**
   ```bash
   cd ..
   ```

2. **Install frontend dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp env.local .env.local
   
   # The file should contain:
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## 🔐 Default Login Credentials

After seeding the database, you can log in with:

- **Email:** `admin@peakperformance.com`
- **Password:** `admin123`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Members
- `GET /api/members` - Get all members (with pagination & filtering)
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Archive member
- `GET /api/members/:id/stats` - Get member statistics

### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview statistics
- `GET /api/dashboard/monthly-stats` - Monthly statistics for charts
- `GET /api/dashboard/membership-distribution` - Membership type distribution
- `GET /api/dashboard/gender-distribution` - Gender distribution
- `GET /api/dashboard/age-distribution` - Age distribution
- `GET /api/dashboard/recent-activities` - Recent activities

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `PATCH /api/payments/:id/mark-paid` - Mark payment as paid
- `GET /api/payments/stats/overview` - Payment statistics

### Workouts
- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/:id` - Get workout by ID
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `GET /api/workouts/stats/overview` - Workout statistics
- `GET /api/workouts/member/:memberId/history` - Member workout history

## 🛠️ Development Commands

### Backend
```bash
cd backend

# Development
npm run dev              # Start development server with hot reload

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database with sample data

# Production
npm run build            # Build for production
npm start                # Start production server
```

### Frontend
```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm run preview          # Preview production build
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/peak_performance_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Database Schema

The application uses the following main entities:

- **Users** - Admin users with role-based access
- **Members** - Gym members with membership details
- **Payments** - Payment records for memberships and services
- **Workouts** - Workout session records
- **CheckIns** - Gym check-in/check-out records
- **MembershipPlans** - Available membership plans

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Prisma Errors**
   - Run `npm run db:generate` after schema changes
   - Check if database schema is up to date

3. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` in backend `.env`
   - Check if frontend URL is included

4. **JWT Errors**
   - Ensure `JWT_SECRET` is set in backend `.env`
   - Check token expiration

### Logs

- **Backend logs** are displayed in the terminal
- **Frontend errors** are shown in browser console
- **Database queries** can be viewed in Prisma Studio

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based access control** (ADMIN, STAFF, SUPER_ADMIN)
- **Password hashing** with bcrypt
- **Input validation** with express-validator
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **Helmet.js** for security headers

## 📈 Performance Features

- **Database indexing** for fast queries
- **Pagination** for large datasets
- **Compression** for API responses
- **Efficient queries** with Prisma ORM
- **Caching** strategies for frequently accessed data

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `JWT_SECRET`
4. Use PM2 or similar process manager
5. Set up reverse proxy (Nginx)

### Frontend Deployment
1. Build with `npm run build`
2. Deploy `dist` folder to static hosting
3. Configure environment variables
4. Set up custom domain if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the logs
3. Check GitHub issues
4. Create a new issue with detailed information

---

**Happy coding! 🎉**

