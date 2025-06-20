"use client"

import { useState, useEffect } from "react"
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
import { db } from "../lib/firebase"
import { addDoc, collection, serverTimestamp, Timestamp, getDocs, query, orderBy } from "firebase/firestore"

interface Notification {
  id: string;
  title: string;
  message: string;
  targetCategories: string[];
  type: 'broadcast' | 'appointment_reminder';
  status: 'sent' | 'pending' | 'delivered' | 'failed';
  createdAt: Timestamp;
  scheduledAt: Timestamp | null;
  recipient?: string; 
}

// Sample data for notifications (will be replaced by Firestore data)
const recentNotifications: Notification[] = []

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
  { id: "high_risk", name: "High Risk", count: 5 },
]

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreateBroadcastOpen, setIsCreateBroadcastOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const isMobile = useIsMobile()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedNotifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification));
        setNotifications(fetchedNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to fetch notifications. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const notificationStats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    delivered: notifications.filter(n => n.status === 'delivered').length,
  };

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

  const handleSendBroadcast = async () => {
    if (!broadcastForm.message || broadcastForm.categories.length === 0) {
      alert("Please provide a message and select at least one category.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newBroadcast: {
        title: string;
        message: string;
        targetCategories: string[];
        type: string;
        status: string;
        createdAt: any; // Using any for serverTimestamp
        scheduledAt: Timestamp | null;
      } = {
        title: broadcastForm.title,
        message: broadcastForm.message,
        targetCategories: broadcastForm.categories,
        type: 'broadcast',
        status: broadcastForm.scheduleType === 'later' ? 'pending' : 'sent',
        createdAt: serverTimestamp(),
        scheduledAt: null,
      };

      if (broadcastForm.scheduleType === 'later' && broadcastForm.scheduleDate && broadcastForm.scheduleTime) {
        const scheduleDateTime = new Date(`${broadcastForm.scheduleDate}T${broadcastForm.scheduleTime}`);
        newBroadcast.scheduledAt = Timestamp.fromDate(scheduleDateTime);
      }
      
      await addDoc(collection(db, "notifications"), newBroadcast);
      
      console.log("Broadcast successfully created!");
      setIsCreateBroadcastOpen(false);
      setBroadcastForm({
        title: "",
        message: "",
        categories: [] as string[],
        scheduleType: "now",
        scheduleDate: "",
        scheduleTime: "",
        template: "",
      });
    } catch (error) {
      console.error("Error creating broadcast:", error);
      alert("Failed to create broadcast. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const recipientName = notification.targetCategories.join(', ') || 'N/A';
    const matchesSearch =
      recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase());
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

  const renderNotificationList = () => {
    if (loading) {
      return (
        <div className="text-center p-8">
          <p>Loading notifications...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 text-red-600">
          <p>{error}</p>
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <div className="text-center p-8 border-2 border-dashed rounded-lg mt-4">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Notifications Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? "Try adjusting your search or filter."
              : "Create a new broadcast message to get started."}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                {getTypeIcon(notification.type)}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{notification.title || "Broadcast Message"}</p>
                  <Badge variant={getStatusColor(notification.status) as any}>{notification.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-4">
                  <span>To: {notification.targetCategories.join(", ")}</span>
                  <span>|</span>
                  <span>
                    {notification.createdAt
                      ? new Date(notification.createdAt.seconds * 1000).toLocaleString()
                      : "No date"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

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
                  <Button onClick={handleSendBroadcast} className="w-full sm:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {broadcastForm.scheduleType === "now" ? "Send Now" : "Schedule Message"}
                      </>
                    )}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-100 border-blue-200 text-blue-900 transition-all hover:bg-blue-200/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : notificationStats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-100 border-green-200 text-green-900 transition-all hover:bg-green-200/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Sent</CardTitle>
            <Send className="h-4 w-4 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : notificationStats.sent}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-100 border-amber-200 text-amber-900 transition-all hover:bg-amber-200/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : notificationStats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-sky-100 border-sky-200 text-sky-900 transition-all hover:bg-sky-200/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sky-800">Delivered</CardTitle>
            <Bell className="h-4 w-4 text-sky-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : notificationStats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Statistics Cards */}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Notifications</CardTitle>
              <CardDescription className="text-sm">Latest sent and scheduled notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1">
                          <Badge variant={getStatusColor(notification.status) as any} className="w-fit">
                            {notification.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {notification.createdAt ? new Date(notification.createdAt.seconds * 1000).toLocaleString() : "No date"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Most Recent Notification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Most Recent Notification</CardTitle>
              <CardDescription className="text-sm">Details of the latest notification</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">{getTypeIcon(notifications[0].type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{notifications[0].title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notifications[0].message}</p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1">
                        <Badge variant={getStatusColor(notifications[0].status) as any} className="w-fit">
                          {notifications[0].status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {notifications[0].createdAt ? new Date(notifications[0].createdAt.seconds * 1000).toLocaleString() : "No date"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-4">
                      <span>To: {notifications[0].targetCategories.join(", ")}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">No notifications found.</div>
              )}
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
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
              {renderNotificationList()}
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
