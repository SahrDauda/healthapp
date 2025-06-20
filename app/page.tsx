"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, signOut } from "firebase/auth"
import { useAuth } from "../hooks/use-auth"
import { SidebarProvider } from "../components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar"
import { MobileNavigation } from "../components/mobile-navigation"
import { DashboardHeader } from "../components/dashboard-header"
import LoginPage from "../components/login-page"
import { PatientProfiles } from "../components/patient-profiles"
import { AppointmentCalendar } from "../components/appointment-calendar"
import { AppointmentRequests } from "../components/appointment-requests"
import { PatientDetail } from "../components/patient-detail"
import { DashboardOverview } from "../components/dashboard-overview"
import { AppointmentAnalytics } from "../components/appointment-analytics"
import { Notifications } from "../components/notifications"
import { MedicalRecords } from "../components/medical-records"
import { useIsMobile } from "../hooks/use-mobile"
import { TrimesterDashboards } from "../components/trimester-dashboards"
import Report from "../components/report"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()
  const [filteredPatientCount, setFilteredPatientCount] = useState(0)

  const handleLogout = () => {
    const auth = getAuth()
    signOut(auth).then(() => {
      router.push("/")
    }).catch((error) => {
      console.error("Logout error:", error)
    });
  }

  const handleViewChange = (view: string) => {
    if (view === "report") {
      router.push("/report");
    } else {
      setActiveView(view);
    }
    setSelectedPatient(null)
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  const renderContent = () => {
    if (selectedPatient) {
      return <PatientDetail patientId={selectedPatient} onBack={() => setSelectedPatient(null)} />
    }

    switch (activeView) {
      case "dashboard":
        return <DashboardOverview />
      case "patients":
        return <PatientProfiles onSelectPatient={setSelectedPatient} setFilteredPatientCount={setFilteredPatientCount} />
      case "trimester-views":
        return <TrimesterDashboards onSelectPatient={setSelectedPatient} />
      case "calendar":
        return <AppointmentCalendar />
      case "requests":
        return <AppointmentRequests />
      case "analytics":
        return <AppointmentAnalytics />
      case "notifications":
        return <Notifications />
      case "records":
        return <MedicalRecords />
      case "report":
        return <Report />
      default:
        return <DashboardOverview />
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maternal-green-50 to-maternal-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maternal-green-600"></div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLoginSuccess={() => router.refresh()} />
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-maternal-green-50 to-maternal-blue-50">
        <DashboardHeader
          onLogout={handleLogout}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobile={true}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <MobileNavigation
          isOpen={isMobileMenuOpen}
          activeView={activeView}
          onViewChange={handleViewChange}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="p-4 pt-20">{renderContent()}</main>
      </div>
    )
  }

  // Desktop Layout
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeView={activeView} onViewChange={handleViewChange} patientCount={filteredPatientCount} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader onLogout={handleLogout} isMobile={false} />
          <main className="flex-1 p-6 bg-gradient-to-br from-maternal-green-50 to-maternal-blue-50 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
