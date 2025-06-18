"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNavigation } from "@/components/mobile-navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import LoginPage from "@/components/login-page"
import { PatientProfiles } from "@/components/patient-profiles"
import { AppointmentCalendar } from "@/components/appointment-calendar"
import { AppointmentRequests } from "@/components/appointment-requests"
import { PatientDetail } from "@/components/patient-detail"
import { DashboardOverview } from "@/components/dashboard-overview"
import { AppointmentAnalytics } from "@/components/appointment-analytics"
import { Notifications } from "@/components/notifications"
import { MedicalRecords } from "@/components/medical-records"
import { useIsMobile } from "@/hooks/use-mobile"
import { TrimesterDashboards } from "@/components/trimester-dashboards"

interface User {
  email: string
  name: string
  rememberMe: boolean
}

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  // Check for remembered login on component mount
  useEffect(() => {
    const checkRememberedLogin = () => {
      const rememberedUser = localStorage.getItem("maternalcare_user")
      if (rememberedUser) {
        try {
          const userData = JSON.parse(rememberedUser)
          const loginTime = localStorage.getItem("maternalcare_login_time")

          if (loginTime) {
            const timeDiff = Date.now() - Number.parseInt(loginTime)
            const thirtyDays = 30 * 24 * 60 * 60 * 1000

            if (timeDiff < thirtyDays && userData.rememberMe) {
              setUser(userData)
              setIsAuthenticated(true)
            } else {
              // Clear expired session
              localStorage.removeItem("maternalcare_user")
              localStorage.removeItem("maternalcare_login_time")
            }
          }
        } catch (error) {
          console.error("Error parsing remembered user:", error)
          localStorage.removeItem("maternalcare_user")
          localStorage.removeItem("maternalcare_login_time")
        }
      }
      setIsLoading(false)
    }

    checkRememberedLogin()
  }, [])

  const handleLogin = (credentials: { email: string; password: string; rememberMe: boolean }) => {
    const userData: User = {
      email: credentials.email,
      name: "Dr. Sarah Johnson",
      rememberMe: credentials.rememberMe,
    }

    setUser(userData)
    setIsAuthenticated(true)

    // Store user data if remember me is checked
    if (credentials.rememberMe) {
      localStorage.setItem("maternalcare_user", JSON.stringify(userData))
      localStorage.setItem("maternalcare_login_time", Date.now().toString())
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setActiveView("dashboard")
    setSelectedPatient(null)

    // Clear stored user data
    localStorage.removeItem("maternalcare_user")
    localStorage.removeItem("maternalcare_login_time")
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
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
        return <PatientProfiles onSelectPatient={setSelectedPatient} />
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
      default:
        return <DashboardOverview />
    }
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maternal-green-50 to-maternal-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maternal-green-600"></div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
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
        <AppSidebar activeView={activeView} onViewChange={handleViewChange} />
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
