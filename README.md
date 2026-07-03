# CleanAir Guardian AI - Environmental Monitor & Cleanup Coordinator

CleanAir Guardian AI is a production-quality, AI-powered environmental monitoring and reporting platform that enables citizens to identify, report, and track local pollution hotspots. Built using Google Cloud Platform (Firebase) and Google Gemini AI, it helps communities report incidents instantly while enabling municipal authorities to verify, manage, and resolve waste issues.

---

## 🌟 Features

### 🔐 Authentication
* **Google SSO & Email Sign-In**: Quick Google Login alongside secure Email/Password registration.
* **Email Verification**: Automatic onboarding validation preventing fake citizen accounts.
* **Session Persistence & Route Protection**: Role-based access validation.

### 📸 Citizen Reporting Flow
* **Multimodal Uploads**: Drag-and-drop file uploads or direct mobile camera snapshots (`capture="environment"`).
* **Location Auto-Detection**: Core GPS coordinate detection synced with manual Google Maps pin selector overrides.
* **Gemini AI Audit**: Dual-mode analysis using Gemini 2.5 Flash that automatically identifies waste category, environmental impact, community health risk, municipal letter draft, and safety tips.

### 🗺️ Hotspot Visualization Map
* **Interactive Marker Pins**: Color-coded markers indicating category and severity.
* **Density Heatmap Layer**: Weighted heatmaps showing pollution density areas.
* **Activity Metrics & Chart.js**: Live dashboard displaying incident trends and breakdown statistics.

### 👮 Admin Control Console
* **Spam Moderation**: Reject fake/duplicate submissions.
* **Incident Workflow**: Verify reports and update statuses to "Resolved" with crew dispatch logs.
* **Role Permissions**: Change accounts from citizen to administrator scopes directly from the database.

---

## 🏗️ Architecture

```
src/
├── assets/          # Static files & brand graphics
├── components/      # Draggable maps, image upload, protected route frames
├── constants/       # App constants and mock content
├── context/         # AuthContext and ThemeContext hooks
├── hooks/           # useAuth, useTheme, useGeolocation wrappers
├── layouts/         # RootLayout (Navbar shell) and AuthLayout (Login split pane)
├── pages/           # Dashboard, ReportPollution, CitizenHistory, AdminDashboard, Privacy
├── firebase/        # SDK initialization (config.ts)
├── services/        # Multimodal Gemini API interface (gemini.ts)
└── styles/          # Tailwind directives, custom glassmorphism components
```

---

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository_url>
cd cleanair-guardian-ai
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Setup Environment variables
Copy the template environment file:
```bash
cp .env.example .env
```
Open `.env` and fill in your respective API keys.

### 4. Run Development Server
```bash
npm run dev
```

---

## 🚀 Firebase Setup

To connect your project to Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Enable the following services:
   * **Authentication**: Go to *Build > Authentication > Sign-in method* and enable **Email/Password** and **Google**.
   * **Cloud Firestore**: Go to *Build > Firestore Database > Create Database*. Set to production or test mode.
   * **Cloud Storage**: Go to *Build > Storage > Get Started*.
3. Add a Web App in Project Settings to get your SDK Credentials, and copy them into your local `.env`.
4. Deploy the rules files. Copy the contents of `firestore.rules` and `storage.rules` in this project to their respective Firebase console rules editors.

---

## 🧠 Gemini Setup
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Create API Key** and select your Google Cloud Project.
3. Copy the generated key and paste it into the `VITE_GEMINI_API_KEY` field in your `.env`.

*Note: If no API key is specified, CleanAir Guardian AI will fall back to high-fidelity mock analysis data automatically to allow testing without keys.*

---

## 🌎 Deployment (Firebase Hosting)

Deploy the web application to public servers using Firebase CLI:
```bash
# 1. Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# 2. Login to Google Firebase account
firebase login

# 3. Initialize Hosting project (select existing project)
firebase init hosting

# Choose 'dist' as the public directory, and 'Yes' for Single Page App redirect.
# 4. Compile React typescript production bundle
npm run build

# 5. Deploy build to production servers
firebase deploy --only hosting
```

---

## 🔮 Future Scope
* **PWA Offline Support**: Enable offline reporting that caches coordinates and images locally and syncs them once internet access is restored.
* **Automatic Municipal Sync**: Connect to existing city maintenance pipelines (e.g. 311 systems) via automated webhooks.
* **Citizen Leaderboard**: Reward active community cleanup volunteers with points and green badges.
