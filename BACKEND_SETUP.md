# Step-by-Step Firebase Backend Setup Guide (Single-User: Rana Zahid)

This comprehensive guide is designed for beginners setting up **Firebase** for the first time with this application. 

This project uses three core Firebase services:
1. **Firebase Authentication**: Secures sign-in using Email & Password.
2. **Cloud Firestore**: Real-time NoSQL database storing notes, expenses, properties, clients, and settings.
3. **Cloud Storage**: Secure file hosting for property photos and payment receipt images.

---

## 📋 Prerequisites

Before you start, make sure you have:
1. A Google account.
2. Node.js installed on your computer (check by running `node -v` in PowerShell).
3. The project opened in VS Code or your terminal.

---

## Part 1: Setting Up Your Firebase Project (Firebase Console)

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **"Add project"** (or **"Create a project"**).
3. Project Name: Enter a name (e.g., `rana-zahid-diary`).
4. Google Analytics: You can leave this enabled or disable it (it is optional for personal projects).
5. Click **"Create project"** and wait a few seconds until it says *"Your new project is ready"*. Click **"Continue"**.

---

### Step 2: Set Up Authentication (Email/Password)
1. In the left navigation sidebar of Firebase Console, click on **"Build"** ➔ **"Authentication"**.
2. Click **"Get started"**.
3. Under the **"Sign-in method"** tab, select **"Email/Password"**.
4. Turn on the toggle switch for **"Email/Password"** (leave "Email link" turned off).
5. Click **"Save"**.

---

### Step 3: Create the Single Owner Account (Rana Zahid)
Since this is a strictly private single-user app, there is no public signup screen. You create Rana Zahid's account directly inside the Firebase console:
1. Still inside **Authentication**, click on the **"Users"** tab (next to "Sign-in method").
2. Click the **"Add user"** button.
3. Enter Rana Zahid's email address (e.g. `ranazahid@gmail.com` or your preferred email).
4. Enter a strong password for Rana Zahid.
5. Click **"Add user"**.
6. Note down the email you used — you will add this exact email to `.env.local` as `VITE_OWNER_EMAIL`.

---

### Step 4: Create Cloud Firestore Database
1. In the left sidebar, click on **"Build"** ➔ **"Firestore Database"**.
2. Click **"Create database"**.
3. **Database location**: Choose a region close to you or your target location (e.g. `us-central1`, `asia-south1`, or `europe-west1`).
4. **Security rules**: Choose **"Start in test mode"** (or production mode; we will deploy strict production security rules from the project CLI in a later step).
5. Click **"Create"** (or **"Enable"**) and wait for the database to provision.

---

### Step 5: Set Up Cloud Storage (For Photos & Receipts)
1. In the left sidebar, click on **"Build"** ➔ **"Storage"**.
2. Click **"Get started"**.
3. **Security rules dialog**: Click **"Next"**.
4. **Cloud Storage location**: Keep the default or pick the same region as Firestore.
5. Click **"Done"**.

---

### Step 6: Register Your Web App & Obtain Config Keys
1. In the top-left sidebar, click the gear icon ⚙️ next to **"Project Overview"** and select **"Project settings"**.
2. In the **General** tab, scroll down to the section titled **"Your apps"**.
3. Click the Web icon `</>` to register a web application.
4. App nickname: Enter `Personal Diary Web` (leave Firebase Hosting checkbox unchecked for now).
5. Click **"Register app"**.
6. Firebase will now display a code block containing `firebaseConfig` with keys like `apiKey`, `authDomain`, `projectId`, etc.:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "rana-zahid-diary.firebaseapp.com",
  projectId: "rana-zahid-diary",
  storageBucket: "rana-zahid-diary.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```
7. Keep this page open or copy these values — you will paste them into `.env.local`.

---

## Part 2: Connecting Firebase to Your Project Code

