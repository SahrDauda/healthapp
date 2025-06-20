"use client"

import { Calendar, Users, Clock, FileText, Settings, Bell, Heart, BarChart3, TrendingUp, AlertTriangle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  patientCount: number
}

export function AppSidebar({ activeView, onViewChange, patientCount }: AppSidebarProps) {
  const [notificationCount, setNotificationCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "notifications"));
        setNotificationCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching notification count:", error);
        setNotificationCount(0);
      }
    };

    fetchNotificationCount();
  }, []);

  const menuItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      id: "dashboard",
    },
    {
      title: "Patients",
      icon: Users,
      id: "patients",
      badge: patientCount.toString(),
    },
    {
      title: "Trimester Views",
      icon: Calendar,
      id: "trimester-views",
    },
    {
      title: "Calendar",
      icon: Calendar,
      id: "calendar",
    },
    {
      title: "Appointment Requests",
      icon: Clock,
      id: "requests",
      badge: "3",
    },
    {
      title: "Analytics",
      icon: TrendingUp,
      id: "analytics",
    },
    {
      title: "Notifications",
      icon: Bell,
      id: "notifications",
      badge: notificationCount !== null ? notificationCount.toString() : undefined,
    },
    {
      title: "Report",
      icon: AlertTriangle,
      id: "report",
      badge: undefined,
    },
    {
      title: "Medical Records",
      icon: FileText,
      id: "records",
    },
  ]

  return (
    <Sidebar className="">
      <SidebarHeader className="p-4 bg-gradient-to-b from-maternal-white-200 to-maternal-white-300">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-maternal-green-500 to-maternal-green-600 shadow-sm">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-maternal-green-800">HealthyMother</h2>
            <p className="text-xs text-maternal-green-600">Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-white-100 to-white-200">
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-800 font-medium">Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    className={`w-full justify-start transition-all duration-200 ${
                      activeView === item.id
                        ? "bg-gradient-to-r from-green-800 to-green-900 text-white shadow-lg hover:from-green-900 hover:to-green-800"
                        : "text-green-700 hover:bg-green-300 hover:text-green-900"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge !== undefined && (
                      <Badge
                        variant="secondary"
                        className={`ml-auto ${
                          activeView === item.id
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-green-600 text-white border-green-700"
                        }`}
                      >
                        {item.badge === "..." ? "..." : item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-gradient-to-t from-white-200 to-white-100 border-t border-white-300">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-green-700 hover:bg-green-300 hover:text-green-900 transition-colors">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
