"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "../lib/firebase"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  Tooltip
} from "recharts"

interface ChartData {
  id: string
  title: string
  type: "bar" | "line" | "pie" | "area"
  data: any[]
  description?: string
  createdAt: any
  lastUpdated: any
  isActive: boolean
  category?: string
  colorScheme?: string[]
}

interface ChartStats {
  totalCharts: number
  activeCharts: number
  chartTypes: {
    bar: number
    line: number
    pie: number
    area: number
  }
  lastUpdated: Date | null
}

export function ChartsData() {
  const [charts, setCharts] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ChartStats>({
    totalCharts: 0,
    activeCharts: 0,
    chartTypes: { bar: 0, line: 0, pie: 0, area: 0 },
    lastUpdated: null
  })
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    fetchChartsData()
  }, [])

  useEffect(() => {
    // Calculate stats when charts data changes
    const totalCharts = charts.length
    const activeCharts = charts.filter(chart => chart.isActive).length
    const chartTypes = {
      bar: charts.filter(chart => chart.type === "bar").length,
      line: charts.filter(chart => chart.type === "line").length,
      pie: charts.filter(chart => chart.type === "pie").length,
      area: charts.filter(chart => chart.type === "area").length
    }
    const lastUpdated = charts.length > 0 
      ? charts.reduce((latest, chart) => {
          const chartDate = chart.lastUpdated?.toDate ? chart.lastUpdated.toDate() : new Date(chart.lastUpdated)
          return latest && chartDate > latest ? chartDate : latest
        }, null as Date | null)
      : null

    setStats({
      totalCharts,
      activeCharts,
      chartTypes,
      lastUpdated
    })
  }, [charts])

  const fetchChartsData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const chartsSnapshot = await getDocs(collection(db, "charts"))
      const fetchedCharts: ChartData[] = []
      
      chartsSnapshot.forEach(docSnap => {
        const data = docSnap.data()
        fetchedCharts.push({
          id: docSnap.id,
          title: data.title || "Untitled Chart",
          type: data.type || "bar",
          data: data.data || [],
          description: data.description,
          createdAt: data.createdAt || new Date(),
          lastUpdated: data.lastUpdated || new Date(),
          isActive: data.isActive !== undefined ? data.isActive : true,
          category: data.category,
          colorScheme: data.colorScheme || ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
        })
      })
      
      // Sort by last updated (newest first)
      fetchedCharts.sort((a, b) => {
        const timeA = a.lastUpdated?.toDate ? a.lastUpdated.toDate() : new Date(a.lastUpdated)
        const timeB = b.lastUpdated?.toDate ? b.lastUpdated.toDate() : new Date(b.lastUpdated)
        return timeB.getTime() - timeA.getTime()
      })
      
      setCharts(fetchedCharts)
    } catch (error) {
      console.error("Error fetching charts data:", error)
      setError("Failed to fetch charts data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getChartComponent = (chart: ChartData) => {
    const colors = chart.colorScheme || ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
    
    switch (chart.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(chart.data[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(chart.data[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(chart.data[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={colors[index % colors.length]} fill={colors[index % colors.length]} fillOpacity={0.6} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )
      
      default:
        return <div className="text-center text-gray-500">Unsupported chart type</div>
    }
  }

  const filteredCharts = charts.filter(chart => {
    if (selectedCategory !== "all" && chart.category !== selectedCategory) return false
    return true
  })

  const categories = ["all", ...Array.from(new Set(charts.map(chart => chart.category).filter(Boolean)))]

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-2 md:p-6 pt-4 md:pt-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-maternal-blue-600" />
            <p className="text-gray-600">Loading charts data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-2 md:p-6 pt-4 md:pt-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchChartsData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-2 md:p-6 pt-4 md:pt-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-maternal-blue-700">Charts & Analytics</h2>
        <div className="flex items-center gap-2">
          <Button onClick={fetchChartsData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
        <Card className="bg-white border-0 shadow hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-maternal-blue-700 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-maternal-blue-400" /> Total Charts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-maternal-blue-600">{stats.totalCharts}</div>
            <p className="text-xs text-maternal-blue-400 mt-1">All chart collections</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-maternal-green-700 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-maternal-green-400" /> Active Charts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-maternal-green-600">{stats.activeCharts}</div>
            <p className="text-xs text-maternal-green-400 mt-1">Currently active</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-maternal-brown-700 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-maternal-brown-400" /> Chart Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-maternal-brown-600">
              {stats.chartTypes.bar + stats.chartTypes.line + stats.chartTypes.pie + stats.chartTypes.area}
            </div>
            <p className="text-xs text-maternal-brown-400 mt-1">Bar: {stats.chartTypes.bar}, Line: {stats.chartTypes.line}, Pie: {stats.chartTypes.pie}, Area: {stats.chartTypes.area}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-purple-700 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" /> Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">
              {stats.lastUpdated ? stats.lastUpdated.toLocaleDateString() : "N/A"}
            </div>
            <p className="text-xs text-purple-400 mt-1">Most recent update</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maternal-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {filteredCharts.map((chart) => (
          <Card key={chart.id} className="bg-white border-0 shadow hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-maternal-blue-700">{chart.title}</CardTitle>
                  {chart.description && (
                    <p className="text-sm text-gray-600 mt-1">{chart.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${
                    chart.isActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {chart.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {chart.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chart.data && chart.data.length > 0 ? (
                <div className="space-y-4">
                  {getChartComponent(chart)}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Data points: {chart.data.length}</span>
                    <span>
                      Updated: {chart.lastUpdated?.toDate 
                        ? chart.lastUpdated.toDate().toLocaleDateString()
                        : new Date(chart.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No data available for this chart</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCharts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No charts found</h3>
            <p className="text-muted-foreground">
              {selectedCategory === "all" 
                ? "No charts are available in the database."
                : `No charts found in the "${selectedCategory}" category.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 