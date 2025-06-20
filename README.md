# HealthyMother - Maternal Health Dashboard

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## Team Members

- Ibrahim Success Swaray
- Peter George
- Aisha Suma
- Joyce Thomas
- Emmanuel Sahr Dauda

---

## 1. Project Description

**HealthyMother** is a comprehensive, full-stack dashboard designed to empower healthcare providers in managing maternal care. It provides a centralized, secure, and intuitive platform for patient monitoring, internal reporting, and targeted communication. The system is built with a modern tech stack to ensure a responsive, scalable, and real-time user experience.

The core mission of this platform is to streamline clinical workflows, improve data accessibility for care providers, and facilitate better health outcomes for expectant mothers through features like trimester-based patient views, dynamic reporting, and instant broadcast messaging.

---

## 2. Key Features

- **Secure Authentication:** Robust email and password login system powered by Firebase Authentication, with protected routes to secure dashboard access.
- **Dynamic Dashboard:** A central hub displaying key metrics and an overview of clinic activities.
- **Patient Profiles Management:**
  - View, search, and filter a complete list of patient profiles.
  - Dynamic patient count badges that update with filters.
  - Detailed patient view with trimester-specific information.
- **Whistleblower/User Reporting:**
  - A secure and anonymous reporting system for users to submit feedback or concerns.
  - A dedicated report management view with statistics on total, unique, and anonymous reports.
  - Advanced search and filtering capabilities for all reports.
- **Notification & Broadcast System:**
  - Create and send broadcast messages to specific patient categories (e.g., by trimester, high-risk).
  - Schedule messages to be sent at a future date and time.
  - View a complete history of all sent, pending, and delivered notifications.
- **Real-time Database Integration:** All application data is powered by a live connection to Google Firestore, ensuring data is always up-to-date.
- **Responsive & Modern UI:** Professionally designed with Tailwind CSS and Shadcn/UI for a seamless experience on both desktop and mobile devices.

---

## 3. Tech Stack

- **Frontend:**
  - **Framework:** Next.js 14+ (React 18)
  - **Language:** TypeScript
  - **Styling:** Tailwind CSS
  - **UI Components:** Shadcn/UI, Radix UI
  - **Icons:** Lucide React
  - **Forms:** React Hook Form, Zod
  - **Charts:** Recharts
- **Backend & Database:**
  - **Service:** Firebase
  - **Authentication:** Firebase Authentication
  - **Database:** Google Firestore (NoSQL)
- **Development Tools:**
  - **Linting:** ESLint
  - **Package Manager:** npm / pnpm / yarn

---

## 4. Getting Started

Follow these instructions to set up and run the project locally.

### 4.1. Prerequisites

- **Node.js:** v18.17.0 or later.
- **Package Manager:** npm, pnpm, or yarn.
- **Firebase Account:** A Google account to create a Firebase project.

### 4.2. Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SahrDauda/healthapp.git
    cd healthapp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # OR
    pnpm install
    # OR
    yarn install
    ```

### 4.3. Firebase Setup

This project requires a Firebase project to handle authentication and the database.

1.  **Create a Firebase Project:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Click **"Add project"** and follow the on-screen instructions.

2.  **Create a Web App:**
    - Inside your new project, click the Web icon (`</>`) to create a new web application.
    - Register the app, and Firebase will provide you with a `firebaseConfig` object. **Copy this object.**

3.  **Configure Environment Variables:**
    - In the root of your project directory, create a file named `.env.local`.
    - Paste the `firebaseConfig` values into this file, formatted as follows:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    ```

4.  **Update Firebase Initialization:**
    - Go to the `lib/firebase.js` file.
    - Replace the existing hardcoded configuration with the environment variables to securely load your project's credentials.

5.  **Enable Firebase Services:**
    - In the Firebase Console, navigate to the **Authentication** section and enable the **"Email/Password"** sign-in provider.
    - Navigate to the **Firestore Database** section and create a database. Start in **test mode** for initial development (this allows open read/write access).
      - **For production, you must secure your data.** Implement Firestore Security Rules to control access to your collections (e.g., `report`, `notifications`, `ancRecords`).

### 4.4. Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  **Open in browser:**
    - The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 5. API Reference & External Services

- **Primary API:** Google Firebase (Authentication & Firestore)
- This project does not consume any other third-party APIs.

---

## 6. License

This project is not currently licensed. Please add a license file if you wish to distribute or open-source this work.

---

## 7. Database Schema

The application uses Google Firestore for its database. Below is the schema for the main collections.

### `ancRecords`

This collection stores all data related to a patient's antenatal care visits. Each document typically represents a single patient.

```
ancRecords (collection)
└─ <document_id> (e.g., patient's unique ID)
   ├── clientNumber: string
   ├── visits: number (Count of completed visits)
   ├── updatedAt: timestamp
   │
   ├─ visit1 (map)
   │   ├─ basicInfo (map)
   │   │   ├─ clientNumber: string
   │   │   ├─ phoneNumber: string
   │   │   └─ clientName: string
   │   ├─ facilityInfo (map)
   │   │   ├─ name: string
   │   │   └─ facilityAddress: string
   │   ├─ pastPregnancyHistory (map)
   │   │   ├─ totalPregnancies: number
   │   │   ├─ liveBirths: number
   │   │   ├─ miscarriages: number
   │   │   ├─ abortions: number
   │   │   └─ previousPregnancies: array
   │   └─ presentPregnancy (map)
   │       ├─ gestationalAge: number
   │       ├─ dateOfANCContact: timestamp
   │       ├─ pp1_bp: string
   │       └─ pp15_weight: number
   │
   ├─ visit2 (map) - (same structure as visit1)
   └─ ... (up to visit8)

```

### `notifications`

This collection stores all broadcast messages sent or scheduled through the dashboard.

-   `createdAt` (timestamp): The time the notification was created.
-   `message` (string): The content of the notification message.
-   `scheduledAt` (timestamp | null): If scheduled, the time it's set to deliver.
-   `status` (string): The delivery status (e.g., "sent", "pending", "delivered").
-   `targetCategories` (array of strings): The patient groups targeted (e.g., ["all"], ["high_risk"]).
-   `title` (string): The title of the broadcast.
-   `type` (string): The type of notification (e.g., "broadcast").

### `report`

This collection stores all reports submitted by users through the whistleblower feature.

-   `clientName` (string): The name of the patient.
-   `clientNumber` (string): The unique identifier of the patient.
-   `createdAt` (timestamp): The time the report was submitted.
-   `description` (string): The detailed content of the report.
-   `facilityName` (string): The name of the facility being reported.
-   `fileUrls` (array of strings): URLs to any files attached to the report.
-   `isAnonymous` (boolean): Whether the report was submitted anonymously.
-   `phoneNumber` (string): The contact number of the reporter.
-   `reportType` (string): The category or type of the report (e.g., "Lab Technician").

## 6. License
This project is not currently licensed. Please add a license file if you wish to distribute or open-source this work.
