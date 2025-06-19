"use client"

import React, { useState, useEffect } from "react";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface PatientDetailProps {
  patientId: string;
  onBack: () => void;
}

export function PatientDetail({ patientId, onBack }: PatientDetailProps) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo data for tabs (replace with real data as needed)
  const medicalHistory = [
    "No chronic conditions",
    "Previous pregnancy: 2021 (Normal delivery)",
    "No known allergies",
  ];
  const medications = [
    "Prenatal vitamins",
    "Folic acid 400mcg",
    "Iron supplement 65mg",
  ];
  const labResults = [
    { label: "Hemoglobin", value: "12.5 g/dL" },
    { label: "Glucose", value: "95 mg/dL" },
    { label: "Protein", value: "Negative" },
  ];
  const appointments = [
    { date: "2024-02-01", type: "Prenatal Check-up" },
    { date: "2024-03-01", type: "Ultrasound" },
  ];

  useEffect(() => {
    async function fetchPatient() {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "ancRecords", patientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const basicInfo = data.basicInfo || data.visit1?.basicInfo || null;
          const presentPregnancy = data.visit1?.presentPregnancy || {};
          const vitals = data.visit1?.vitals || {};
          setPatient({ ...basicInfo, ...presentPregnancy, ...vitals });
        } else {
          setError("No such patient document.");
        }
      } catch (err) {
        setError("Failed to fetch patient data.");
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [patientId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading patient data...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-600">Error: {error}</div>;
  }
  if (!patient) {
    return <div className="flex justify-center items-center h-64">Patient not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-0 sm:p-6">
      <div className="max-w-7xl mx-auto pt-4">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold leading-tight">{patient.clientName || patient.name}</h1>
            <div className="text-muted-foreground text-lg">Patient Medical Record</div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Card */}
          <Card className="w-full max-w-md mx-auto lg:mx-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-2 mb-4">
                <Avatar className="h-20 w-20 mb-2">
                  <AvatarImage src="/placeholder-user.jpg" alt={patient.clientName || patient.name} />
                  <AvatarFallback>
                    {(patient.clientName || patient.name || "?")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xl font-semibold text-center">{patient.clientName || patient.name}</div>
                <div className="text-gray-600 text-center">Age: {patient.age || "-"}</div>
                <div className="flex gap-2 mt-2">
                  {patient.status && <Badge variant="default">{patient.status}</Badge>}
                  {patient.riskLevel && <Badge variant="secondary">{patient.riskLevel} Risk</Badge>}
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span>{patient.phoneNumber || patient.phone || <span className="text-muted-foreground">N/A</span>}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span>{patient.email || <span className="text-muted-foreground">N/A</span>}</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="mb-4">
                <div className="font-semibold mb-1">Pregnancy Status</div>
                <div>Weeks: <span className="font-medium">{patient.gestationalAge || patient.pregnancyWeeks || "-"}</span></div>
                <div>Trimester: <span className="font-medium">{patient.trimester || "-"}</span></div>
                <div>Due Date: <span className="font-medium">{patient.dueDate ? new Date(patient.dueDate).toLocaleDateString() : "-"}</span></div>
              </div>
              <Separator className="my-4" />
              <div>
                <div className="font-semibold mb-1">Vital Information</div>
                <div>Blood Type: <span className="font-medium">{patient.bloodGroup || patient.bloodType || "-"}</span></div>
                <div>Height: <span className="font-medium">{patient.height || "-"}</span></div>
                <div>Current Weight: <span className="font-medium">{patient.currentWeight || patient.weight || "-"}</span></div>
              </div>
            </CardContent>
          </Card>
          {/* Right Tabs */}
          <div className="flex-1">
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-4">
                <TabsTrigger value="history">Medical History</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="labs">Lab Results</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
              </TabsList>
              <TabsContent value="history">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-xl">🗎 Medical History</span>
                    </div>
                    <ul className="list-disc pl-6 space-y-1">
                      {medicalHistory.map((item, idx) => (
                        <li key={idx} className="text-base text-gray-800">{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="medications">
                <Card>
                  <CardContent className="p-6">
                    <div className="font-bold text-xl mb-2">💊 Medications</div>
                    <ul className="list-disc pl-6 space-y-1">
                      {medications.map((item, idx) => (
                        <li key={idx} className="text-base text-gray-800">{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="labs">
                <Card>
                  <CardContent className="p-6">
                    <div className="font-bold text-xl mb-2">🧪 Lab Results</div>
                    <ul className="list-disc pl-6 space-y-1">
                      {labResults.map((item, idx) => (
                        <li key={idx} className="text-base text-gray-800">{item.label}: {item.value}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="appointments">
                <Card>
                  <CardContent className="p-6">
                    <div className="font-bold text-xl mb-2">📅 Appointments</div>
                    <ul className="list-disc pl-6 space-y-1">
                      {appointments.map((item, idx) => (
                        <li key={idx} className="text-base text-gray-800">{item.date}: {item.type}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

