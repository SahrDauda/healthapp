"use client"

import { useState } from "react"
import { Bell, Send, Calendar, Clock, Plus, Settings, MessageSquare, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useIsMobile } from "@/hooks/use-mobile"

// Sample data for notifications
const recentNotifications = [
  {
    id: "1",
    type: "appointment_reminder",
    recipient: "Emma Thompson",
    message: "Reminder: You have a prenatal check-up tomorrow at 10:00 AM",
    status: "sent",
    sentAt: "2024-01-25 09:00 AM",
    scheduledFor: "2024-01-26 10:00 AM",
  },
  {
    id: "2",
    type: "broadcast",
    recipient: "All High Risk Patients",
    message: "Important: Please ensure you're taking your prescribed medications daily",
    status: "delivered",
    sentAt: "2024-01-24 02:00 PM",
    scheduledFor: "2024-01-24 02:00 PM",
  },
  {
    id: "3",
    type: "appointment_reminder",
    recipient: "Maria Rodriguez",
    message: "Reminder: You have an ultrasound appointment in 2 days",
    status: "pending",
    sentAt: null,
    scheduledFor: "2024-01-27 11:00 AM",
  },
]

const broadcastTemplates = [
  {
    id: "1",
    name: "Appointment Reminder",
    category: "appointment",
    message: "Reminder: You have an appointment on {date} at {time}. Please arrive 15 minutes early.",
  },
  {
    id: "2",
    name: "Medication Reminder",
    category: "health",
    message: "Don't forget to take your prenatal vitamins and prescribed medications daily.",
  },
  {
    id: "3",
    name: "Health Tips",
    category: "education",
    message: "Remember to stay hydrated, eat nutritious meals, and get adequate rest during your pregnancy.",
  },
]

const patientCategories = [
  { id: "all", name: "All Patients", count: 30 },
  { id: "first_trimester", name: "First Trimester", count: 8 },
  { id: "second_trimester", name: "Second Trimester", count: 12 },
  { id: "third_trimester", name: "Third Trimester", count: 6 },
  { id: "postpartum", name: "Postpartum", count: 4 },
  { id: "high_risk", name: "High Risk", count: 5 },
  { id: "due_soon", name: "Due Within 30 Days", count: 3 },
]

