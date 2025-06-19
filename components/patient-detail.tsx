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
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface PatientDetailProps {
  patientId: string
  onBack: () => void
}

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
          // Get all fields from the basic information field (could be data.basicInfo or similar)
          // Adjust the path if needed based on your Firestore structure
          const basicInfo = data.basicInfo || data.visit1?.basicInfo || null;
          if (basicInfo) {
            setPatient(basicInfo);
          } else {
            setError("Basic information not found in document.");
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
      <h1>{patient.clientName || patient.name}</h1>
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

