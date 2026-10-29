# Historical frontend notes

This document describes an earlier version. Use the root README.md and BACKEND_SETUP.md for the current Firebase backend.

# Rana Zahid Hussain — Personal Diary App

This is a **React + Vite** based personal diary / business management web app built for Rana Zahid Hussain (a property dealer). The app includes diary/notes, personal expenses, loan tracking, a calculator, a calendar, and a full **Business workspace** (properties, clients, follow-ups, payments, gallery).

> ⚠️ **Right now this app is 100% frontend-only.** There is no backend/server. Whatever data gets saved (notes, expenses, payments, properties, clients, etc.) is saved only in the browser's **`localStorage`**. This README first explains the entire frontend in detail, then gives a **full Firebase backend roadmap** at the end for turning it into a real backend.

---

## 1. Tech Stack (Frontend)

| Item                       | What's Used                                                  |
| -------------------------- | ------------------------------------------------------------ |
| Framework                  | React 19                                                     |
| Build Tool                 | Vite 8                                                       |
| Routing                    | `react-router-dom` v7                                        |
| Styling                    | Tailwind CSS v4 (via `@tailwindcss/vite` plugin)             |
| Icons                      | `lucide-react` + `react-icons`                               |
| Charts                     | `recharts`                                                   |
| PDF Export                 | `jspdf` + `jspdf-autotable`                                  |
| Dates                      | `date-fns`                                                   |
| State Management           | Just React `useState`/`useEffect`/Context — no Redux/Zustand |
| Data Persistence (current) | Browser `localStorage` (no database)                         |
| Linting                    | ESLint                                                       |

Package manager scripts (`package.json`):

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run preview` — preview the build
- `npm run lint` — ESLint check

---

## 2. App Structure (Routing)

Entry point: `src/main.jsx` → `App.jsx` is rendered inside `BrowserRouter` + `AuthProvider`.

All routes are defined in `src/App.jsx`:

```
/login                        → Public route (redirects to "/" if already logged in)

