# 💸 Fiscal Flow
## 🌐 Overview

Fiscal Flow is a full-stack web application designed to simplify personal finance management. In today's digital economy — with fragmented income streams, multiple payment platforms, and ever-growing subscriptions — tracking finances manually is error-prone and inefficient.

Fiscal Flow addresses these challenges by providing:

- A centralized dashboard for real-time financial monitoring
- Automated transaction categorization (earnings, savings, expenditure)
- Graphical cash flow analytics and category-based visualizations
- An AI-powered optimization module that generates personalized financial recommendations
- Secure user authentication with JWT

---

## ✨ Features

| Feature | Description |
|---|---|
| **Transaction Management** | Add, view, and delete transactions across three types: Earnings, Savings, and Expenditure |
| **Real-time Dashboard** | Instantly updated summary cards showing Total Revenue, Total Savings, Expenditure, and Net Balance |
| **Cash Flow Analytics** | Multi-line trend charts for longitudinal cash flow analysis |
| **Category Breakdown** | Bar charts visualizing spending by category |
| **AI Optimization** | Rule-based and XGBoost-powered insights for savings rate optimization and high-spend alerts |
| **Excel Import** | Bulk import transactions from `.xlsx`, `.xls`, or `.csv` files via SheetJS |
| **Guest Mode** | Use the app without logging in — data persists in localStorage |
| **Secure Auth** | JWT-based authentication with bcrypt password hashing |
| **Cloud Storage** | MongoDB Atlas for scalable, reliable, cloud-hosted data persistence |
| **Responsive UI** | Works seamlessly on desktop and mobile browsers |

---

## 🛠 Tech Stack

### Frontend
- **React.js** — Component-based UI
- **Vite** — Fast build tooling
- **React Router** — Client-side routing with `PrivateRoute` guards
- **Recharts / Chart.js** — Data visualization
- **SheetJS (xlsx)** — Client-side Excel file parsing

### Backend
- **Node.js** — Server runtime
- **Express.js** — REST API framework
- **Mongoose** — MongoDB ODM for schema definition and validation
- **bcrypt** — Password hashing
- **JSON Web Tokens (JWT)** — Stateless authentication
- **dotenv** — Secure environment variable management

### Database
- **MongoDB Atlas** — Cloud-hosted NoSQL database
- **MongoDB Compass** — Local GUI for database inspection

### Analytics & AI
- **XGBoost (Python)** — Predictive spending pattern analysis
- **financialAdvisor.js** — Rule-based advisory module for actionable financial recommendations
- **NumPy / Pandas** — Data preprocessing for the Python analytics layer

---

## 🏗 System Architecture

```
━━━ USER LAYER ━━━
        User (Browser)
             │
     ┌───────▼────────┐
     │  Landing Page  │  ──►  Login / Register
     └───────┬────────┘
             │
━━━ FRONTEND — React + Vite + React Router ━━━
             │
     ┌───────▼─────────────────────────────────┐
     │  Dashboard (PrivateRoute Protected)      │
     │  ┌──────────┐  ┌──────────┐  ┌────────┐ │
     │  │ Txn CRUD │  │  Excel   │  │   AI   │ │
     │  │          │  │  Import  │  │Insights│ │
     │  └──────────┘  └──────────┘  └────────┘ │
     └───────┬─────────────────────────────────┘
             │  Fetch + JWT Bearer Token
━━━ API CLIENT ━━━
             │
     ┌───────▼─────────────────────────────────┐
     │         Express.js Backend               │
     │  ┌──────────┐ ┌───────────┐ ┌─────────┐ │
     │  │  Auth    │ │   Txn     │ │Insights │ │
     │  │  Routes  │ │  Routes   │ │ Routes  │ │
     │  │JWT+bcrypt│ │CRUD+Midlw │ │XGBoost+ │ │
     │  └──────────┘ └───────────┘ │ Advisor │ │
     │                             └─────────┘ │
     └───────┬─────────────────────────────────┘
             │
━━━ DATA LAYER ━━━
     ┌───────┴──────────────────────────┐
     │  MongoDB Atlas                    │
     │  ┌────────────┐ ┌─────────────┐  │
     │  │   Users    │ │Transactions │  │
     │  │ Collection │ │ Collection  │  │
     │  └────────────┘ └─────────────┘  │
     └───────────────────────────────────┘
             │
     Python XGBoost (Child Process / HTTP bridge)
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- Python 3.8+ (for XGBoost analytics)
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/ravi-bhushan-yadav/FiscalFlow.git
cd FiscalFlow
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Start the backend server:
```bash
node server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Python Analytics Setup
```bash
cd backend/analytics
pip install xgboost numpy pandas
python xgboost_insights.py
```

### 5. Access the App
Open your browser and navigate to: `http://localhost:5173`

---

## 🔄 How It Works

### Authentication Flow
1. User registers with username, email, and password
2. Password is hashed using **bcrypt** before storage
3. On login, backend validates credentials and returns a **JWT token**
4. Token is stored in `localStorage` as `fiscalflow_jwt`
5. All subsequent API calls include `Authorization: Bearer <token>`
6. Dashboard is protected by a `PrivateRoute` — unauthenticated users are redirected to `/login`

