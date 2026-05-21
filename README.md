# Production-Ready MERN Expense Tracker Web Application

A feature-rich, high-performance, full-stack personal finance and budgeting application built using the MERN (MongoDB, Express, React, Node.js) stack. Designed with a premium responsive glassmorphic dark/light UI, interactive financial charts, multi-category budget threshold alerts, dynamic CSV ledger exports, and clean PDF printing.

---

## 🚀 Key Features

*   **Secure Auth**: JWT Authentication with HTTPOnly secure cookies, bcrypt password hashing, and token guards.
*   **Ledger Entries (CRUD)**:
    *   **Inflow (Income)**: Record revenues, categorize, filter by date ranges, amount ranges, and search.
    *   **Outflow (Expenses)**: Track payments with physical receipt uploads (jpeg/png up to 3MB) served statically from Node.
*   **Category Budgets**: Define individual limits per category (e.g. Food, Bills, Rent) or a global monthly budget. Automatic spent checks alert the user when approaching 90% or exceeding limit thresholds.
*   **Visual Analytics**:
    *   Area charts representing Inflow vs Outflow monthly trends (past 6 months).
    *   Surplus Net Savings bar charts representing retained ratios.
    *   Category distribution pie charts.
*   **Premium Visual Experience**: Fully responsive Tailwind CSS v4 design with subtle slide animations (Framer Motion), glassmorphic elements, modern Google Fonts (Outfit / Inter), and instant dark/light theme syncs to database profile.
*   **Reports Export**:
    *   **Download CSV**: Dynamically compiles all recorded incomes and expenses into a standard spreadsheets layout.
    *   **Print PDF**: Pre-styled CSS media rules (`@media print`) ensure clean page-level invoice/statement printing with headers and statistics (automatically hiding sidebars and buttons).
*   **Security & Reliability**: Helmet headers, express-rate-limit API protection, custom Multer multi-directory sanitizers, and comprehensive Express error-handling middlewares.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), Tailwind CSS v4, PostCSS, React Router v7, Context API (State tracking), Axios, Recharts (Graphs), Lucide React (Icons), React Hot Toast.
*   **Backend**: Node.js, Express.js, MongoDB (Atlas), Mongoose ORM, JSON Web Tokens (JWT), BcryptJS, Multer (Image file uploads), Express Validator, Helmet, Cookie Parser.

---

## 📂 Project Architecture

```text
Expense-Tracker/
├── backend/
│   ├── config/             # DB & cloud configurations (db.js)
│   ├── controllers/        # Express handlers (auth, expense, income, budget, analytics)
│   ├── middleware/         # Auth guards, Multer filters, Global error handler
│   ├── models/             # Mongoose Schemas (User, Expense, Income, Budget)
│   ├── routes/             # API routes definitions
│   ├── uploads/            # Static storage for avatars & receipts
│   ├── utils/              # Token generators & budget sync aggregators
│   ├── validators/         # Express validation rule schemas
│   ├── server.js           # Server boot configurations & port binding (5001)
│   └── .env                # Server environmental keys
│
├── frontend/
│   ├── src/
│   │   ├── assets/         # App logos & base icons
│   │   ├── components/
│   │   │   ├── common/     # Reusable UI (Buttons, Cards, Modals, Tables, Toggle)
│   │   │   ├── forms/      # Input forms (TransactionForm, BudgetForm)
│   │   │   └── layout/     # Master shells (Navbar, Sidebar, DashboardLayout)
│   │   ├── context/        # Context states (Theme, Auth, Expense, Income, Budget)
│   │   ├── pages/          # Feature Pages (Dashboard, Expense, Income, Reports, Profile, Settings)
│   │   ├── routes/         # Routing modules (ProtectedRoute, AppRoutes)
│   │   ├── utils/          # Axios instance API client interceptor (api.js)
│   │   ├── App.jsx         # App mounting, providers, & toast setup
│   │   ├── main.jsx        # App root rendering
│   │   └── index.css       # Custom scrollbars, glass styles, Tailwind v4
│   ├── vite.config.js      # Vite compilation configurations
│   ├── tailwind.config.js  # Tailwind config adjustments
│   └── .env                # Client environmental keys (VITE_API_URL)
└── README.md
```

---

## ⚙️ Environmental Configurations

### 1. Backend Config (`backend/.env`)

```ini
PORT=5001
MONGO_URI=mongodb+srv://jasskaur9794_db_user:expense-tracker123@expense-trac.2yrzjnk.mongodb.net/
JWT_SECRET=supersecretkeyforexpensetrackermern2026
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 2. Frontend Config (`frontend/.env`)

```ini
VITE_API_URL=http://localhost:5001/api
```

---

## 🏁 How to Run Locally

### 1. Spin up the Node.js Backend Server

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install server-side dependencies:
   ```bash
   npm install
   ```
3. Run the development server with hot-reloading (nodemon):
   ```bash
   npm run dev
   ```
   *The API will start running on port `5001`.*

### 2. Launch the Vite Development Server

1. Open a separate terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install client-side dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite hot-reloading server:
   ```bash
   npm run dev
   ```
   *The frontend website will open at `http://localhost:5173`.*

---

## 🧪 Production Verification Build

Confirm that compilation and assets pipeline compile successfully without errors:
```bash
cd frontend
npm run build
```
This builds the fully optimized output files inside `frontend/dist/` for high-performance static hosting.
