# Safe-Guard: Anonymous Student Incident Reporting System (ASIRS)

Safe-Guard (ASIRS) is a robust, full-stack web application designed to provide students with a highly secure, anonymous, and untraceable platform to report incidents such as bullying, harassment, and safety hazards. 

The system leverages advanced AI-driven credibility assessments (including Linguistic Analysis and CBCA-style structural observations) and statistical anomaly detection to help administrators filter out false reports and prioritize genuine emergencies.

## Key Features

### For Students (Reporters)
- **100% Anonymous Reporting:** No personal data is collected or tracked.
- **Report Escrow System:** Reports can be placed in a time-delayed escrow, giving the reporter a window to retract their submission before it reaches administrators.
- **Zero-Knowledge Tracking:** Reporters are given a cryptographically secure Tracking Code to check on the status of their report or communicate with admins without revealing their identity.
- **Evidence Uploads:** Securely attach images or documents to back up claims.

### For Administrators
- **Real-Time Analytics Dashboard:** Visualizes reporting trends, hotspots, and categorical data over customizable timeframes (7 days, 30 days, 90 days) using interactive charts.
- **AI Credibility Scoring:** Every report is automatically analyzed by an AI engine (powered by Gemini) and statistical anomaly detectors to assign a "Credibility Tier" (High, Medium, Low Scrutiny).
- **Advanced Filtering & Pagination:** Easily sift through reports by Category, Status, or Credibility Tier.
- **Two-Way Anonymous Messaging:** Chat securely with anonymous reporters to request more information without breaking their anonymity.
- **Role-Based Access Control:** Secure JWT-based authentication ensuring staff only see reports relevant to their department.

## Tech Stack

**Frontend:**
- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) (for Analytics)
- [React Router DOM](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/) (Icons)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- PostgreSQL (via Prisma)
- JWT Authentication & bcryptjs
- Gemini AI Integration

## Project Structure

This project uses a monorepo-style structure, housing both the frontend React application and the backend Express server.

```text
anonymous-system/
├── public/                 # Static frontend assets
├── server/                 # Backend Node.js / Express Application
│   ├── src/
│   │   ├── controllers/    # Route logic & AI Integration
│   │   ├── middleware/     # JWT Auth, Rate limiting
│   │   ├── routes/         # Express API routes
│   │   └── lib/            # Prisma client instance
│   ├── prisma/             # Prisma schema and migrations
│   └── .env                # Backend environment variables
├── src/                    # Frontend React Application
│   ├── components/         # Reusable UI components & Dashboard Charts
│   ├── pages/              # Route views (Home, SubmitReport, Analytics)
│   ├── services/           # API Client logic
│   └── utils/              # Constants and helpers
├── package.json            # Root dependencies and run scripts
└── vite.config.js          # Vite configuration
```

## Local Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (or your preferred database supported by Prisma)

### 1. Install Dependencies
Run the following command in the root directory to install both frontend dependencies:
```bash
npm install
```
Then, navigate into the `server` directory and install the backend dependencies:
```bash
cd server
npm install
cd ..
```

### 2. Environment Variables
You will need to set up `.env` files for both the root (frontend) and the `server` (backend).

**Backend (`server/.env`):**
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/asirs?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
CLIENT_URL="http://localhost:5173"
GEMINI_API_KEY="your_google_gemini_key"
```

### 3. Database Setup (Prisma)
Navigate to the `server` folder and push the Prisma schema to your database:
```bash
cd server
npx prisma db push
```

### 4. Start the Application
You can run both the frontend (Vite) and backend (Express) concurrently from the root directory:
```bash
npm run dev
```

- The frontend will be available at: `http://localhost:5173`
- The backend API will be running at: `http://localhost:5000`

## Security Measures
- **No IP Logging:** The custom backend logger strictly omits IP addresses to protect reporters.
- **Rate Limiting:** Protects the login and submission routes against brute force and spam attacks.
- **CORS & Helmet:** Strictly configures cross-origin policies and HTTP headers to prevent XSS and clickjacking.
- **Encrypted Payloads:** Sensitive fields (like report descriptions and locations) are decrypted on the fly for admins and remain obfuscated in raw database queries.
