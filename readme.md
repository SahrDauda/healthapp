# 🌸 HealthyMother — Empowering Maternal Health with Technology

---

## 👩‍⚕️ About HealthyMother

**HealthyMother** is a modern, user-friendly dashboard for maternal health management. It empowers healthcare providers and clinicians to efficiently manage patient data, send notifications, review reports, and deliver health education—all in a beautiful, responsive web app.

This project is designed for easy local development and demo: **no backend, no Firebase, and no external dependencies**. All data is simulated locally, making it perfect for learning, prototyping, or showcasing UI/UX.

---

## ✨ Key Features

- **Role-Based Login**: Log in as App Admin or Clinician (local, no real authentication)
- **Insightful Dashboard**: View key metrics, trends, and upcoming due dates
- **Patient Management**: Browse, search, and view detailed patient records
- **Referral Tracking**: Manage and review patient referrals
- **Notifications**: Create, schedule, and manage notifications for patients
- **Health Education Hub**: Create and manage health tips, nutrition advice, and videos
- **Whistleblower Reports**: Review, filter, and respond to anonymous reports
- **Modern UI**: Responsive, mobile-friendly, and visually consistent
- **No Backend Required**: All data is local and simulated for demo purposes

---

## 🖼️ Screenshots

> _Add screenshots of the dashboard, patient detail, notifications, and reports pages here._

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/SahrDauda/healthapp.git
   cd healthapp
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**

   Visit [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure

```
healthapp/
  app/                # Next.js app directory (routes, layouts)
  components/         # Reusable React components
  hooks/              # Custom React hooks
  lib/                # Utility libraries (no backend)
  public/             # Static assets (images, logos)
  styles/             # Global styles (Tailwind CSS)
  ...
```

---

## 🧑‍💻 Usage Guide

### 1. **Login**
- Use the login page to sign in as either "App Admin" or "Clinician".
- The role is stored in your browser's localStorage.

### 2. **Navigation**
- The sidebar and navigation update based on your role.
- "App Admin" sees all features; "Clinician" sees a limited dashboard.

### 3. **Dashboard**
- View key metrics, charts, and upcoming due dates.

### 4. **Patients & Referrals**
- Browse patient and referral lists with summary cards and tables.
- Click a patient to view detailed medical records and visit history.

### 5. **Notifications**
- Create, edit, and schedule notifications for patients.
- All notifications are local and for demo only.

### 6. **Health Education**
- Manage health tips, nutrition advice, and (soon) videos.
- Create, edit, and send tips to simulated patients.

### 7. **Reports**
- Review, filter, and respond to anonymous whistleblower reports.
- Mark reports as read/unread and send replies (simulated).

---

## 🛠️ Built With

- **Next.js 14+** (React 18)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/UI** & **Radix UI** (components)
- **Lucide React** (icons)
- **Recharts** (charts)

---

## 🤝 Contributing

We welcome contributions! To get started:

1. **Fork the repository**
2. **Create a new branch** for your feature or fix
3. **Commit your changes** with clear messages
4. **Push to your fork** and open a Pull Request

**Guidelines:**
- Keep code clean and well-commented
- Use consistent formatting (Prettier, ESLint)
- Test your changes locally before submitting
- For UI changes, add screenshots if possible

---

## ❓ FAQ

**Q: Is this app production-ready?**
- No. This is a demo/prototype with all data stored locally. No real authentication or backend.

**Q: Can I use this as a starter for my own project?**
- Yes! Replace the local data with your own backend or API as needed.

**Q: How do I reset the app data?**
- Clear your browser's localStorage and refresh the page.

---

## 📄 License

This project is currently **not licensed**. If you plan to share, open-source, or build upon this project, please add an appropriate license file.

---

## 🙏 Acknowledgements

- Inspired by real-world maternal health needs
- Built with love by the HealthyMother team

---

## 📬 Contact

For questions, feedback, or collaboration, please open an issue or contact the project maintainers. 