### Transaction Flow
1. User fills in the transaction form (Type, Date, Label, Amount, Category)
2. `handlePostTransaction()` validates the form data
3. If logged in → `POST /api/transactions` → saved to MongoDB
4. If in guest mode → saved to React state and synced to `localStorage`
5. UI re-renders: summary cards and charts update instantly
6. On next login, guest data is replaced by backend data

### AI Diagnostics Flow
1. User clicks **"Run Diagnostics"**
2. If logged in: `POST /api/insights/xgboost` calls the Python XGBoost module via child process
3. XGBoost analyzes historical spending patterns and predicts trends
4. `FinancialAdvisor.js` converts model output into human-readable recommendations
5. If in guest mode: a local rule-based engine calculates savings rate vs. target, expense runway, and expense ratio
6. Insights are displayed in the AI Optimization panel

---

## 🗄 Database Schema

### Transaction Collection

| Field | Type | Constraint | Description |
|---|---|---|---|
| `userId` | ObjectId | Required, Indexed | Reference to User |
| `label` | String | Required, Trimmed | Transaction name |
| `category` | String | Required, Trimmed | Category label |
| `amount` | Number | Required, min: 0 | Always stored as positive |
| `date` | Date | Required | Transaction date |
| `type` | String (enum) | `earning` \| `savings` \| `expenditure` | Transaction type |
| `createdAt` | Date | Auto | Timestamp |
| `updatedAt` | Date | Auto | Timestamp |

### User Collection

| Field | Type | Constraint | Description |
|---|---|---|---|
| `username` | String | Required | Display name |
| `email` | String | Required, Unique, Lowercase | Login email |
| `password` | String | Required | bcrypt hashed |
| `financialProfile.targetSavingsRate` | Number | Default: 0.2, Range: 0–1 | Savings target |
| `financialProfile.riskTolerance` | String (enum) | `conservative` \| `moderate` \| `aggressive` | Risk level |
| `financialProfile.monthlyIncome` | Number | Default: 0 | Income estimate |
| `aiPreferences.recommendationFrequency` | String (enum) | `daily` \| `weekly` \| `monthly` | AI frequency |

---

## 🤖 AI & Analytics Module

Fiscal Flow includes a two-tier intelligence system:

### Tier 1 — Rule-Based Advisory (`financialAdvisor.js`)
Available for all users (including guests). Evaluates:
- **Savings Rate** vs. user-defined target
- **Expense Ratio** (expenditure as % of earnings)
- **Expense Runway** (how many days the current balance can sustain current spending)
- Flags categories where spending exceeds healthy thresholds

### Tier 2 — XGBoost Predictive Engine (`xgboost_insights.py`)
Available for logged-in users. Processes historical transaction data to:
- Detect non-linear patterns in spending behaviour
- Estimate future savings trends
- Identify potential overspending risks before they materialize
- The Node.js backend communicates with this Python module via a child process / HTTP bridge asynchronously, ensuring the main user thread is never blocked

---

## 📊 Excel Import Guide

Fiscal Flow supports bulk transaction imports from `.xlsx`, `.xls`, and `.csv` files.

### Step 1 — Create Separate Sheets
Your workbook must have one sheet per transaction type. The sheet name determines the category:

| Sheet Name Keywords | Maps To |
|---|---|
| `earning`, `income`, `revenue` | Earnings |
| `saving`, `savings` | Savings |
| `expenditure`, `expense` | Expenditure |

### Step 2 — Use the Correct Column Headers

| Column | Accepted Header Names | Example |
|---|---|---|
| Label | `Label`, `Name`, `Description`, `Item` | Monthly Salary |
| Category | `Category`, `Cat`, `Group` | Salary |
| Amount | `Amount`, `Value`, `Total`, `Price` | 65000 |
| Date | `Date`, `Dt` | 2026-01-15 |

### Step 3 — Tips
- Date format `YYYY-MM-DD` works best; `DD-MM-YYYY` is also accepted
- Amounts should be plain numbers — currency symbols (₹, $, €) and commas are stripped automatically
- Negative amounts are converted to positive (transaction `type` determines the category, not the sign)
- Rows with no Label and no Amount are skipped automatically
- If a sheet name doesn't match any keyword, its rows default to **Expenditure**

---

## ⚠️ Limitations

- The XGBoost module does not implement continuous or online learning — it operates on historical snapshots rather than adapting in real time
- The rule-based advisory logic uses predefined thresholds and does not personalize recommendations using deep learning
- No direct integration with banking APIs — all transaction data must be entered manually or imported via Excel
- Multi-currency support is listed as a planned feature and is not fully implemented in the current version
- The system does not currently support "what-if" scenario simulation for future financial planning

---

## 🔮 Future Scope

1. **Banking API Integration** — Auto-fetch transaction data from bank accounts to eliminate manual entry
2. **Advanced ML Models** — Replace rule-based logic with deep learning for more accurate, adaptive forecasting
3. **Mobile Application** — Native iOS/Android app for on-the-go finance management
4. **Enhanced Security** — Multi-factor authentication (MFA), end-to-end data encryption, and OAuth support
5. **Goal-Based Alerts** — Budget caps, savings milestones, and push/email notifications
6. **Multi-Currency Support** — Auto-conversion for international transactions
7. **What-If Simulator** — Project future balances based on hypothetical spending changes
