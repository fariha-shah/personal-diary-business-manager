# Rana Zahid - Personal Diary & Business Manager

A private, single-user React + Vite application tailored exclusively for **Rana Zahid**, powered by Google Firebase (Authentication, Cloud Firestore, and Cloud Storage).

The app serves as a comprehensive personal and business hub:
- **Personal Diary**: Rich daily journal entries, categorization, and reflections.
- **Financial Tracker**: Income, personal expenses, loans, payment receipts, and balance calculations.
- **Real Estate & Business Suite**: Property listings with image gallery, clients management, deal tracking, and follow-ups.
- **Utilities**: Business calculator with history, dynamic calendar, PDF report export, and customizable settings.

---

## 🔒 Single-User Architecture & Recruiter Demo Access

This application is strictly designed for **a single owner: Rana Zahid**.
- **No Public Registration**: There is no public signup or registration form.
- **Strict Owner Authentication**: The app enforces `VITE_OWNER_EMAIL` in client-side authentication and session observers. Any unauthorized accounts attempting to log in are immediately rejected and signed out.
- **1-Click Recruiter Demo Access (For Portfolio Reviewers)**: When showcasing this project on your resume or portfolio, recruiters don't have your private password. The login screen features an automated **"1-Click Recruiter Demo Access"** button that lets hiring managers explore the live features without needing your private credentials.
- **Backend Data Isolation**: All documents and media are scoped under `users/{uid}/...` in Cloud Firestore and Firebase Storage. Firebase security rules permit only the authenticated owner to read, create, or update records.

---

## 📱 Mobile & All-Device Responsive

The UI is built with a mobile-first responsive design:
- **Responsive Navigation**: Desktop navigation bar shifts to a sliding hamburger drawer on mobile/tablet screens.
- **Horizontal Tab Navigation**: Workspaces and business subpages dynamically transform into horizontal touch-friendly swipeable tabs on small screens.
- **Adaptive Layouts**: Full support for phones, tablets, laptops, and ultra-wide desktop displays.

---

## 🚀 Quick Start Guide (Beginner-Friendly)

If this is your first time setting up Firebase, follow these simple steps:

### 1. Install Dependencies
Open PowerShell in the project root:
```powershell
npm.cmd install
```

### 2. Configure Environment Variables
Copy `.env.example` to create your local `.env.local` file:
```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` in your editor and configure your owner email and Firebase credentials:
```env
# Authorized Single Owner Email
VITE_OWNER_EMAIL=ranazahid@example.com

# Your Firebase Web App Credentials (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_USE_FIREBASE_EMULATORS=false
```

### 3. Complete Firebase Console Setup
> For the complete step-by-step walkthrough on creating your Firebase project, enabling Email/Password auth, creating the Firestore database, and generating web configuration keys, see **[BACKEND_SETUP.md](BACKEND_SETUP.md)**.

### 4. Deploy Backend Security Rules to Firebase
Login with Firebase CLI and deploy the included Firestore and Storage rules:
```powershell
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes,storage --project YOUR_PROJECT_ID
```

### 5. Launch Application
```powershell
npm.cmd run dev
```
Open `http://localhost:5173` in your browser and sign in with Rana Zahid's email and password.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm.cmd run dev` | Starts Vite local development server (`http://localhost:5173`) |
| `npm.cmd run build` | Compiles and builds production-ready bundle in `dist/` |
| `npm.cmd run preview` | Previews production build locally |
| `npm.cmd run emulators` | Runs offline Firebase local emulators (Auth, Firestore, Storage) |
| `npm.cmd run test:security` | Executes unit tests verifying Firestore & Storage security rules |

---

## 📁 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── Business/          # Properties, clients, follow-ups & reports
│   ├── calculators/       # Business & EMI calculators
│   ├── calendar/          # Event calendar & reminders
│   ├── components/        # Shared UI & auth route guards
│   ├── config/            # Firebase SDK client initialization
│   ├── context/           # Single-user AuthContext (Rana Zahid)
│   ├── DashBoard/         # Overview cards, widgets, sidebar & settings
│   ├── Notes/             # Personal diary & rich notes
│   ├── pages/             # Single-user owner LoginPage
│   ├── Payment/           # Payments tracking, loans & payment methods
│   ├── PersonalExpenses/  # Expense tracker with charts & PDF export
│   └── services/          # Cloud Storage image upload helpers
├── firestore.rules        # Production Firestore security rules
├── storage.rules          # Production Cloud Storage security rules
├── BACKEND_SETUP.md       # Comprehensive step-by-step Firebase guide
└── package.json
```
