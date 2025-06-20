"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, Mail, Calendar, Pill, FileText, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"

interface PatientDetailProps {
  patientId: string
  onBack: () => void
}

// Move these to the top, before PatientDetail is defined
const contactTrimesterMap: Record<number, string> = {
  1: "1st trimester",
  2: "2nd trimester",
  3: "2nd trimester",
  4: "2nd trimester",
  5: "3rd trimester",
  6: "3rd trimester",
  7: "3rd trimester",
  8: "3rd trimester",
};

function getTrimesterForContact(contactNum: number) {
  return contactTrimesterMap[contactNum] || "-";
}

export function PatientDetail({ patientId, onBack }: PatientDetailProps) {
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPatient() {
      setLoading(true)
      setError(null)
      try {
        const docRef = doc(db, "ancRecords", patientId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setPatient(data)
        } else {
          setError("No such patient document.")
        }
      } catch (err) {
        setError("Failed to fetch patient data.")
      } finally {
        setLoading(false)
      }
    }
    fetchPatient()
  }, [patientId])

  if (loading) {
    return <div>Loading patient data...</div>
  }
  if (error) {
    return <div>Error: {error}</div>
  }
  if (!patient) {
    return <div>Patient not found</div>
  }

  // Extract and normalize patient fields for display
  const visit1 = patient.visit1 || {}
  const basicInfo = visit1.basicInfo || {}
  const presentPregnancy = visit1.presentPregnancy || {}
  const vitals = visit1.vitals || {}
  const name = basicInfo.clientName || basicInfo.name || "-"
  const age = basicInfo.age || "-"
  const phone = basicInfo.phoneNumber || basicInfo.phone || "-"
  const email = basicInfo.email || "-"
  const address = basicInfo.address || "-"
  const emergencyContact = basicInfo.emergencyContact || "-"
  const pregnancyWeeks = presentPregnancy.gestationalAge || "-"
  const contactNum = presentPregnancy.contactNum || 1
  const calculatedTrimester = getTrimesterForContact(Number(contactNum))
  const trimester = calculatedTrimester || "-"
  const dueDate = presentPregnancy.dueDate ? new Date(presentPregnancy.dueDate).toLocaleDateString() : "-"
  const status = basicInfo.status || "Active"
  const riskLevel = basicInfo.riskLevel || "Low"
  const bloodType = basicInfo.bloodType || "-"
  const height = vitals.height || "-"
  const currentWeight = vitals.weight || "-"
  const medicalHistory = basicInfo.medicalHistory || []
  const currentMedications = basicInfo.currentMedications || []
  const labResults = basicInfo.labResults || []
  const appointments = basicInfo.appointments || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
          <h1 className="text-3xl font-bold">{name}</h1>
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
                    {name.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{name}</CardTitle>
                  <p className="text-muted-foreground">Age: {age}</p>
                <div className="flex gap-2 mt-2">
                    <Badge variant="default">{status}</Badge>
                    <Badge variant="outline">{riskLevel} Risk</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{email}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Pregnancy Status</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Weeks:</span> {pregnancyWeeks}
                  </p>
                  <p>
                    <span className="font-medium">Trimester:</span> {calculatedTrimester}
                  </p>
                  <p>
                    <span className="font-medium">Due Date:</span> {dueDate}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Vital Information</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Blood Type:</span> {bloodType}
                  </p>
                  <p>
                    <span className="font-medium">Height:</span> {height}
                  </p>
                  <p>
                    <span className="font-medium">Current Weight:</span> {currentWeight}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="medical" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="medical">Medical History</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
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
                    {medicalHistory.length > 0 ? medicalHistory.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    )) : <li>No medical history available.</li>}
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
                    {currentMedications.length > 0 ? currentMedications.map((medication: string, index: number) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>{medication}</span>
                        <Badge variant="outline">Active</Badge>
                      </li>
                    )) : <li>No medications listed.</li>}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
  )
}
