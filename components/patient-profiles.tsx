"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Users,
  Heart,
  AlertTriangle,
  Baby,
  Eye,
  Phone,
  Mail,
  X,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useIsMobile } from "@/hooks/use-mobile"

interface PatientProfilesProps {
  onSelectPatient: (patientId: string) => void
}

interface FilterState {
  trimester: string
  visitCountOperator: string
  visitCountValue: number
  riskLevel: string[]
  status: string[]
  ageRange: [number, number]
  dueWithinDays: number | null
}

const patients = [
  {
    id: "1",
    name: "Emma Thompson",
    age: 28,
    phone: "(555) 123-4567",
    email: "emma.thompson@email.com",
    pregnancyWeeks: 24,
    gestationalAge: "24 weeks",
    trimester: "2nd",
    dueDate: "2024-08-15",
    status: "Active",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-02-01",
    riskLevel: "Low",
    bloodType: "O+",
    emergencyContact: "John Thompson (Husband)",
    emergencyPhone: "(555) 123-4568",
    address: "123 Oak Street, Springfield, IL 62701",
    visitCount: 8,
    totalAppointments: 10,
  },
  {
    id: "2",
    name: "Maria Rodriguez",
    age: 32,
    phone: "(555) 234-5678",
    email: "maria.rodriguez@email.com",
    pregnancyWeeks: 36,
    gestationalAge: "36 weeks",
    trimester: "3rd",
    dueDate: "2024-03-20",
    status: "Active",
    lastVisit: "2024-01-20",
    nextAppointment: "2024-01-27",
    riskLevel: "Medium",
    bloodType: "A+",
    emergencyContact: "Carlos Rodriguez (Husband)",
    emergencyPhone: "(555) 234-5679",
    address: "456 Pine Avenue, Springfield, IL 62702",
    visitCount: 12,
    totalAppointments: 14,
  },
  {
    id: "3",
    name: "Sarah Chen",
    age: 26,
    phone: "(555) 345-6789",
    email: "sarah.chen@email.com",
    pregnancyWeeks: 12,
    gestationalAge: "12 weeks",
    trimester: "1st",
    dueDate: "2024-09-10",
    status: "Active",
    lastVisit: "2024-01-10",
    nextAppointment: "2024-02-10",
    riskLevel: "Low",
    bloodType: "B+",
    emergencyContact: "David Chen (Husband)",
    emergencyPhone: "(555) 345-6790",
    address: "789 Maple Drive, Springfield, IL 62703",
    visitCount: 3,
    totalAppointments: 4,
  },
  {
    id: "4",
    name: "Jennifer Wilson",
    age: 35,
    phone: "(555) 456-7890",
    email: "jennifer.wilson@email.com",
    pregnancyWeeks: 0,
    gestationalAge: "Postpartum",
    trimester: "Postpartum",
    dueDate: "2024-01-05",
    status: "Postpartum",
    lastVisit: "2024-01-18",
    nextAppointment: "2024-02-05",
    riskLevel: "Low",
    bloodType: "AB+",
    emergencyContact: "Michael Wilson (Husband)",
    emergencyPhone: "(555) 456-7891",
    address: "321 Elm Street, Springfield, IL 62704",
    visitCount: 15,
    totalAppointments: 16,
  },
  {
    id: "5",
    name: "Lisa Anderson",
    age: 29,
    phone: "(555) 567-8901",
    email: "lisa.anderson@email.com",
    pregnancyWeeks: 18,
    gestationalAge: "18 weeks",
    trimester: "2nd",
    dueDate: "2024-07-22",
    status: "Active",
    lastVisit: "2024-01-12",
    nextAppointment: "2024-02-08",
    riskLevel: "High",
    bloodType: "O-",
    emergencyContact: "Robert Anderson (Husband)",
    emergencyPhone: "(555) 567-8902",
    address: "654 Cedar Lane, Springfield, IL 62705",
    visitCount: 6,
    totalAppointments: 8,
  },
  {
    id: "6",
    name: "Amanda Foster",
    age: 31,
    phone: "(555) 678-9012",
    email: "amanda.foster@email.com",
    pregnancyWeeks: 8,
    gestationalAge: "8 weeks",
    trimester: "1st",
    dueDate: "2024-10-15",
    status: "Active",
    lastVisit: "2024-01-22",
    nextAppointment: "2024-02-12",
    riskLevel: "Medium",
    bloodType: "A-",
    emergencyContact: "James Foster (Husband)",
    emergencyPhone: "(555) 678-9013",
    address: "987 Birch Road, Springfield, IL 62706",
    visitCount: 2,
    totalAppointments: 3,
  },
  {
    id: "7",
    name: "Rachel Kim",
    age: 27,
    phone: "(555) 789-0123",
    email: "rachel.kim@email.com",
    pregnancyWeeks: 32,
    gestationalAge: "32 weeks",
    trimester: "3rd",
    dueDate: "2024-04-10",
    status: "Active",
    lastVisit: "2024-01-25",
    nextAppointment: "2024-02-15",
    riskLevel: "Low",
    bloodType: "B-",
    emergencyContact: "David Kim (Husband)",
    emergencyPhone: "(555) 789-0124",
    address: "147 Willow Street, Springfield, IL 62707",
    visitCount: 10,
    totalAppointments: 12,
  },
  {
    id: "8",
    name: "Nicole Brown",
    age: 33,
    phone: "(555) 890-1234",
    email: "nicole.brown@email.com",
    pregnancyWeeks: 0,
    gestationalAge: "Postpartum",
    trimester: "Postpartum",
    dueDate: "2023-12-20",
    status: "Postpartum",
    lastVisit: "2024-01-20",
    nextAppointment: "2024-02-20",
    riskLevel: "Medium",
    bloodType: "AB-",
    emergencyContact: "Mark Brown (Husband)",
    emergencyPhone: "(555) 890-1235",
    address: "258 Oak Ridge, Springfield, IL 62708",
    visitCount: 18,
    totalAppointments: 20,
  },
]

