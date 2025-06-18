"use client"

import { ArrowLeft, Phone, Mail, Calendar, Pill, FileText, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface PatientDetailProps {
  patientId: string
  onBack: () => void
}

const patientData = {
  "1": {
    name: "Emma Thompson",
    age: 28,
    phone: "(555) 123-4567",
    email: "emma.thompson@email.com",
    address: "123 Oak Street, Springfield, IL 62701",
    emergencyContact: "John Thompson (Husband) - (555) 123-4568",
    pregnancyWeeks: 24,
    trimester: "2nd",
    dueDate: "2024-08-15",
    status: "Active",
    riskLevel: "Low",
    bloodType: "O+",
    height: "5'6\"",
    prePregnancyWeight: "140 lbs",
    currentWeight: "158 lbs",
    medicalHistory: ["No chronic conditions", "Previous pregnancy: 2021 (Normal delivery)", "No known allergies"],
    currentMedications: ["Prenatal vitamins (daily)", "Folic acid 400mcg (daily)", "Iron supplement 65mg (daily)"],
    labResults: [
      { test: "Hemoglobin", value: "12.5 g/dL", date: "2024-01-15", status: "Normal" },
      { test: "Glucose", value: "95 mg/dL", date: "2024-01-15", status: "Normal" },
      { test: "Blood Pressure", value: "118/76 mmHg", date: "2024-01-15", status: "Normal" },
      { test: "Protein in Urine", value: "Negative", date: "2024-01-15", status: "Normal" },
    ],
    appointments: [
      { date: "2024-02-01", time: "10:00 AM", type: "Prenatal Check-up", status: "Scheduled" },
      { date: "2024-01-15", time: "2:00 PM", type: "Prenatal Check-up", status: "Completed" },
      { date: "2023-12-18", time: "11:00 AM", type: "Ultrasound", status: "Completed" },
    ],
  },
}

export function PatientDetail({ patientId, onBack }: PatientDetailProps) {
  const patient = patientData[patientId as keyof typeof patientData]

  if (!patient) {
    return <div>Patient not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">Patient Medical Record</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/placeholder.svg?height=64&width=64`} />
                  <AvatarFallback className="text-lg">
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{patient.name}</CardTitle>
                  <p className="text-muted-foreground">Age: {patient.age}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="default">{patient.status}</Badge>
                    <Badge variant="outline">{patient.riskLevel} Risk</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.email}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Pregnancy Status</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Weeks:</span> {patient.pregnancyWeeks}
                  </p>
                  <p>
                    <span className="font-medium">Trimester:</span> {patient.trimester}
                  </p>
                  <p>
                    <span className="font-medium">Due Date:</span> {new Date(patient.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Vital Information</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Blood Type:</span> {patient.bloodType}
                  </p>
                  <p>
                    <span className="font-medium">Height:</span> {patient.height}
                  </p>
                  <p>
                    <span className="font-medium">Current Weight:</span> {patient.currentWeight}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="medical" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="labs">Lab Results</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {patient.medicalHistory.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {patient.currentMedications.map((medication, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>{medication}</span>
                        <Badge variant="outline">Active</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="labs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Recent Lab Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patient.labResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{result.test}</p>
                          <p className="text-sm text-muted-foreground">{result.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{result.value}</p>
                          <Badge variant={result.status === "Normal" ? "outline" : "destructive"}>
                            {result.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patient.appointments.map((appointment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date} at {appointment.time}
                          </p>
                        </div>
                        <Badge variant={appointment.status === "Completed" ? "outline" : "default"}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
