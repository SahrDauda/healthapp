"use client"

import { Bell, Settings, LogOut, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  onLogout: () => void
  onMenuToggle?: () => void
  isMobile: boolean
  isMobileMenuOpen?: boolean
}

export function DashboardHeader({ onLogout, onMenuToggle, isMobile, isMobileMenuOpen = false }: DashboardHeaderProps) {
  const { user } = useAuth();
  const isMobileMenu = useIsMobile();
  return (    
    <header className="sticky top-0 z-50 w-full border-b border-green-300 bg-gradient-to-r from-green-200 to-green-300 backdrop-blur supports-[backdrop-filter]:bg-green-200/90">
      <div className="flex h-16 items-center justify-between px-4 gap-4">
        {/* Mobile Hamburger Menu Toggle */}
        {isMobileMenu ? ( 
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="relative z-50 text-green-800 hover:bg-green-300 hover:text-green-900"
            aria-label="Toggle navigation menu"
          >
            <div className="flex flex-col justify-center items-center w-5 h-5">
              <span
                className={`block h-0.5 w-5 bg-current transition-all duration-300 ease-out ${
                  isMobileMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-current transition-all duration-300 ease-out ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-current transition-all duration-300 ease-out ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
                }`}
              />
            </div>
          </Button>
        ) : (
          <SidebarTrigger className="text-green-800 hover:bg-green-300 hover:text-green-900" />
        )}

        {/* Logo/Title for Mobile */}
        {isMobile && (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-700">
              <span className="text-green-800 text-xs font-bold">H</span>
            </div>
            <h1 className="text-lg font-semibold text-green-800">HealthyMother</h1>
          </div>
        )}

        {/* Desktop Search - Hidden on Mobile */}
        {!isMobile && (
          <div className="flex-1 max-w-md">
            <div className="relative">{/* Search functionality can be added here */}</div>
          </div>
        )}

        {/* Date and Time - Hidden on Mobile */}
        {!isMobile && (
          <div className="hidden md:flex flex-col items-end text-sm text-green-600">
            {/* Date/time display can be added here */}
          </div>
        )}

        {/* Right-aligned items container */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-green-800 hover:bg-green-300 hover:text-green-900"
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-600 text-green-800 border-green-700">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 sm:px-3 text-green-800 hover:bg-green-300 hover:text-green-900"
              >
                <Avatar className="h-8 w-8 ring-2 ring-green-500">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-gradient-to-br from-maternal-brown-400 to-maternal-brown-500 text-green-800">
                    SJ
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-green-800">{user?.displayName || "Dr. Sarah Johnson"}</span>
                    <span className="text-xs text-green-600">{user?.email || "doctor@maternalcare.com"}</span>
                    <span className="text-xs text-green-600">Maternal Health Specialist</span>
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-green-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-green-300">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-green-800">Dr. Sarah Johnson</p>
                  <p className="text-xs text-green-600">doctor@maternalcare.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-green-200" />
              <DropdownMenuItem className="text-green-700 hover:bg-green-50">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-green-700 hover:bg-green-50">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-green-200" />
              <DropdownMenuItem onClick={onLogout} className="text-red-600 hover:bg-red-50 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

const { user } = useAuth();
