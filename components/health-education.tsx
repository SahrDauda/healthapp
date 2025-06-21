"use client"

import { useState, useEffect } from "react"
import { 
  BookOpen, 
  Apple, 
  Heart, 
  Baby, 
  Send, 
  Users, 
  Filter, 
  Search,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Calendar,
  TrendingUp,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../lib/firebase"

interface HealthTip {
  id: string
  title: string
  content: string
  category: "health" | "nutrition"
  targetStage: "first-trimester" | "second-trimester" | "third-trimester" | "delivery"
  targetWeeks?: number[]
  targetVisits?: number[]
  createdAt: any
  sentCount: number
  isActive: boolean
}

interface Patient {
  id: string
  name: string
  weeks: number
  trimester: string
  visitCount: number
  status: string
  hasDelivered: boolean
  email?: string
  phone?: string
}

export function HealthEducation() {
  const [activeTab, setActiveTab] = useState("health-tips")
  const [selectedCategory, setSelectedCategory] = useState<"health" | "nutrition">("health")
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [healthTips, setHealthTips] = useState<HealthTip[]>([])
  const [selectedTip, setSelectedTip] = useState<HealthTip | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStage, setFilterStage] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Form states
  const [tipTitle, setTipTitle] = useState("")
  const [tipContent, setTipContent] = useState("")
  const [tipCategory, setTipCategory] = useState<"health" | "nutrition">("health")
  const [tipTargetStage, setTipTargetStage] = useState<string>("first-trimester")
  const [tipTargetWeeks, setTipTargetWeeks] = useState<string>("")
  const [tipTargetVisits, setTipTargetVisits] = useState<string>("")

  useEffect(() => {
    fetchPatients()
    fetchHealthTips()
  }, [])

  const fetchPatients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "ancRecords"))
      const fetchedPatients: Patient[] = []
      
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data()
        const visit1 = data.visit1 || {}
        const basicInfo = visit1.basicInfo || {}
        const presentPregnancy = visit1.presentPregnancy || {}
        
        // Count visits
        let visitCount = 0
        for (let i = 1; i <= 8; i++) {
          if (data[`visit${i}`] && Object.keys(data[`visit${i}`]).length > 0) {
            visitCount++
          }
        }
        
        // Check if delivered
        const hasDelivered = data.visitdelivery && Object.keys(data.visitdelivery).length > 0
        
        // Calculate current gestational age
        const firstVisitGestationalAge = presentPregnancy.gestationalAge || 0
        const firstVisitDate = presentPregnancy.dateOfAncContact ? new Date(presentPregnancy.dateOfAncContact.seconds * 1000) : null
        let currentWeeks = firstVisitGestationalAge
        
        if (firstVisitDate) {
          const today = new Date()
          const weeksSinceFirstVisit = Math.floor((today.getTime() - firstVisitDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
          currentWeeks = firstVisitGestationalAge + weeksSinceFirstVisit
        }
        
        // Determine trimester
        let trimester = "Unknown"
        if (currentWeeks <= 12) trimester = "1st Trimester"
        else if (currentWeeks <= 27) trimester = "2nd Trimester"
        else if (currentWeeks <= 40) trimester = "3rd Trimester"
        else if (hasDelivered) trimester = "Delivered"
        
        fetchedPatients.push({
          id: docSnap.id,
          name: basicInfo.clientName || "Unknown",
          weeks: currentWeeks,
          trimester,
          visitCount,
          status: hasDelivered ? "Delivered" : "Active",
          hasDelivered,
          email: basicInfo.email,
          phone: basicInfo.phoneNumber
        })
      })
      
      setPatients(fetchedPatients)
      setFilteredPatients(fetchedPatients)
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHealthTips = async () => {
    // Mock data for now - in real app, fetch from Firestore
    const mockTips: HealthTip[] = [
      {
        id: "1",
        title: "First Trimester Nutrition Guide",
        content: "Focus on folic acid, iron, and protein. Eat plenty of leafy greens, lean meats, and whole grains. Stay hydrated and avoid raw fish and unpasteurized dairy.",
        category: "nutrition",
        targetStage: "first-trimester",
        targetWeeks: [1, 12],
        createdAt: new Date(),
        sentCount: 45,
        isActive: true
      },
      {
        id: "2",
        title: "Exercise Safety in Second Trimester",
        content: "Continue moderate exercise like walking, swimming, and prenatal yoga. Avoid high-impact activities and exercises that require lying on your back.",
        category: "health",
        targetStage: "second-trimester",
        targetWeeks: [13, 27],
        createdAt: new Date(),
        sentCount: 32,
        isActive: true
      },
      {
        id: "3",
        title: "Third Trimester Preparation",
        content: "Pack your hospital bag, practice breathing techniques, and discuss your birth plan with your healthcare provider. Monitor for signs of labor.",
        category: "health",
        targetStage: "third-trimester",
        targetWeeks: [28, 40],
        createdAt: new Date(),
        sentCount: 28,
        isActive: true
      },
      {
        id: "4",
        title: "Postpartum Recovery Tips",
        content: "Rest when possible, eat nutritious meals, stay hydrated, and don't hesitate to ask for help. Monitor for signs of postpartum depression.",
        category: "health",
        targetStage: "delivery",
        createdAt: new Date(),
        sentCount: 15,
        isActive: true
      }
    ]
    
    setHealthTips(mockTips)
  }

  const getInitials = (fullName: string) => {
    if (!fullName) return "?";
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }
    return "?";
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "first-trimester": return "bg-blue-100 text-blue-800"
      case "second-trimester": return "bg-green-100 text-green-800"
      case "third-trimester": return "bg-purple-100 text-purple-800"
      case "delivery": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    return category === "health" ? Heart : Apple
  }

  const handleCreateTip = async () => {
    const newTip: Omit<HealthTip, 'id' | 'createdAt' | 'sentCount'> = {
      title: tipTitle,
      content: tipContent,
      category: tipCategory,
      targetStage: tipTargetStage as any,
      targetWeeks: tipTargetWeeks ? tipTargetWeeks.split(',').map(w => parseInt(w.trim())) : undefined,
      targetVisits: tipTargetVisits ? tipTargetVisits.split(',').map(v => parseInt(v.trim())) : undefined,
      isActive: true
    }

    // In real app, save to Firestore
    console.log("Creating new tip:", newTip)
    setIsCreateModalOpen(false)
    
    // Reset form
    setTipTitle("")
    setTipContent("")
    setTipCategory("health")
    setTipTargetStage("first-trimester")
    setTipTargetWeeks("")
    setTipTargetVisits("")
  }

  const handleSendTip = async (tip: HealthTip) => {
    // Filter patients based on tip criteria
    const eligiblePatients = patients.filter(patient => {
      if (tip.targetStage === "delivery" && !patient.hasDelivered) return false
      if (tip.targetStage !== "delivery" && patient.hasDelivered) return false
      if (tip.targetWeeks && !tip.targetWeeks.includes(patient.weeks)) return false
      if (tip.targetVisits && !tip.targetVisits.includes(patient.visitCount)) return false
      return true
    })

    // In real app, send notifications to eligible patients
    console.log(`Sending tip "${tip.title}" to ${eligiblePatients.length} patients`)
    setIsSendModalOpen(false)
  }

  const filteredTips = healthTips.filter(tip => {
    if (filterStage !== "all" && tip.targetStage !== filterStage) return false
    if (searchTerm && !tip.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const stats = {
    totalTips: healthTips.length,
    activeTips: healthTips.filter(tip => tip.isActive).length,
    totalSent: healthTips.reduce((sum, tip) => sum + tip.sentCount, 0),
    eligiblePatients: patients.filter(p => !p.hasDelivered).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Health Education</h1>
          <p className="text-muted-foreground">Send personalized health tips and nutrition guidance to patients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tip
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Bulk Tips
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTips}</div>
            <p className="text-xs text-muted-foreground">Health & nutrition tips</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tips</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTips}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
            <p className="text-xs text-muted-foreground">Tips delivered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eligiblePatients}</div>
            <p className="text-xs text-muted-foreground">Active pregnancies</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="health-tips" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Health Tips
          </TabsTrigger>
          <TabsTrigger value="nutrition-tips" className="flex items-center gap-2">
            <Apple className="h-4 w-4" />
            Nutrition Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health-tips" className="space-y-4">
          <HealthTipsTab 
            tips={filteredTips.filter(tip => tip.category === "health")}
            onSendTip={handleSendTip}
            onEditTip={(tip) => setSelectedTip(tip)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStage={filterStage}
            setFilterStage={setFilterStage}
          />
        </TabsContent>

        <TabsContent value="nutrition-tips" className="space-y-4">
          <NutritionTipsTab 
            tips={filteredTips.filter(tip => tip.category === "nutrition")}
            onSendTip={handleSendTip}
            onEditTip={(tip) => setSelectedTip(tip)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStage={filterStage}
            setFilterStage={setFilterStage}
          />
        </TabsContent>
      </Tabs>

      {/* Create Tip Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Health Tip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={tipCategory} onValueChange={(value: "health" | "nutrition") => setTipCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health Tips</SelectItem>
                    <SelectItem value="nutrition">Nutrition Tips</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Target Stage</label>
                <Select value={tipTargetStage} onValueChange={setTipTargetStage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first-trimester">First Trimester</SelectItem>
                    <SelectItem value="second-trimester">Second Trimester</SelectItem>
                    <SelectItem value="third-trimester">Third Trimester</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={tipTitle} 
                onChange={(e) => setTipTitle(e.target.value)}
                placeholder="Enter tip title..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea 
                value={tipContent} 
                onChange={(e) => setTipContent(e.target.value)}
                placeholder="Enter tip content..."
                rows={6}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Target Week (optional)</label>
                <Select value={tipTargetWeeks} onValueChange={setTipTargetWeeks}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a week" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 42 }, (_, i) => i + 1).map(week => (
                      <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Target Visit (optional)</label>
                <Select value={tipTargetVisits} onValueChange={setTipTargetVisits}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a visit" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(visit => (
                      <SelectItem key={visit} value={String(visit)}>Visit {visit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTip}>
                Create Tip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Tip Modal */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Health Tip</DialogTitle>
          </DialogHeader>
          {selectedTip && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedTip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{selectedTip.content}</p>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="outline">{selectedTip.category}</Badge>
                    <Badge className={getStageColor(selectedTip.targetStage)}>
                      {selectedTip.targetStage.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <h4 className="font-medium">Eligible Patients</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {patients.filter(patient => {
                    if (selectedTip.targetStage === "delivery" && !patient.hasDelivered) return false
                    if (selectedTip.targetStage !== "delivery" && patient.hasDelivered) return false
                    if (selectedTip.targetWeeks && !selectedTip.targetWeeks.includes(patient.weeks)) return false
                    if (selectedTip.targetVisits && !selectedTip.targetVisits.includes(patient.visitCount)) return false
                    return true
                  }).map(patient => (
                    <div key={patient.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {patient.weeks} weeks • {patient.trimester} • {patient.visitCount} visits
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSendTip(selectedTip)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {patients.filter(patient => {
                    if (selectedTip.targetStage === "delivery" && !patient.hasDelivered) return false
                    if (selectedTip.targetStage !== "delivery" && patient.hasDelivered) return false
                    if (selectedTip.targetWeeks && !selectedTip.targetWeeks.includes(patient.weeks)) return false
                    if (selectedTip.targetVisits && !selectedTip.targetVisits.includes(patient.visitCount)) return false
                    return true
                  }).length} patients
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Health Tips Tab Component
function HealthTipsTab({ 
  tips, 
  onSendTip, 
  onEditTip, 
  searchTerm, 
  setSearchTerm, 
  filterStage, 
  setFilterStage 
}: {
  tips: HealthTip[]
  onSendTip: (tip: HealthTip) => void
  onEditTip: (tip: HealthTip) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterStage: string
  setFilterStage: (stage: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search health tips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="first-trimester">First Trimester</SelectItem>
            <SelectItem value="second-trimester">Second Trimester</SelectItem>
            <SelectItem value="third-trimester">Third Trimester</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tips Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tips.map((tip) => (
          <Card key={tip.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <Badge className={getStageColor(tip.targetStage)}>
                    {tip.targetStage.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEditTip(tip)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onSendTip(tip)}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{tip.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {tip.content}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Sent {tip.sentCount} times</span>
                <span>{tip.createdAt.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tips.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No health tips found</h3>
            <p className="text-muted-foreground">Create your first health tip to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Nutrition Tips Tab Component
function NutritionTipsTab({ 
  tips, 
  onSendTip, 
  onEditTip, 
  searchTerm, 
  setSearchTerm, 
  filterStage, 
  setFilterStage 
}: {
  tips: HealthTip[]
  onSendTip: (tip: HealthTip) => void
  onEditTip: (tip: HealthTip) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterStage: string
  setFilterStage: (stage: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search nutrition tips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="first-trimester">First Trimester</SelectItem>
            <SelectItem value="second-trimester">Second Trimester</SelectItem>
            <SelectItem value="third-trimester">Third Trimester</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tips Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tips.map((tip) => (
          <Card key={tip.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Apple className="h-5 w-5 text-green-500" />
                  <Badge className={getStageColor(tip.targetStage)}>
                    {tip.targetStage.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEditTip(tip)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onSendTip(tip)}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{tip.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {tip.content}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Sent {tip.sentCount} times</span>
                <span>{tip.createdAt.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tips.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Apple className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No nutrition tips found</h3>
            <p className="text-muted-foreground">Create your first nutrition tip to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getStageColor(stage: string) {
  switch (stage) {
    case "first-trimester": return "bg-blue-100 text-blue-800"
    case "second-trimester": return "bg-green-100 text-green-800"
    case "third-trimester": return "bg-purple-100 text-purple-800"
    case "delivery": return "bg-orange-100 text-orange-800"
    default: return "bg-gray-100 text-gray-800"
  }
} 