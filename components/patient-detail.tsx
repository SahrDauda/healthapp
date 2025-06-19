"use client"

import React, { useState, useEffect } from "react";
import { ArrowLeft, Phone, Mail, Calendar, Pill, FileText, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

import { getFirestore, collection, getDocs } from "firebase/firestore";

interface PatientDetailProps {
  patientId: string
  onBack: () => void
}

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Remove the hardcoded patientData object

export function PatientDetail({ patientId, onBack }: { patientId: string; onBack: () => void }) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatient() {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "ancRecords", patientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Assuming the patient data is nested under visit1.basicInfo as per Firestore structure
          const patientData = data.visit1?.basicInfo || null;
          if (patientData) {
            setPatient(patientData);
          } else {
            setError("Patient data not found in document.");
          }
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
    return <div>Loading patient data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  // Render patient details here using the patient state
  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h1>{patient.clientName}</h1>
      <p>Age: {patient.age}</p>
      <p>Address: {patient.address}</p>
      <p>Blood Group: {patient.bloodGroup}</p>
      <p>Client Number: {patient.clientNumber}</p>
      <p>NIN: {patient.nin}</p>
      <p>Phone Number: {patient.phoneNumber}</p>
      <p>Responsible Person: {patient.responsiblePerson}</p>
    </div>
  );
}


const fetchPatientData = async () => {
  const db = getFirestore();
  const ancRecordRef = collection(db, "ancRecord");
  const querySnapshot = await getDocs(ancRecordRef);
  const patients = querySnapshot.docs.map(doc => doc.data());
  return patients;
};

export function PatientDetail({ patientId, onBack }: PatientDetailProps) {
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    const loadPatientData = async () => {
      const data = await fetchPatientData();
      const patient = data.find(p => p.clientNumber === patientId);
      setPatientData(patient);
    };
    loadPatientData();
  }, [patientId]);

  if (!patientData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{patientData.clientName}</h1>
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
                    {patientData.clientName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{patientData.clientName}</CardTitle>
                  <p className="text-muted-foreground">Age: {patientData.age}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="default">Active</Badge>
                    <Badge variant="outline">Low Risk</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patientData.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patientData.address}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Vital Information</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Blood Type:</span> {patientData.bloodGroup}
                  </p>
                  <p>
                    <span className="font-medium">NIN:</span> {patientData.nin}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

