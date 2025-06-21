"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, Mail, Calendar, Pill, FileText, Heart, X, AlertTriangle } from "lucide-react"
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
  const [selectedVisit, setSelectedVisit] = useState<any>(null)
  const [showVisitModal, setShowVisitModal] = useState(false)

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
  
  // Basic patient info
  const name = basicInfo.clientName || "-"
  const age = basicInfo.age || "-"
  const phone = basicInfo.phoneNumber || "-"
  const email = basicInfo.email || "-"
  const address = basicInfo.address || "-"
  const emergencyContact = basicInfo.emergencyContact || "-"
  
  // Pregnancy and visit information
  // Count actual visit objects instead of using the visits field
  const countActualVisits = () => {
    let count = 0;
    // Only count ANC visits 1-8, exclude delivery visit
    for (let i = 1; i <= 8; i++) {
      if (patient[`visit${i}`] && Object.keys(patient[`visit${i}`]).length > 0) {
        count++;
      }
    }
    return count;
  };
  
  const totalVisits = countActualVisits();
  const firstVisitGestationalAge = presentPregnancy.gestationalAge || 0
  const firstVisitDate = presentPregnancy.dateOfAncContact ? new Date(presentPregnancy.dateOfAncContact.seconds * 1000) : null
  
  // Calculate current gestational age based on first visit
  let currentGestationalAge = firstVisitGestationalAge
  if (firstVisitDate) {
    const today = new Date()
    const weeksSinceFirstVisit = Math.floor((today.getTime() - firstVisitDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
    currentGestationalAge = firstVisitGestationalAge + weeksSinceFirstVisit
  }
  
  // Calculate due date (40 weeks from conception, which is 38 weeks from first ANC visit)
  let dueDate = null
  if (firstVisitDate && firstVisitGestationalAge) {
    const conceptionDate = new Date(firstVisitDate)
    conceptionDate.setDate(conceptionDate.getDate() - (firstVisitGestationalAge * 7))
    const dueDateObj = new Date(conceptionDate)
    dueDateObj.setDate(dueDateObj.getDate() + (40 * 7))
    dueDate = dueDateObj
  }
  
  const dueDateString = dueDate ? dueDate.toLocaleDateString() : "-"
  
  // Status and other info
  const hasDelivered = patient.visitdelivery && Object.keys(patient.visitdelivery).length > 0;
  const dueMonthString = hasDelivered ? "Delivered" : (dueDate ? dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Not set")
  
  // Calculate trimester based on current gestational age
  const getTrimester = (weeks: number) => {
    if (weeks <= 12) return "1st trimester"
    if (weeks <= 27) return "2nd trimester"
    return "3rd trimester"
  }
  
  const calculatedTrimester = getTrimester(currentGestationalAge)
  
  // Get initials from first and last name
  const getInitials = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }
    return "?";
  };
  
  const status = hasDelivered ? "Delivered" : "Active"; // Check if patient has delivered
  const riskLevel = "Low" // Default risk level
  const bloodType = presentPregnancy.bloodGroup ? `${presentPregnancy.bloodGroup}${presentPregnancy.rhesusFactor || ''}` : "-"
  const height = presentPregnancy.height || "-"
  const currentWeight = presentPregnancy.weight || "-"
  
  // Medical history from past pregnancy history
  const pastPregnancyHistory = visit1.pastPregnancyHistory || {}
  const medicalHistory = pastPregnancyHistory.complications || []
  const currentMedications = [] // Not in the structure, empty array
  const labResults = [] // Not in the structure, empty array
  const appointments = [] // Not in the structure, empty array

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
              <p className="text-gray-600">Patient Medical Record</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={status === "Delivered" ? "secondary" : status === "Active" ? "default" : "secondary"} className="text-sm">
              {status}
            </Badge>
            <Badge variant={riskLevel === "High" ? "destructive" : riskLevel === "Medium" ? "default" : "secondary"} className="text-sm">
              {riskLevel} Risk
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Patient Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={`/placeholder.svg?height=96&width=96`} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <CardTitle className="text-xl">{name}</CardTitle>
                    <p className="text-muted-foreground">Age: {age} years</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Emergency: {emergencyContact}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pregnancy Status */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Pregnancy Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weeks:</span>
                      <span className="font-medium">{currentGestationalAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trimester:</span>
                      <span className="font-medium">{calculatedTrimester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">{dueDateString}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Vital Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Vital Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blood Type:</span>
                      <span className="font-medium">{bloodType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Height:</span>
                      <span className="font-medium">{height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="font-medium">{currentWeight}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Address</h4>
                  <p className="text-sm text-muted-foreground">{address}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="medical">Medical History</TabsTrigger>
                <TabsTrigger value="visits">Visit History</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Pregnancy Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{currentGestationalAge}</div>
                        <div className="text-sm text-blue-600 font-medium">Weeks</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">{calculatedTrimester}</div>
                        <div className="text-sm text-green-600 font-medium">Trimester</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">{totalVisits}</div>
                        <div className="text-sm text-purple-600 font-medium">Visits Completed</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {dueMonthString}
                        </div>
                        <div className="text-sm text-orange-600 font-medium">Expected Due Month</div>
                      </div>
                    </div>
                    
                    {/* Pregnancy Progress */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3 text-gray-800">Pregnancy Progress</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Gestational Progress</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {(() => {
                              if (currentGestationalAge && currentGestationalAge !== "-") {
                                const weeks = parseInt(currentGestationalAge);
                                const months = Math.floor(weeks / 4.33);
                                const remainingWeeks = 40 - weeks;
                                const remainingMonths = Math.ceil(remainingWeeks / 4.33);
                                return `${months} months completed, ${remainingMonths} months remaining`;
                              }
                              return "Progress not available";
                            })()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(() => {
                                if (currentGestationalAge && currentGestationalAge !== "-") {
                                  const weeks = parseInt(currentGestationalAge);
                                  return Math.min((weeks / 40) * 100, 100);
                                }
                                return 0;
                              })()}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0 weeks</span>
                          <span>40 weeks</span>
                        </div>
                      </div>
                    </div>

                    {/* Visit Schedule */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3 text-gray-800">ANC Visit Schedule</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Completed Visits</span>
                            <span className="text-sm font-semibold text-green-600">{totalVisits}/8</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(totalVisits / 8) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Remaining Visits</span>
                            <span className="text-sm font-semibold text-blue-600">{8 - totalVisits}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((8 - totalVisits) / 8) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Dates */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3 text-gray-800">Key Dates</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                          <span className="text-sm font-medium text-gray-600">Expected Due Date</span>
                          <span className="text-sm font-semibold text-orange-600">{dueDateString}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                          <span className="text-sm font-medium text-gray-600">First Visit Week</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {(() => {
                              const firstVisit = patient.visit1;
                              if (firstVisit?.presentPregnancy?.gestationalAge) {
                                return `${firstVisit.presentPregnancy.gestationalAge} weeks`;
                              }
                              return "Not recorded";
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                          <span className="text-sm font-medium text-gray-600">9-Month Mark</span>
                          <span className="text-sm font-semibold text-purple-600">
                            {(() => {
                              if (dueDate) {
                                const nineMonthDate = new Date(dueDate);
                                nineMonthDate.setMonth(dueDate.getMonth() - 1);
                                return nineMonthDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                              }
                              return "Not calculated";
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                          <span className="text-sm font-medium text-gray-600">Current Status</span>
                          <Badge variant={status === "Active" ? "default" : "secondary"} className="text-xs">
                            {status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medical History Tab */}
              <TabsContent value="medical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Medical History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {medicalHistory.length > 0 ? (
                      <div className="grid gap-4">
                        {medicalHistory.map((item: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No medical history available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Visit History Tab */}
              <TabsContent value="visits" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Visit History
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        ANC Contact Schedule - {totalVisits}/8 visits completed
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{8 - totalVisits}</div>
                          <div className="text-xs text-muted-foreground">Remaining</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">{dueDateString}</div>
                          <div className="text-xs text-muted-foreground">Expected Due Date</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((visitNum) => {
                        const visit = patient[`visit${visitNum}`];
                        const hasFlag = visit?.flags || visit?.riskFactors || visit?.complications || visit?.abnormalities;
                        const visitDate = visit?.presentPregnancy?.dateOfAncContact ? 
                          new Date(visit.presentPregnancy.dateOfAncContact.seconds * 1000).toLocaleDateString() : null;
                        const gestationalAge = visit?.presentPregnancy?.gestationalAge;
                        const isCurrentVisit = visitNum === totalVisits;
                        const isFutureVisit = visitNum > totalVisits;
                        
                        return (
                          <div 
                            key={visitNum} 
                            className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                              hasFlag 
                                ? 'bg-red-50 border-red-300 hover:border-red-400' 
                                : visit 
                                  ? 'bg-green-50 border-green-300 hover:border-green-400'
                                  : isCurrentVisit
                                    ? 'bg-blue-50 border-blue-300 hover:border-blue-400'
                                    : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => {
                              setSelectedVisit({ visitNum, visit });
                              setShowVisitModal(true);
                            }}
                          >
                            {/* Flag indicator */}
                            {hasFlag && (
                              <div className="absolute -top-2 -right-2">
                                <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">!</span>
                                </div>
                              </div>
                            )}

                            {/* Visit header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${
                                  hasFlag 
                                    ? 'bg-red-500' 
                                    : visit 
                                      ? 'bg-green-500'
                                      : isCurrentVisit
                                        ? 'bg-blue-500'
                                        : 'bg-gray-300'
                                }`} />
                                <span className="font-semibold text-sm">
                                  Visit {visitNum}
                                  {isCurrentVisit && <span className="text-blue-600 ml-1">(Current)</span>}
                                </span>
                              </div>
                              <Badge 
                                variant={hasFlag ? "destructive" : visit ? "default" : "secondary"} 
                                className="text-xs"
                              >
                                {hasFlag ? 'Flagged' : visit ? 'Completed' : isFutureVisit ? 'Pending' : 'Scheduled'}
                              </Badge>
                            </div>

                            {/* Visit details */}
                            <div className="space-y-2">
                              {visit ? (
                                <>
                                  {gestationalAge && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">GA:</span>
                                      <span className="font-medium ml-1">{gestationalAge} weeks</span>
                                    </div>
                                  )}
                                  {visitDate && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Date:</span>
                                      <span className="font-medium ml-1">{visitDate}</span>
                                    </div>
                                  )}
                                  {hasFlag && (
                                    <div className="text-sm">
                                      <span className="text-red-600 font-medium">⚠️ Issues detected</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  {isFutureVisit ? 'Scheduled for future' : 'Not yet scheduled'}
                                </div>
                              )}
                            </div>

                            {/* Visit type indicator */}
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              <span className="text-xs text-muted-foreground">
                                {visitNum === 1 ? 'Initial Assessment' :
                                 visitNum === 2 ? '13-16 weeks' :
                                 visitNum === 3 ? '20 weeks' :
                                 visitNum === 4 ? '26 weeks' :
                                 visitNum === 5 ? '30 weeks' :
                                 visitNum === 6 ? '34 weeks' :
                                 visitNum === 7 ? '36 weeks' :
                                 '38-40 weeks'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Visit Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Visit Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{totalVisits}</div>
                          <div className="text-muted-foreground">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{8 - totalVisits}</div>
                          <div className="text-muted-foreground">Remaining</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {[1, 2, 3, 4, 5, 6, 7, 8].filter(v => patient[`visit${v}`]?.flags || patient[`visit${v}`]?.riskFactors || patient[`visit${v}`]?.complications || patient[`visit${v}`]?.abnormalities).length}
                          </div>
                          <div className="text-muted-foreground">Flagged Visits</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">{dueDateString}</div>
                          <div className="text-muted-foreground">Due Date</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Visit Details Modal */}
      {showVisitModal && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Visit {selectedVisit.visitNum} Details
                </h2>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setShowVisitModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedVisit.visit ? (
                <div className="space-y-6">
                  {/* Visit Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Visit Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Visit Date</label>
                          <p className="text-sm">
                            {selectedVisit.visit.presentPregnancy?.dateOfAncContact ? 
                              new Date(selectedVisit.visit.presentPregnancy.dateOfAncContact.seconds * 1000).toLocaleDateString() : 
                              'Not recorded'
                            }
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Gestational Age</label>
                          <p className="text-sm">{selectedVisit.visit.presentPregnancy?.gestationalAge || 'N/A'} weeks</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Trimester</label>
                          <p className="text-sm">{getTrimesterForContact(selectedVisit.visitNum)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <Badge variant="default">Completed</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vitals */}
                  {selectedVisit.visit.vitals && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Vital Signs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Blood Pressure</label>
                            <p className="text-sm">{selectedVisit.visit.vitals.bloodPressure || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Weight</label>
                            <p className="text-sm">{selectedVisit.visit.vitals.weight || 'N/A'} kg</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Height</label>
                            <p className="text-sm">{selectedVisit.visit.vitals.height || 'N/A'} cm</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">BMI</label>
                            <p className="text-sm">{selectedVisit.visit.vitals.bmi || 'N/A'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Present Pregnancy */}
                  {selectedVisit.visit.presentPregnancy && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Pregnancy Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Fundal Height</label>
                            <p className="text-sm">{selectedVisit.visit.presentPregnancy.fundalHeight || 'N/A'} cm</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Fetal Heart Rate</label>
                            <p className="text-sm">{selectedVisit.visit.presentPregnancy.fetalHeartRate || 'N/A'} bpm</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Fetal Position</label>
                            <p className="text-sm">{selectedVisit.visit.presentPregnancy.fetalPosition || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Fetal Movement</label>
                            <p className="text-sm">{selectedVisit.visit.presentPregnancy.fetalMovement || 'N/A'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Flags/Issues */}
                  {(selectedVisit.visit.flags || selectedVisit.visit.riskFactors || selectedVisit.visit.complications || selectedVisit.visit.abnormalities) && (
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="text-red-800 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Issues Detected
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedVisit.visit.flags && (
                            <div>
                              <label className="text-sm font-medium text-red-700">Flags</label>
                              <p className="text-sm text-red-600">{selectedVisit.visit.flags}</p>
                            </div>
                          )}
                          {selectedVisit.visit.riskFactors && (
                            <div>
                              <label className="text-sm font-medium text-red-700">Risk Factors</label>
                              <p className="text-sm text-red-600">{selectedVisit.visit.riskFactors}</p>
                            </div>
                          )}
                          {selectedVisit.visit.complications && (
                            <div>
                              <label className="text-sm font-medium text-red-700">Complications</label>
                              <p className="text-sm text-red-600">{selectedVisit.visit.complications}</p>
                            </div>
                          )}
                          {selectedVisit.visit.abnormalities && (
                            <div>
                              <label className="text-sm font-medium text-red-700">Abnormalities</label>
                              <p className="text-sm text-red-600">{selectedVisit.visit.abnormalities}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lab Results */}
                  {selectedVisit.visit.labResults && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Laboratory Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(selectedVisit.visit.labResults).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm font-medium">{key}</span>
                              <span className="text-sm">{value as string}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Notes */}
                  {selectedVisit.visit.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Clinical Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{selectedVisit.visit.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Visit Not Completed</h3>
                  <p className="text-muted-foreground">
                    This visit has not been completed yet. Details will be available once the visit is conducted.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
