# GoaRide — MERN Stack Vehicle Rental Platform

GoaRide is a full-stack, production-grade vehicle rental web application for tourists and customers visiting Goa. Built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js), Tailwind CSS, JWT authentication, and Leaflet live GPS tracking.

---

## 🌟 Key Features

- **Unified User & Admin Authentication**: JWT + bcrypt security with protected routes and role authorization (`USER` and `ADMIN`).
- **Vehicle Catalog & Instant Search**: Filter vehicles by type (Bikes & Cars), pickup location, fuel type, transmission, price slider, and sorting.
- **Server-Side Date Availability Check**: Prevents double-booking by enforcing date range collision checks directly on the Express server.
- **Real Price Calculation**: Automatic duration calculation, 18% GST tax calculation, weekly discounts, and security deposit breakdowns.
- **Live GPS Tracking**: Interactive Leaflet map with simulated vehicle position and booking tracking status timeline.
- **AI Travel Assistant**: Smart vehicle recommendations, budget picks, custom 3-day Goa trip itineraries, and rental guidance.
- **Complete Admin Suite**: Live KPI metrics (total revenue, active bookings, user counts), vehicle Create/Read/Update/Delete (CRUD) modal, booking status manager, and user management.
- **Favorites & Vehicle Reviews**: Rate vehicles after completed bookings, toggle favorites, and read verified customer reviews.
- **Razorpay Ready**: Payment controller prepared for Razorpay order generation and verification with automatic development fallback.

---

## 📁 Project Structure

```text
GoaRide/
├── client/                      # Vite + React Frontend
│   ├── src/
│   │   ├── components/          # Navbar, Footer, VehicleCard, BookingModal, Toast, ProtectedRoute
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── pages/               # Home, Vehicles, VehicleDetails, Bookings, Tracking, AiAssistant, Login, Register, AdminDashboard
│   │   ├── services/            # Axios API service with JWT Interceptor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                      # Express.js Backend & MongoDB Models
│   ├── config/                  # MongoDB Mongoose Connection
│   ├── controllers/             # Auth, User, Vehicle, Booking, Favorite, Review, Admin, Payment
│   ├── middleware/              # Auth, Admin, Upload (Multer), Error handling
│   ├── models/                  # User, Vehicle, Booking, Favorite, Review, Location, Payment
│   ├── routes/                  # REST API Endpoints
│   ├── seed/                    # Database Seeder (20+ vehicles, admin, locations)
│   ├── server.js
│   └── package.json
│
├── .env.example
├── package.json                 # Root script runner (concurrently)
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally (`mongodb://localhost:27017/goaride`) or a MongoDB Atlas connection string.

### 2. Installation
Install all dependencies for root, server, and client:

```bash
npm run install-all
```

Or manually:
```bash
# Root
npm install

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Environment Setup
Copy `.env.example` into `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/goaride
PORT=5000
JWT_SECRET=goaride_jwt_secret_key_2026_super_secure
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@goaride.com
ADMIN_PASSWORD=admin123
```

### 4. Seed Database (Required)
Run the seed script to populate 20+ real vehicles (Activa 6G, Classic 350, R15 V4, Thar 4x4, Creta, Innova, Nexon EV, etc.), pickup locations, admin user, and sample reviews:

```bash
npm run seed
```

Default Credentials after seeding:
- **Admin Account**: `admin@goaride.com` / `admin123`
- **Demo User**: `user@goaride.com` / `user123`

### 5. Running the Application
Launch both backend API server and Vite React frontend concurrently:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5000/api`

---

## 📡 Key REST API Endpoints

### Authentication & Users
- `POST /api/auth/register` — Create user or admin account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Get current logged-in user profile
- `GET /api/users` — Get all users (Admin only)
- `PUT /api/users/:id` — Update user profile

### Vehicles (CRUD)
- `GET /api/vehicles` — Search, filter, and sort fleet
- `GET /api/vehicles/:id` — Get vehicle details & reviews
- `POST /api/vehicles` — Create vehicle (Admin only)
- `PUT /api/vehicles/:id` — Update vehicle details (Admin only)
- `DELETE /api/vehicles/:id` — Delete vehicle (Admin only)

### Bookings
- `POST /api/bookings` — Create booking (Checks date availability & calculates price)
- `GET /api/bookings/my` — Get logged-in user's bookings
- `GET /api/bookings/track/:query` — Track booking by number or tracking ID
- `PUT /api/bookings/:id` — Update booking status (Admin / User cancel)
- `DELETE /api/bookings/:id` — Cancel booking

### Favorites & Reviews
- `POST /api/favorites/:vehicleId` — Toggle favorite status
- `GET /api/favorites` — Get user's saved favorite vehicles
- `POST /api/reviews` — Leave review for booked vehicle

### Admin Analytics & Payments
- `GET /api/admin/dashboard` — Get total revenue, vehicle counts, active bookings
- `POST /api/payments/create-order` — Create payment order (Razorpay / Dev fallback)
- `POST /api/payments/verify` — Verify payment signature & finalize booking