/  (Protected — wrapped in Navbar+Sidebar shell)
├── /                         → Dashboard
├── /payment                  → All Payments
├── /payment/add               → Add Payment
├── /payment/received          → Received Payments
├── /payment/pending           → Pending Payments
├── /payment/overdue           → Overdue & Reminders
├── /payment/methods           → Payment Methods
├── /payment/loan-detail       → Loan Detail
├── /setting  &  /settings    → Settings
├── /notes                    → Diary Notes
├── /personal-expenses         → Personal Expenses + Loans
├── /calculator                → Calculator
├── /calendar                  → Calendar
└── /business/*                → Business Workspace (Dashboard, Properties, Clients, Follow-ups, Gallery)
```

Every protected route is guarded by the `ProtectedRoute` component — if the user isn't logged in, they get redirected to `/login`.

---

## 3. Authentication (Current — Dummy/Frontend-Only)

Files: `src/context/AuthContext.jsx` + `src/config/authConfig.js`

- This app is **single-user** — there's only one login (Rana Zahid Hussain's). There's no signup/registration screen.
- The default credentials are **hardcoded** in `src/config/authConfig.js`:
  ```js
  DEFAULT_CREDENTIALS = {
    email: 'ranazahid@example.com',
    password: 'ChangeMe123',
  };
  ```
- On login, `diary_auth_session = "true"` gets set in `localStorage` — that's the only thing the app checks to know the user is logged in.
- If the user changes their password from Settings, the new email/password gets saved to the `diary_auth_credentials` key in `localStorage` (overwriting the defaults).
- **Security note:** This is fine for a private personal project only. Since everything lives in the frontend, anyone who opens browser DevTools can read the credentials. It's not secure for real users — which is why migrating to Firebase Auth is necessary (see the roadmap below).
- `ProtectedRoute.jsx` and `PublicOnlyRoute.jsx` — these are the two route-guard components that check login state and redirect.

---

## 4. What's Been Built in the Frontend (Module by Module)

### 4.1 Shell — Navbar + Sidebar (`src/Navbar/`, `src/DashBoard/SideBar.jsx`)

- **Navbar** (top bar): Logo/branding, Home link, Payments dropdown (6 sub-links), Notes link, a notification bell (the UI is ready but the `notifications` array is always empty — there's a comment saying _"will be populated later from Firebase/API"_), and a profile avatar (RZ).
- **Sidebar** (left panel): Dashboard, Business (dropdown), Personal Expenses, Calculator, Calendar, Settings — plus a user profile card at the bottom.

### 4.2 Dashboard (`src/DashBoard/DashBoard.jsx` — ~1650 lines)

This is a business-style overview dashboard with:

- Search bar, date range card
- Pipeline (deal stages) tracker
- Buyers list, Properties list, Activities feed, Tasks/To-do
- Notes quick-add
- An "Add" modal (for adding Property / Client / Deal)
- A line chart (recharts) for revenue/trend

⚠️ **Important:** All of this Dashboard's data (`tasks`, `notes`, `pipeline`, `activities`, `buyers`, `properties`, `schedule`) just starts from `useState([])` — **there's no localStorage saving at all**. That means all this data resets the moment the page refreshes. It's still purely UI/mock, not connected to any real data source.

### 4.3 Notes / Diary (`src/Notes/`)

- `hooks/useDiary.js` — CRUD hook (`addEntry`, `updateEntry`, `deleteEntry`), `localStorage` key: **`personal_diary_entries`**
- `utils/groupByDate.js` — groups entries into "Today / Yesterday / <date>" sections (uses date-fns)
- `components/EntryList.jsx` — left sidebar list
- `components/Editor.jsx` — right-side editor
- Entry shape: `{ id, title, content, date, createdAt, updatedAt }`
- ✅ This module is fully functional — create/edit/delete/persist all work (through localStorage).

### 4.4 Payments (`src/Payment/`)

Sub-pages: All Payments, Add Payment, Received, Pending, Overdue & Reminders, Payment Methods, Loan Detail.

- All payment pages share one `localStorage` key: **`personal_diary_payments`**
- **`AddPayment.jsx`** — a multi-step form (select property/client → amount/method → review) that creates a new payment record and pushes it into `personal_diary_payments`.
- **`AllPayments.jsx`** — table view, search/filter, PDF export (`jspdf` + `autoTable`), status badges (Received/Pending/Overdue).
- **`ReceivedPayments.jsx` / `PendingPayments.jsx` / `OverdueReminders.jsx`** — show the same data filtered by status, each with its own Add/Edit/Delete modal.
- **`PaymentMethods.jsx`** — its own localStorage-based CRUD for managing payment methods (Cash/Bank/Cheque etc.).
- **`LoanDetail.jsx`** — loan given/taken records; uses the `personal_diary_loans` key (the same key `PersonalExpenses/hooks/useLoan.js` also uses — so data can be viewed/edited from both places).

⚠️ **Orphan files:** `PaymentLayout.jsx` and `PaymentSidebar.jsx` aren't routed/imported anywhere in App.jsx (App.jsx routes directly to the individual pages instead). These two files are currently dead code — could be removed or consolidated in a future cleanup.

### 4.5 Personal Expenses (`src/PersonalExpenses/`)

- `hooks/useExpenses.js` → localStorage key **`personal_diary_expenses`**
- `hooks/useLoan.js` → localStorage key **`personal_diary_loans`**
- `utils/constants.js` — fixed lists for expense categories, payment methods, loan types/status
- `utils/pdfExport.js` — exports expenses/loans to PDF
- Components: `SummaryCards`, `NetBalanceChart`, `ExpenseCharts`, `LoanChart`, `HistoryFilter`, `ExpenseForm`, `LoanForm`
- `PersonalExpenses.jsx` — 2 tabs (Expenses / Loans), calculates totals (total spent, given, taken, pending, net loan)
- ✅ Fully functional CRUD + charts + PDF export, backed by localStorage.

### 4.6 Calculator (`src/calculators/`)

- `hooks/useCalculator.js` — the whole calculator logic (digit input, operators, %, backspace, also supports keyboard shortcuts)
- `utils/operations.js` — pure math functions (add/subtract/multiply/divide, floating-point rounding fix)
- History `localStorage` key: **`personal_diary_calculator_history`** — every calculation (title + description + result) is saved, capped at 50 entries
- Components: `Display`, `Keypad`, `HistoryPanel`

### 4.7 Calendar (`src/calendar/`)

- `hooks/useCalendar.js` → localStorage key **`personal-diary-calendar-events`**
- `hooks/useReminders.js` — uses the browser `Notification` API to show reminders (checks every 30 seconds)
- `services/reminderService.js` — calculates reminder time, requests notification permission
- `services/eventColors.js` — event color palette (purple/pink/blue/green/orange/red)
- Views: `MonthCalendar`, `WeekCalendar`, `DayCalendar` + `EventModal`, `EventDetailsModal`, `ReminderToast`
- ✅ Fully functional — add/edit/delete events + browser notifications (if the user grants permission).

### 4.8 Business Workspace (`src/Business/`)

Route: `/business/*` (has its own separate `BusinessSidebar` layout).

- **`BusinessDashboard.jsx`** — KPIs (revenue, commission), area chart, quick links. Data currently starts from **`EMPTY_DATA`** (all zeros/empty) — there's a comment saying _"Replace this with Firebase/API data later."_
- **`PropertiesPage.jsx`** → localStorage key `personal_diary_properties`
- **`ClientsPage.jsx`** → localStorage key `business_clients`
- **`FollowUpsPage.jsx`** → localStorage key `personal_diary_followups`
- **`PropertyGallery.jsx`** — a property photos gallery UI, but ⚠️ its `properties` state is just `useState([])` — **it neither loads from localStorage nor connects to `PropertiesPage.jsx`'s data**. That means properties added here disappear on refresh, and are completely independent from the Properties page.
- **`ReportsPage.jsx`** — the file exists but ⚠️ **it isn't routed anywhere** (not included in `BusinessLayout.jsx`'s routes list) — it's currently an orphan/unused file.

### 4.9 Settings (`src/DashBoard/Setting.jsx`)

5 tabs: Profile & Account, Diary Preferences, Appearance, Reminders & Alerts, Privacy & Passcode.
⚠️ Only **Logout** is functionally wired up (calls `useAuth().logout()` and redirects to `/login`). All the other tabs (profile edit, theme, notifications, security passcode) just hold local `useState` form data — clicking Save shows a "Settings saved!" toast, but **nothing actually persists anywhere** (not localStorage, not a backend). It's currently UI-only/mock.

### 4.10 Shared/Common Components (`src/components/common/`)

Reusable UI kit: `Button`, `Card`, `Badge`, `Modal`, `ConfirmDialog`, `Dropdown`, `DatePicker`, `Input`, `Table`, `Tabs`, `EmptyState`. These are mostly used by the Notes and PersonalExpenses modules; the Payment/Business/Dashboard modules use their own inline components instead (which is why there's a bit of style inconsistency across the app — these could be migrated to the shared components later).

---

## 5. Data Persistence — Current State (localStorage keys)

| Module                                                  | localStorage Key                    | Status                                        |
| ------------------------------------------------------- | ----------------------------------- | --------------------------------------------- |
| Auth session                                            | `diary_auth_session`                | ✅ working                                    |
| Auth credentials (changed password)                     | `diary_auth_credentials`            | ✅ working                                    |
| Notes/Diary                                             | `personal_diary_entries`            | ✅ working                                    |
| Payments (all sub-pages)                                | `personal_diary_payments`           | ✅ working                                    |
| Loans (Personal Expenses + Payment/LoanDetail — shared) | `personal_diary_loans`              | ✅ working                                    |
| Personal Expenses                                       | `personal_diary_expenses`           | ✅ working                                    |
| Calculator History                                      | `personal_diary_calculator_history` | ✅ working                                    |
| Calendar Events                                         | `personal-diary-calendar-events`    | ✅ working                                    |
| Business → Properties                                   | `personal_diary_properties`         | ✅ working                                    |
| Business → Clients                                      | `business_clients`                  | ✅ working                                    |
| Business → Follow-ups                                   | `personal_diary_followups`          | ✅ working                                    |
| Dashboard (home page) data                              | —                                   | ❌ not persisted (in-memory only)             |
| Business Dashboard KPIs                                 | —                                   | ❌ empty/mock (`EMPTY_DATA`)                  |
| Property Gallery                                        | —                                   | ❌ not persisted, not connected to Properties |
| Settings (profile/theme/notifications/security)         | —                                   | ❌ not persisted                              |
| Notifications (Navbar bell)                             | —                                   | ❌ always empty array                         |

---

## 6. Backend Roadmap — Firebase 🔥

Since the **entire backend will be on Firebase**, here's a step-by-step roadmap for converting the current localStorage-based app into a real Firebase-powered backend.

### Phase 0 — Firebase Project Setup

1. Create a new project on the [Firebase Console](https://console.firebase.google.com/) (e.g. `rana-zahid-personal-diary`).
2. Add a web app → you'll get a Firebase config object (`apiKey`, `authDomain`, `projectId`, etc.).
3. Enable these in the project:
   - **Authentication** (Email/Password provider)
   - **Cloud Firestore** (database, production mode)
   - **Cloud Storage** (for receipts/photos)
4. Install the SDK:
   ```bash
   npm install firebase
   ```
5. Create a `src/config/firebase.js` file:

   ```js
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';
   import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   export const storage = getStorage(app);
   ```

6. Put the Firebase keys in a `.env` file (and add `.env` to `.gitignore` — it isn't there yet):
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

### Phase 1 — Authentication Migration (Firebase Auth)

- **Remove** `src/config/authConfig.js` (hardcoded credentials).
- Rewrite `AuthContext.jsx` to use Firebase Auth:
  - `signInWithEmailAndPassword(auth, email, password)` — for login
  - `signOut(auth)` — for logout
  - `onAuthStateChanged(auth, callback)` — to persist/detect the session (replace the localStorage session check with this)
  - `updatePassword()` (Firebase Auth method) — for the Settings "change password" feature
- Since this is a single-user app, just manually create the one user in the Firebase Console (Authentication → Users → Add user) — no signup form needed.

### Phase 2 — Firestore Data Model

Create a Firestore collection for each module. Recommended structure (since it's a single-user app, collections could stay top-level, but `users/{uid}/...` sub-collections are better for both future multi-device sync and security):

```
users/{uid}/
├── diaryEntries/{entryId}        ← Notes module (title, content, date, createdAt, updatedAt)
├── expenses/{expenseId}          ← Personal Expenses (amount, category, date, note, proofUrl)
├── loans/{loanId}                ← Loans (type, amount, person, status, dueDate)
├── payments/{paymentId}          ← Payments (property, client, amount, method, status, receiptUrl)
├── paymentMethods/{methodId}     ← Payment Methods
├── calculatorHistory/{entryId}   ← Calculator history
├── calendarEvents/{eventId}      ← Calendar events (title, date, startTime, reminder, color)
├── properties/{propertyId}       ← Business → Properties (shared by PropertiesPage + Gallery — this fixes the current disconnect between the two)
├── clients/{clientId}            ← Business → Clients
├── followups/{followupId}        ← Business → Follow-ups
├── notifications/{notifId}       ← For the Navbar notification bell
└── settings/profile              ← Settings module (a single document: profile, theme, notifications, security prefs)
```

Migration will follow the same pattern for each module:

1. Replace every hook's localStorage calls (`useDiary.js`, `useExpenses.js`, `useLoan.js`, the history part of `useCalculator.js`, `useCalendar.js`, and the localStorage functions written directly inside the Payment/Business pages) with Firestore calls:
   - `localStorage.getItem` → `getDocs(collection(db, 'users', uid, 'diaryEntries'))` or `onSnapshot(...)` for real-time
   - `localStorage.setItem` (add) → `addDoc(collection(...), data)`
   - update → `updateDoc(doc(db, ...), updates)`
   - delete → `deleteDoc(doc(db, ...))`
2. Use `onSnapshot` for real-time sync so data updates automatically (the current manual "Listen for localStorage changes" comment in `AllPayments.jsx` becomes unnecessary — Firestore gives this for free).
3. Tie the `isLoading` state to Firestore's initial fetch/snapshot loading.

### Phase 3 — Cloud Storage (Files/Images)

These modules have file uploads — they need to connect to Firebase Storage:

- **Payments** — receipt image upload (`AddPayment.jsx` already has a `receiptFile` field)
- **Personal Expenses** — expense proof image
- **Business → Property Gallery** — property photos

Pattern: `uploadBytes(storageRef, file)` → `getDownloadURL(storageRef)` → save the URL in the Firestore document (`receiptUrl`, `proofUrl`, `photoUrls[]`).

### Phase 4 — Fix Known Gaps (alongside the Firebase migration)

These existing gaps will naturally get fixed during migration (since everything will use one central Firestore source):

1. Wire **Dashboard.jsx**'s tasks/notes/pipeline/buyers/properties/activities to live Firestore data (currently empty arrays).
2. Calculate **BusinessDashboard.jsx**'s KPIs from real Firestore aggregates (payments/properties/clients counts).
3. Connect **PropertyGallery.jsx** to the `properties` collection (so the Properties page and Gallery share the same data).
4. Save **Settings.jsx**'s profile/theme/notification/security preferences to the `users/{uid}/settings/profile` document.
5. Populate the **Navbar notifications** from a Firestore `notifications` collection (e.g., automatically create a notification when a payment goes overdue — this could be triggered by a Cloud Function, see Phase 6).
6. **Loan data duplication** (`Payment/LoanDetail.jsx` and `PersonalExpenses/hooks/useLoan.js` both use the same key) — create a single `loans` collection in Firestore and have both pages read/write to it (since they already share the same localStorage key, sharing the same Firestore collection is the natural move).

### Phase 5 — Firestore Security Rules

Since this is a single-user app, a basic rule would be — only an authenticated user with a matching `uid` can read/write their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Storage rules should similarly be restricted by checking `request.auth.uid`.

### Phase 6 — Optional/Advanced (later)

- **Cloud Functions**: automatically detect overdue payments and create a notification document (a daily scheduled/cron function).
- **Firebase Hosting**: deploy the app with `firebase deploy` after `npm run build`.
- **Offline Persistence**: add offline support using Firestore's `enableIndexedDbPersistence()` (useful for features like calculator/notes).
- **Multi-device sync**: this comes for free from Firestore's realtime listeners once the same account is logged in on 2 devices.

### Suggested Migration Order (priority)

1. Firebase Auth (login) — first, since everything else depends on it
2. Notes (`useDiary.js`) — the simplest module, a good starting point to establish the migration pattern
3. Personal Expenses + Loans
4. Payments (all sub-pages)
5. Calendar
6. Business (Properties → Clients → Follow-ups → fix Gallery)
7. Calculator history
8. Settings + Notifications (neither of these has ever actually been implemented, so this is where they'll become functional for the first time, via Firestore)

---

## 7. Local Development

```bash
npm install
npm run dev
```

Default login (until Firebase is migrated): `ranazahid@example.com` / `ChangeMe123` (changeable in `src/config/authConfig.js`).
