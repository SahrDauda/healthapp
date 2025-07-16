import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText } from "lucide-react";

export function ClinicianDashboard() {
  // Dummy data for demonstration
  const totalPatients = 30;
  const totalReferrals = 5;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Clinician Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Key metrics and insights for clinicians
        </p>
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground-white" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalPatients}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Referrals</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground-white" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalReferrals}</div>
          </CardContent>
        </Card>
      </div>
      {/* Add more clinician-specific widgets here */}
    </div>
  );
} 