### Step 7: Configure `.env.local`
1. In the root directory of this project, make a copy of `.env.example` named `.env.local` (or edit `.env.local` directly if it already exists).
2. Open `.env.local` in your editor.
3. Fill in the values copied from Step 6, and make sure `VITE_OWNER_EMAIL` matches the email created in Step 3:

```env
# Authorized Single Owner Email
VITE_OWNER_EMAIL=ranazahid@gmail.com

# Firebase Web App Credentials
VITE_FIREBASE_API_KEY=AIzaSyYourActualApiKeyHere
VITE_FIREBASE_AUTH_DOMAIN=rana-zahid-diary.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=rana-zahid-diary
VITE_FIREBASE_STORAGE_BUCKET=rana-zahid-diary.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Set to false to connect to your live Firebase backend
VITE_USE_FIREBASE_EMULATORS=false
```

> [!IMPORTANT]
> Make sure `VITE_USE_FIREBASE_EMULATORS=false` when connecting to your live cloud Firebase project. If set to `true`, the app attempts to connect to local offline emulators instead of your real database.

---

### Step 8: Deploy Security Rules & Indexes to Firebase
To ensure that only Rana Zahid can read and write to Firestore and Storage, deploy the included security rules:

1. Open PowerShell in the project directory:
```powershell
cd "c:\Users\DELL\Documents\Codex\2026-10-16\ok\outputs\PersonalDiary-backend"
```
2. Log in to Firebase CLI:
```powershell
npx firebase login
```
*(A browser window will open. Sign in with the same Google account you used to create the Firebase project).*

3. Deploy Firestore and Storage security rules to your project:
```powershell
npx firebase deploy --only firestore:rules,firestore:indexes,storage --project YOUR_PROJECT_ID
```
*(Replace `YOUR_PROJECT_ID` with your actual project ID, e.g. `rana-zahid-diary`).*

You should see:
```text
✔ Deploy complete!
```

---

## Part 3: Run and Test the Application

### Step 9: Start the Dev Server
Run the application with:
```powershell
npm.cmd run dev
```

Open your browser at:
```
http://localhost:5173
```

1. You will be redirected to the **Owner Sign In** page.
2. Enter Rana Zahid's email (it will match `VITE_OWNER_EMAIL`) and the password created in Step 3.
3. Click **"Sign In"**.
4. You will be redirected to the main Dashboard!
5. Try adding a test diary note or expense to verify that data is syncing live with your Firebase Cloud Firestore.

---

## 🔒 How Single-User Security Works

1. **Client-Side Verification**:
   - `src/context/AuthContext.jsx` enforces `VITE_OWNER_EMAIL`. If anyone attempts to enter a different email address, access is rejected before authentication proceeds.
   - If an account with a different email somehow signs in, `onAuthStateChanged` automatically revokes the session, signs them out, and redirects to the login screen.
2. **Server-Side Security (`firestore.rules` & `storage.rules`)**:
   - All app collections are stored under `users/{uid}/{collection}/{docId}`.
   - The security rules enforce:
     ```firestore
     function owner(uid) {
       return request.auth != null && request.auth.uid == uid;
     }
     ```
   - This guarantees that only the authenticated owner whose UID matches the document path can read, create, edit, or delete any data or uploaded images.
3. **Zero Public Signup**:
   - The frontend contains no registration or account creation endpoints. The only account that exists in Firebase Authentication is the one you created manually in Step 3.

---

## 🧪 Optional: Running Local Offline Emulators

If you ever want to test or develop offline without internet or without touching your live Firebase database:
1. Open `.env.local` and set:
   ```env
   VITE_USE_FIREBASE_EMULATORS=true
   ```
2. Start the local emulators:
   ```powershell
   npm.cmd run emulators
   ```
3. Open `http://127.0.0.1:4000` to access the Firebase Emulator UI.
4. Run automated security tests anytime:
   ```powershell
   npm.cmd run test:security
   ```
