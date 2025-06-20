"use client";
import { useState, useMemo, useEffect } from "react";
import ReportList from "@/components/report";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import LoginPage from "@/components/login-page";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { getAuth, signOut } from "firebase/auth";

export default function ReportPage() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState("report");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      router.push("/");
    }).catch((error) => {
      console.error("Logout error:", error);
    });
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (isMobile) setIsMobileMenuOpen(false);
    if (view === "report") {
      router.push("/report");
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maternal-green-50 to-maternal-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maternal-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => router.push("/")} />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeView={activeView} onViewChange={handleViewChange} patientCount={0} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader
            isMobile={false}
            onLogout={handleLogout}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
          />
          <main className="flex-1 p-6 bg-gradient-to-br from-maternal-green-50 to-maternal-blue-50 overflow-auto">
            {activeView === "report" && <ReportList />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 