export function Notifications() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreateBroadcastOpen, setIsCreateBroadcastOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const isMobile = useIsMobile()

  // Broadcast message form state
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    categories: [] as string[],
    scheduleType: "now",
    scheduleDate: "",
    scheduleTime: "",
    template: "",
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    appointmentReminders: true,
    reminderTiming: "24", // hours before
    smsEnabled: true,
    emailEnabled: true,
    autoReminders: true,
    broadcastEnabled: true,
  })

  const handleCategoryToggle = (categoryId: string) => {
    setBroadcastForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }))
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = broadcastTemplates.find((t) => t.id === templateId)
    if (template) {
      setBroadcastForm((prev) => ({
        ...prev,
        message: template.message,
        template: templateId,
      }))
    }
  }

  const handleSendBroadcast = () => {
    // Implementation for sending broadcast
    console.log("Sending broadcast:", broadcastForm)
    setIsCreateBroadcastOpen(false)
    setBroadcastForm({
      title: "",
      message: "",
      categories: [],
      scheduleType: "now",
      scheduleDate: "",
      scheduleTime: "",
      template: "",
    })
  }

  const filteredNotifications = recentNotifications.filter((notification) => {
    const matchesSearch =
      notification.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || notification.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "default"
      case "delivered":
        return "outline"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment_reminder":
        return <Calendar className="h-4 w-4" />
      case "broadcast":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage appointment reminders and broadcast messages
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isCreateBroadcastOpen} onOpenChange={setIsCreateBroadcastOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Broadcast Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Message Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Message Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter message title"
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template">Use Template (Optional)</Label>
                    <Select value={broadcastForm.template} onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {broadcastTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message Content</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message here..."
                      rows={4}
                      value={broadcastForm.message}
                      onChange={(e) => setBroadcastForm((prev) => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Patient Categories */}
                <div>
                  <Label>Select Patient Categories</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {patientCategories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={broadcastForm.categories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <Label htmlFor={category.id} className="flex-1 cursor-pointer">
                          {category.name}
                          <span className="text-muted-foreground ml-1">({category.count})</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheduling */}
                <div>
                  <Label>Schedule Message</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="send-now"
                        name="schedule"
                        value="now"
                        checked={broadcastForm.scheduleType === "now"}
                        onChange={(e) => setBroadcastForm((prev) => ({ ...prev, scheduleType: e.target.value }))}
                      />
                      <Label htmlFor="send-now">Send Now</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="schedule-later"
                        name="schedule"
                        value="later"
                        checked={broadcastForm.scheduleType === "later"}
                        onChange={(e) => setBroadcastForm((prev) => ({ ...prev, scheduleType: e.target.value }))}
                      />
                      <Label htmlFor="schedule-later">Schedule for Later</Label>
                    </div>
                    {broadcastForm.scheduleType === "later" && (
                      <div className="grid grid-cols-2 gap-3 ml-6">
                        <div>
                          <Label htmlFor="schedule-date">Date</Label>
                          <Input
                            id="schedule-date"
                            type="date"
                            value={broadcastForm.scheduleDate}
                            onChange={(e) => setBroadcastForm((prev) => ({ ...prev, scheduleDate: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="schedule-time">Time</Label>
                          <Input
                            id="schedule-time"
                            type="time"
                            value={broadcastForm.scheduleTime}
                            onChange={(e) => setBroadcastForm((prev) => ({ ...prev, scheduleTime: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateBroadcastOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendBroadcast} className="w-full sm:w-auto">
                    <Send className="h-4 w-4 mr-2" />
                    {broadcastForm.scheduleType === "now" ? "Send Now" : "Schedule Message"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Automatically send appointment reminders</p>
                    </div>
                    <Switch
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, appointmentReminders: checked }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Reminder Timing</Label>
                    <Select
                      value={notificationSettings.reminderTiming}
                      onValueChange={(value) => setNotificationSettings((prev) => ({ ...prev, reminderTiming: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 hours before</SelectItem>
                        <SelectItem value="24">24 hours before</SelectItem>
                        <SelectItem value="48">48 hours before</SelectItem>
                        <SelectItem value="72">72 hours before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsEnabled}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, smsEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailEnabled}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, emailEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Broadcast Messages</Label>
                      <p className="text-sm text-muted-foreground">Enable broadcast messaging feature</p>
                    </div>
                    <Switch
                      checked={notificationSettings.broadcastEnabled}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, broadcastEnabled: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => setIsSettingsOpen(false)}>Save Settings</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Sent</CardTitle>
                <Send className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Delivery Rate</CardTitle>
                <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground">Success rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Pending delivery</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Active Reminders</CardTitle>
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Auto-scheduled</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Notifications</CardTitle>
              <CardDescription className="text-sm">Latest sent and scheduled notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{notification.recipient}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1">
                          <Badge variant={getStatusColor(notification.status) as any} className="w-fit">
                            {notification.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {notification.sentAt || `Scheduled for ${notification.scheduledFor}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 sm:space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Notification History</CardTitle>
              <CardDescription className="text-sm">
                Complete history of all notifications. Showing {filteredNotifications.length} results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{notification.recipient}</p>
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <div className="text-xs text-muted-foreground">
                            {notification.sentAt
                              ? `Sent: ${notification.sentAt}`
                              : `Scheduled: ${notification.scheduledFor}`}
                          </div>
                        </div>
                        <Badge variant={getStatusColor(notification.status) as any} className="w-fit">
                          {notification.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Message Templates</h3>
              <p className="text-sm text-muted-foreground">Pre-defined templates for common notifications</p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4 sm:gap-6">
            {broadcastTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="w-fit mt-1">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Edit
                      </Button>
                      <Button size="sm" className="w-full sm:w-auto">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