export function PatientProfiles({ onSelectPatient }: PatientProfilesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<(typeof patients)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const isMobile = useIsMobile()

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    trimester: "",
    visitCountOperator: "gte",
    visitCountValue: 0,
    riskLevel: [],
    status: [],
    ageRange: [18, 45],
    dueWithinDays: null,
  })

  // Filter options
  const trimesterOptions = ["All", "1st", "2nd", "3rd", "Postpartum"]
  const riskLevelOptions = ["Low", "Medium", "High"]
  const statusOptions = ["Active", "Postpartum"]
  const visitCountOperators = [
    { value: "lt", label: "Less than" },
    { value: "eq", label: "Equal to" },
    { value: "gte", label: "Greater than or equal" },
    { value: "gt", label: "Greater than" },
  ]

  // Calculate statistics with current filters
  const filteredPatients = useMemo(() => {
    const filtered = patients.filter((patient) => {
      // Search filter
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)

      // Trimester filter
      const matchesTrimester =
        filters.trimester === "" || filters.trimester === "All" || patient.trimester === filters.trimester

      // Visit count filter
      let matchesVisitCount = true
      if (filters.visitCountValue > 0) {
        switch (filters.visitCountOperator) {
          case "lt":
            matchesVisitCount = patient.visitCount < filters.visitCountValue
            break
          case "eq":
            matchesVisitCount = patient.visitCount === filters.visitCountValue
            break
          case "gte":
            matchesVisitCount = patient.visitCount >= filters.visitCountValue
            break
          case "gt":
            matchesVisitCount = patient.visitCount > filters.visitCountValue
            break
        }
      }

      // Risk level filter
      const matchesRiskLevel = filters.riskLevel.length === 0 || filters.riskLevel.includes(patient.riskLevel)

      // Status filter
      const matchesStatus = filters.status.length === 0 || filters.status.includes(patient.status)

      // Age range filter
      const matchesAge = patient.age >= filters.ageRange[0] && patient.age <= filters.ageRange[1]

      // Due within days filter
      let matchesDueDate = true
      if (filters.dueWithinDays !== null && patient.status === "Active") {
        const dueDate = new Date(patient.dueDate)
        const today = new Date()
        const diffTime = dueDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        matchesDueDate = diffDays <= filters.dueWithinDays && diffDays > 0
      }

      return (
        matchesSearch &&
        matchesTrimester &&
        matchesVisitCount &&
        matchesRiskLevel &&
        matchesStatus &&
        matchesAge &&
        matchesDueDate
      )
    })

    // Sort patients
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a]
      let bValue: any = b[sortBy as keyof typeof b]

      if (sortBy === "name") {
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
      } else if (sortBy === "age" || sortBy === "visitCount" || sortBy === "pregnancyWeeks") {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (sortBy === "lastVisit" || sortBy === "dueDate") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [searchTerm, filters, sortBy, sortOrder])

  const totalPatients = patients.length
  const activePatients = filteredPatients.filter((p) => p.status === "Active").length
  const postpartumPatients = filteredPatients.filter((p) => p.status === "Postpartum").length
  const highRiskPatients = filteredPatients.filter((p) => p.riskLevel === "High").length
  const dueSoon = filteredPatients.filter((p) => {
    if (p.status === "Postpartum") return false
    const dueDate = new Date(p.dueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }).length

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleMultiSelectFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[key] as string[]
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]
      return { ...prev, [key]: newValues }
    })
  }

  const clearAllFilters = () => {
    setFilters({
      trimester: "",
      visitCountOperator: "gte",
      visitCountValue: 0,
      riskLevel: [],
      status: [],
      ageRange: [18, 45],
      dueWithinDays: null,
    })
    setSearchTerm("")
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.trimester && filters.trimester !== "All") count++
    if (filters.visitCountValue > 0) count++
    if (filters.riskLevel.length > 0) count++
    if (filters.status.length > 0) count++
    if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 45) count++
    if (filters.dueWithinDays !== null) count++
    if (searchTerm) count++
    return count
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "destructive"
      case "Medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Postpartum":
        return "secondary"
      default:
        return "outline"
    }
  }

  const handleRowClick = (patient: (typeof patients)[0]) => {
    setSelectedPatient(patient)
    setIsModalOpen(true)
  }

  const handleViewMore = () => {
    if (selectedPatient) {
      setIsModalOpen(false)
      onSelectPatient(selectedPatient.id)
    }
  }

  const calculateWeeksRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return diffWeeks > 0 ? diffWeeks : 0
  }

  // Mobile Card View Component
  const MobilePatientCard = ({ patient }: { patient: (typeof patients)[0] }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleRowClick(patient)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
            <AvatarFallback>
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-base truncate">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant={getStatusColor(patient.status) as any} className="text-xs">
                  {patient.status}
                </Badge>
                <Badge variant={getRiskColor(patient.riskLevel) as any} className="text-xs">
                  {patient.riskLevel}
                </Badge>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{patient.email}</span>
              </div>
            </div>

            {patient.status === "Active" && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">{patient.gestationalAge}</span>
                  <span className="text-muted-foreground"> ({patient.trimester})</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Due: {new Date(patient.dueDate).toLocaleDateString()}
                </div>
              </div>
            )}

            <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
              <span>
                Visits: {patient.visitCount}/{patient.totalAppointments}
              </span>
              <span>Last: {new Date(patient.lastVisit).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Patient Profiles</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage maternal health records and patient information
          </p>
        </div>
        <Button className="w-full sm:w-auto">Add New Patient</Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Filtered Results</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground-white" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{filteredPatients.length}</div>
            <p className="text-xs text-muted-foreground-black">of {totalPatients} total patients</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-white">Active Pregnancies</CardTitle>
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground-white" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{activePatients}</div>
            <p className="text-xs text-muted-foreground-black">Currently under prenatal care</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">High Risk Patients</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{highRiskPatients}</div>
            <p className="text-xs text-muted-foreground">Requiring special attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Due Soon</CardTitle>
            <Baby className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{dueSoon}</div>
            <p className="text-xs text-muted-foreground">Due within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Trimester Dropdown Filter */}
          <Select value={filters.trimester} onValueChange={(value) => handleFilterChange("trimester", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by trimester" />
            </SelectTrigger>
            <SelectContent>
              {trimesterOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "All" ? "All Trimesters" : `${option}${option !== "Postpartum" ? " Trimester" : ""}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              More Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="pregnancyWeeks">Pregnancy Weeks</SelectItem>
                <SelectItem value="visitCount">Visit Count</SelectItem>
                <SelectItem value="lastVisit">Last Visit</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchTerm}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {filters.trimester && filters.trimester !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.trimester} Trimester
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("trimester", "")} />
              </Badge>
            )}
            {filters.visitCountValue > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Visits {visitCountOperators.find((op) => op.value === filters.visitCountOperator)?.label.toLowerCase()}{" "}
                {filters.visitCountValue}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("visitCountValue", 0)} />
              </Badge>
            )}
            {filters.riskLevel.map((risk) => (
              <Badge key={risk} variant="secondary" className="flex items-center gap-1">
                {risk} Risk
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleMultiSelectFilter("riskLevel", risk)} />
              </Badge>
            ))}
            {filters.status.map((status) => (
              <Badge key={status} variant="secondary" className="flex items-center gap-1">
                {status}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleMultiSelectFilter("status", status)} />
              </Badge>
            ))}
            {(filters.ageRange[0] !== 18 || filters.ageRange[1] !== 45) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Age: {filters.ageRange[0]}-{filters.ageRange[1]}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("ageRange", [18, 45])} />
              </Badge>
            )}
            {filters.dueWithinDays !== null && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Due within {filters.dueWithinDays} days
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("dueWithinDays", null)} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Patient List */}
      {isMobile ? (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Showing {filteredPatients.length} of {totalPatients} patients
          </div>
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <MobilePatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        </div>
      ) : (
        /* Desktop Table View */
        <Card>
          <CardHeader>
            <CardTitle>Patient List</CardTitle>
            <CardDescription>
              Click on any row to view patient summary. Showing {filteredPatients.length} of {totalPatients} patients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Patient</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead className="min-w-[140px]">Contact</TableHead>
                    <TableHead className="min-w-[150px]">Pregnancy Status</TableHead>
                    <TableHead className="min-w-[120px]">Due Date</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Next Appointment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(patient)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                            <AvatarFallback className="text-xs">
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">{patient.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{patient.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(patient.status) as any}>{patient.status}</Badge>
                          {patient.status === "Active" && (
                            <span className="text-sm text-muted-foreground">
                              {patient.gestationalAge} ({patient.trimester})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(patient.dueDate).toLocaleDateString()}</div>
                          {patient.status === "Active" && (
                            <div className="text-muted-foreground">
                              {calculateWeeksRemaining(patient.dueDate)} weeks left
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskColor(patient.riskLevel) as any}>{patient.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {patient.visitCount}/{patient.totalAppointments}
                          </div>
                          <div className="text-muted-foreground">
                            {Math.round((patient.visitCount / patient.totalAppointments) * 100)}% complete
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(patient.lastVisit).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(patient.nextAppointment).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters to find patients.
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Advanced Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Trimester Filter */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Trimester</Label>
              <div className="grid grid-cols-2 gap-3">
                {trimesterOptions.map((trimester) => (
                  <div key={trimester} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`trimester-${trimester}`}
                      name="trimester"
                      checked={filters.trimester === trimester}
                      onChange={() => handleFilterChange("trimester", trimester)}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor={`trimester-${trimester}`} className="cursor-pointer">
                      {trimester === "All"
                        ? "All Trimesters"
                        : `${trimester}${trimester !== "Postpartum" ? " Trimester" : ""}`}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Visit Count Filter */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Number of Visits</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="visit-operator" className="text-sm">
                    Condition
                  </Label>
                  <Select
                    value={filters.visitCountOperator}
                    onValueChange={(value) => handleFilterChange("visitCountOperator", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visitCountOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="visit-count" className="text-sm">
                    Number of visits
                  </Label>
                  <Input
                    id="visit-count"
                    type="number"
                    min="0"
                    max="50"
                    value={filters.visitCountValue}
                    onChange={(e) => handleFilterChange("visitCountValue", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Risk Level Filter */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Risk Level</Label>
              <div className="grid grid-cols-3 gap-3">
                {riskLevelOptions.map((risk) => (
                  <div key={risk} className="flex items-center space-x-2">
                    <Checkbox
                      id={`risk-${risk}`}
                      checked={filters.riskLevel.includes(risk)}
                      onCheckedChange={() => handleMultiSelectFilter("riskLevel", risk)}
                    />
                    <Label htmlFor={`risk-${risk}`} className="cursor-pointer">
                      {risk}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Status Filter */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Patient Status</Label>
              <div className="grid grid-cols-2 gap-3">
                {statusOptions.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status.includes(status)}
                      onCheckedChange={() => handleMultiSelectFilter("status", status)}
                    />
                    <Label htmlFor={`status-${status}`} className="cursor-pointer">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Age Range Filter */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Age Range</Label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{filters.ageRange[0]} years</span>
                  <span>{filters.ageRange[1]} years</span>
                </div>
                <Slider
                  value={filters.ageRange}
                  onValueChange={(value) => handleFilterChange("ageRange", value)}
                  min={18}
                  max={45}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <Separator />

            {/* Due Within Days Filter */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Due Within (Days)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={filters.dueWithinDays === null ? "default" : "outline"}
                  onClick={() => handleFilterChange("dueWithinDays", null)}
                  className="justify-start"
                >
                  Any time
                </Button>
                {[7, 14, 30, 60].map((days) => (
                  <Button
                    key={days}
                    variant={filters.dueWithinDays === days ? "default" : "outline"}
                    onClick={() => handleFilterChange("dueWithinDays", days)}
                    className="justify-start"
                  >
                    {days} days
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={clearAllFilters} className="w-full sm:w-auto">
                Clear All Filters
              </Button>
              <Button onClick={() => setIsFilterOpen(false)} className="w-full sm:w-auto">
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Summary Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                <AvatarFallback>
                  {selectedPatient?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl font-semibold">{selectedPatient?.name}</div>
                <div className="text-sm text-muted-foreground font-normal">Patient Summary</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Age:</span> {selectedPatient.age}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Blood Type:</span> {selectedPatient.bloodType}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span> {selectedPatient.phone}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {selectedPatient.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Emergency Contact</h4>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Contact:</span> {selectedPatient.emergencyContact}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span> {selectedPatient.emergencyPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pregnancy Information */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Pregnancy Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(selectedPatient.status) as any}>{selectedPatient.status}</Badge>
                      <Badge variant={getRiskColor(selectedPatient.riskLevel) as any}>
                        {selectedPatient.riskLevel} Risk
                      </Badge>
                    </div>
                    {selectedPatient.status === "Active" && (
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Weeks:</span> {selectedPatient.pregnancyWeeks}
                        </p>
                        <p>
                          <span className="font-medium">Trimester:</span> {selectedPatient.trimester}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Due Date:</span>{" "}
                      {new Date(selectedPatient.dueDate).toLocaleDateString()}
                    </p>
                    {selectedPatient.status === "Active" && (
                      <p>
                        <span className="font-medium">Weeks Remaining:</span>{" "}
                        {calculateWeeksRemaining(selectedPatient.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Visit Information */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Visit History</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p>
                      <span className="font-medium">Total Visits:</span> {selectedPatient.visitCount}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Scheduled:</span> {selectedPatient.totalAppointments}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Completion Rate:</span>{" "}
                      {Math.round((selectedPatient.visitCount / selectedPatient.totalAppointments) * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Appointments</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <span className="font-medium">Last Visit:</span>{" "}
                      {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Next Appointment:</span>{" "}
                      {new Date(selectedPatient.nextAppointment).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Address</h4>
                <p className="text-sm">{selectedPatient.address}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
                  Close
                </Button>
                <Button
                  onClick={handleViewMore}
                  className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4" />
                  <span>View More Details</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
