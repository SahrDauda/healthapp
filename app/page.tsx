"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { PatientProfiles } from "../components/patient-profiles"
import { AppointmentCalendar } from "../components/appointment-calendar"
import { AppointmentRequests } from "../components/appointment-requests"
import { PatientDetail } from "../components/patient-detail"
import { DashboardOverview } from "../components/dashboard-overview"
import { AppointmentAnalytics } from "../components/appointment-analytics"
import { Notifications } from "../components/notifications"
import { MedicalRecords } from "../components/medical-records"
import { TrimesterDashboards } from "../components/trimester-dashboards"
import SharedLayout from "../components/shared-layout"

export default function Dashboard() {
  const searchParams = useSearchParams()
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [filteredPatientCount, setFilteredPatientCount] = useState(0)

  // Update active view based on URL parameters
  useEffect(() => {
    const view = searchParams.get('view') || 'dashboard'
    setActiveView(view)
  }, [searchParams])

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setSelectedPatient(null)
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
      default:
        return <DashboardOverview />
    }
  }

  return (
    <SharedLayout activeView={activeView} patientCount={filteredPatientCount}>
      {renderContent()}
    </SharedLayout>
  )
}
