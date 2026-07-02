# Operations Management Platform

This is a modern, AI-powered internal operations platform designed specifically for eyewear manufacturing and retail. It streamlines order tracking, inventory management, and SLA compliance using predictive machine learning models and generative AI insights.

## 🌟 Key Features

*   **Predictive SLA Monitoring**: Uses an embedded **XGBoost** machine learning model to continuously evaluate active orders. It predicts the probability of an order breaching its Service Level Agreement (SLA) based on inventory availability, lens complexity, and days elapsed.
*   **Context-Aware AI Briefings**: Integrates with **OpenAI (GPT-4o-mini)** to generate page-specific, ultra-concise executive briefings. The AI automatically analyzes raw tabular data (like low stock levels or high-risk orders) and converts it into actionable recommendations.
*   **Smart Automated Alerts**: Features an intelligent alerting system that intercepts critical order updates. If an order's breach probability exceeds 70%, or if a critical status ("Delayed", "QC Failed") is applied, the system automatically dispatches SMTP email alerts to the operations manager.
*   **Real-time Analytics Dashboard**: Clean, responsive, dark-mode native dashboard built with **React** and **Tailwind CSS**, featuring dynamic visualizations using **Recharts**.

## 🛠️ Technology Stack

### Frontend
*   **React 18** (Vite)
*   **Tailwind CSS** (Styling & Layout)
*   **Recharts** (Data Visualization)
*   **React Router v6** (Navigation)
*   **Lucide React** (Iconography)

### Backend
*   **FastAPI** (High-performance Python web framework)
*   **SQLAlchemy** (ORM)
*   **PostgreSQL** (Amazon RDS Database)
*   **XGBoost & Pandas** (Machine Learning Pipeline)
*   **OpenAI SDK** (Generative AI Integration)
*   **smtplib & MIME** (Email Dispatching)

## 🚀 Setup Instructions

### 1. Database Configuration
1. Ensure you have a PostgreSQL instance running.
2. Navigate to the `backend` directory and configure your `.env` file:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/dbname
   OPENAI_API_KEY=your_openai_api_key_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ALERT_RECEIVER_EMAIL=target_email@gmail.com
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the database and seed it with mock data:
   ```bash
   python create_tables.py
   python seed_data.py
   python seed_orders.py
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app:app --reload
   ```
   *The backend will run at `http://127.0.0.1:8000`*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`*

## 📁 Project Structure

```text
ELUNO_Assignment/
├── backend/                   # FastAPI Backend
│   ├── ai_assistant/          # OpenAI Integration & Context Slicing
│   ├── ai_prediction/         # XGBoost Model & Breach Prediction Logic
│   ├── alerts/                # SMTP Email Dispatching & Smart Triggers
│   ├── dashboard/             # Aggregation Endpoints for Recharts
│   ├── inventory/             # Lens Stock Management Endpoints
│   ├── orders/                # Order Lifecycle Endpoints
│   └── utils/                 # Database Models & Connections
└── frontend/                  # React Frontend
    ├── src/
    │   ├── components/        # Reusable UI Components & Charts
    │   ├── context/           # Global State Management (DashboardRefresh)
    │   ├── pages/             # Route Pages (Home, Orders, Inventory, etc.)
    │   └── services/          # Axios API Interceptors
```

## 🤖 AI Features Deep Dive

*   **Context Slicing**: To prevent "hallucinations" and save token costs, the backend isolates the context window based on the active page. The Inventory page only sends stock-related data to OpenAI, while the Orders page only sends dispatch metrics.
*   **Automated Risk Triage**: When a user creates a new order via the "Quick Create" form, the frontend automatically triggers a background API call to evaluate the order's SLA risk, dispatching an alert immediately if necessary.
