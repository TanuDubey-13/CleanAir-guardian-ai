# CleanAir Guardian AI - Environmental Monitor & Cleanup Coordinator

[![Deploy Vite site to GitHub Pages](https://github.com/TanuDubey-13/CleanAir-guardian-ai/actions/workflows/deploy.yml/badge.svg)](https://github.com/TanuDubey-13/CleanAir-guardian-ai/actions/workflows/deploy.yml)

CleanAir Guardian AI is a production-quality, AI-powered environmental monitoring and reporting platform that enables citizens to identify, report, and track local pollution hotspots. Built using Google Cloud Platform (Firebase) and Google Gemini AI, it helps communities report incidents instantly while enabling municipal authorities to verify, manage, and resolve waste issues.

### 🔗 [Click Here for the Live Demo Link](https://tanudubey-13.github.io/CleanAir-guardian-ai/)

---

## 🌟 Key Features

### ⚡ Frictionless Hackathon Demo Mode
* **Instant Evaluation**: The live link runs in **Demo Mode** by default. Judges can explore the interactive analytics dashboard, view the live map, submit test reports, and use the admin control panel immediately without being forced to wait for database setup or email validation links.
* **Full Production-Ready Mode**: To connect to a live database, simply clone the repository and add your Firebase configurations. The app automatically turns off Demo Mode when configuration variables are present.

### 🔐 Authentication
* **Google SSO & Email Sign-In**: Quick Google Login alongside secure Email/Password registration.
* **Frictionless Onboarding**: Automatic credentials verification with an option to skip email confirmation in development setups.
* **Session Persistence & Route Protection**: Role-based access validation (Citizen vs. Administrator dashboards).

### 📸 Citizen Reporting Flow
* **Multimodal Uploads**: Drag-and-drop file uploads or direct mobile camera snapshots (`capture="environment"`).
* **Location Auto-Detection**: Core GPS coordinates parsed directly from the browser context with manual map pin selector overrides.
* **Gemini AI Audit**: Dual-mode analysis using **Gemini 2.5 Flash** that automatically identifies waste category, environmental impact, community health risk, safety recommendations, and citizen tips.
* **Municipal Letter Auto-Drafting**: Gemini automatically writes a formal, professional email complaint to city representatives referencing the exact coordinates, category, and severity details.

### 🗺️ Hotspot Visualization Map (Leaflet)
* **Interactive Marker Pins**: Open-source Leaflet map showing localized hotspots with pulsing, color-coded severity markers (Green = Low, Amber = Medium, Orange = High, Red = Critical).
* **Detailed popup previews**: Click pins to view incident photos, severity tags, description, and status.
* **Live Analytics & Chart.js**: Dashboard display of category breakdown doughnut statistics and report logs over time.

### 👮 Admin Control Console
* **Spam Moderation**: Reject fake/duplicate submissions.
* **Incident Workflow**: Verify reports and update statuses to "Resolved" with administrative notes.
* **Role Permissions**: Change accounts from citizen to administrator scopes directly.

---

## 🏗️ Folder Architecture

```
src/
├── assets/          # Static files & brand graphics
├── components/      # Draggable maps, image upload, protected route frames
├── context/         # AuthContext and ThemeContext hooks
├── hooks/           # useAuth, useTheme, useGeolocation wrappers
├── layouts/         # RootLayout (Navbar shell) and AuthLayout (Login split pane)
├── pages/           # Dashboard, ReportPollution, CitizenHistory, AdminDashboard, Privacy
├── firebase/        # SDK initialization (config.ts)
├── services/        # Multimodal Gemini API interface (gemini.ts)
└── styles/          # Tailwind directives, custom glassmorphism components
```

---

## 🛠️ Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/TanuDubey-13/CleanAir-guardian-ai.git
cd cleanair-guardian-ai
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Setup Environment Variables
Copy the template environment file:
```bash
cp .env.example .env
```
Open `.env` and fill in your respective Firebase and Gemini API keys.

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

## 🌎 Deployment (GitHub Pages)

The project is configured to automatically deploy to GitHub Pages on every push to the `main` branch via GitHub Actions:
1. Go to your repository settings on GitHub.
2. Navigate to **Pages** > **Build and deployment** > **Source** and select **`GitHub Actions`**.
3. Any push to `main` will compile and host the app in the cloud!
