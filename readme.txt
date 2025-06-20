
# 🌸 HealthyMother — Empowering Maternal Health with Technology

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge\&logo=react\&logoColor=%2361DAFB)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge\&logo=next.js\&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge\&logo=firebase\&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge\&logo=tailwind-css\&logoColor=white)

---

## 👩‍⚕️ About the Project

**HealthyMother** is more than just a dashboard — it's a purpose-built platform designed to revolutionize how maternal health is managed. Our full-stack application offers healthcare providers a streamlined, secure, and real-time toolset for supporting expectant mothers across every trimester.

From insightful clinical reporting to intelligent communication tools, **HealthyMother** delivers everything you need to improve maternal outcomes — all wrapped in a sleek, responsive interface.

---

## 👥 Meet the Dream Team

* Ibrahim Success Swaray
* Peter George
* Aisha Suma
* Joyce Thomas
* Emmanuel Sahr Dauda

---

## ✨ Key Features

Here’s what makes HealthyMother stand out:

* 🔐 **Secure Login**
  Firebase Authentication keeps user data safe with robust email/password protection and protected routes.

* 📊 **Insightful Dashboard**
  At-a-glance stats and clinic metrics designed for quick decision-making.

* 🧑‍⚕️ **Smart Patient Management**

  * Search, filter, and browse patient profiles with ease.
  * Dynamic trimester-based insights for individualized care.
  * Auto-updating patient count badges.

* 🛡️ **Whistleblower & Feedback System**

  * Fully anonymous reporting system for safer and more transparent healthcare.
  * Searchable reports dashboard with real-time stats.

* 📣 **Broadcast Messaging System**

  * Targeted alerts by trimester, condition, or risk category.
  * Schedule messages for later — or send instantly.
  * Full history log of all notifications.

* 🔄 **Real-time Data Sync**
  Powered by Firestore for immediate updates — no refresh required.

* 💅 **Beautiful & Responsive UI**
  Crafted with Tailwind CSS + Shadcn/UI for a modern, mobile-friendly experience.

---

## 🛠️ Built With

### Frontend

* **Next.js 14+** (React 18)
* **TypeScript**
* **Tailwind CSS** for styling
* **Shadcn/UI**, **Radix UI** for components
* **Lucide React** for icons
* **React Hook Form** + **Zod** for forms
* **Recharts** for data visualization

### Backend

* **Firebase** for hosting, authentication, and database
* **Firestore (NoSQL)** for real-time storage

### Developer Tools

* **ESLint**
* **npm / pnpm / yarn**

---

## 🚀 Getting Started

Follow these simple steps to launch the project locally:

### 📋 Prerequisites

* Node.js ≥ 18.17.0
* Any package manager: `npm`, `pnpm`, or `yarn`
* A Firebase account

### 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/SahrDauda/healthapp.git
   cd healthapp
   ```

2. Install dependencies:

   ```bash
   npm install
   # OR
   pnpm install
   # OR
   yarn install
   ```

---

### 🔧 Firebase Setup

1. **Create a Firebase project**:
   Go to [Firebase Console](https://console.firebase.google.com/) → *Add Project*

2. **Register a Web App** inside Firebase and copy the `firebaseConfig` object provided.

3. **Add environment variables**:
   Create `.env.local` in your root directory and paste the config like so:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   ```

4. **Update `lib/firebase.js`** to use these env variables securely.

5. **Enable Firebase Services**:

   * Go to **Authentication** → Enable "Email/Password"
   * Go to **Firestore** → Create a DB in test mode for development
   * ⚠️ **Don’t forget to set proper security rules before production!**

---

### 🧪 Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser — and you're live!

---

## 📡 API & External Services

* **Primary API:** Google Firebase
  No third-party APIs are used — everything is powered by Firebase.

---

## 🗃️ Firestore Database Schema

### `ancRecords`

Tracks detailed antenatal care visits per patient.

<details>
<summary>Click to view structure</summary>

```
ancRecords
└─ <patient_id>
   ├── clientNumber: string
   ├── visits: number
   ├── updatedAt: timestamp
   ├─ visit1
   │   ├─ basicInfo: { clientName, phoneNumber, ... }
   │   ├─ facilityInfo: { name, address }
   │   ├─ pastPregnancyHistory
   │   └─ presentPregnancy: { gestationalAge, bp, weight, ... }
   ├─ visit2 ...
```

</details>

---

### `notifications`

Stores all broadcast messages and delivery info.

```
notifications
├── createdAt: timestamp
├── message: string
├── scheduledAt: timestamp | null
├── status: string
├── targetCategories: string[]
├── title: string
├── type: string
```

---

### `report`

Logs whistleblower submissions and feedback.

```
report
├── clientName: string
├── clientNumber: string
├── createdAt: timestamp
├── description: string
├── facilityName: string
├── fileUrls: string[]
├── isAnonymous: boolean
├── phoneNumber: string
├── reportType: string
```

---

## 📝 License

This project is currently **not licensed**. If you plan to share, open-source, or build upon this project, please add an appropriate license file.
