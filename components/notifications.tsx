"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, MessageSquare, Search, Plus, Eye, Trash2, Settings, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "../lib/firebase"
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy, Timestamp } from "firebase/firestore"
import { Toaster, toast } from 'sonner'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Notification {
  id: string;
  title: string;
  message: string;
  targetCategories: string[];
  type: 'notification' | 'system_update' | 'emergency' ;
  status: 'sent' | 'pending' | 'delivered' | 'failed';
  createdAt: Timestamp;
  scheduledAt: Timestamp | null;
  trimester?: 'first' | 'second' | 'third' | 'all';
  visit?: number;
  weeks?: number;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scheduleNow, setScheduleNow] = useState(true)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")

  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    setLoading(true);
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
      toast.error("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Notification deleted successfully.");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification.");
    }
  };

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };
  
  const handleSave = async () => {
    if (!selectedNotification) return;

    const isNewNotification = !selectedNotification.id;

    setIsSubmitting(true);
    try {
      if(isNewNotification) {
        const { id, ...newNotification } = selectedNotification;
        const notificationData = {
          ...newNotification,
          createdAt: serverTimestamp(),
          createdBy: "admin", // Replace with actual user ID from auth
          isRead: false // Add isRead field
        };
        await addDoc(collection(db, "notifications"), notificationData);
        toast.success("Notification created successfully.");
      } else {
        const { id, createdAt, ...dataToUpdate } = selectedNotification;
        await updateDoc(doc(db, "notifications", id), {
          ...dataToUpdate,
          updatedAt: serverTimestamp(),
          updatedBy: "admin", // Replace with actual user ID from auth
        });
        toast.success("Notification updated successfully.");
      }
      
      setIsModalOpen(false);
      fetchNotifications(); 
    } catch (error) {
      console.error("Error saving notification:", error);
      toast.error("Failed to save notification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || notification.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return <Badge variant="default">Sent</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'delivered': return <Badge variant="outline">Delivered</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment_reminder":
        return <Calendar className="h-4 w-4" />
      case "notification":
        return <Bell className="h-4 w-4" />
      case "system_update":
        return <Settings className="h-4 w-4" />
      case "emergency":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <>
    <Toaster richColors />
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Manage and send notifications to patients.</p>
          </div>
          <Button onClick={() => {
            setSelectedNotification({
              id: '',
              title: '',
              message: '',
              targetCategories: [],
              type: 'notification',
              status: 'pending',
              createdAt: Timestamp.now(),
              scheduledAt: null,
            })
            setIsModalOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Notification
          </Button>
        </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredNotifications.map(n => (
                <TableRow key={n.id} onClick={() => handleView(n)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-xs">{n.message}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-2">
                      {getTypeIcon(n.type)}
                      {n.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(n.status)}</TableCell>
                  <TableCell>{n.createdAt.toDate().toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.id ? 'Edit Notification' : 'Create Notification'}</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={selectedNotification.title}
                  onChange={(e) => setSelectedNotification({ ...selectedNotification, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={selectedNotification.message}
                  onChange={(e) => setSelectedNotification({ ...selectedNotification, message: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trimester">Trimester</Label>
                  <Select
                    value={selectedNotification.trimester}
                    onValueChange={(value) => setSelectedNotification({ ...selectedNotification, trimester: value as Notification['trimester'] })}
                  >
                    <SelectTrigger id="trimester"><SelectValue placeholder="Select Trimester" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Trimesters</SelectItem>
                      <SelectItem value="first">First</SelectItem>
                      <SelectItem value="second">Second</SelectItem>
                      <SelectItem value="third">Third</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weeks">Weeks</Label>
                  <Select
                    value={String(selectedNotification.weeks || '')}
                    onValueChange={(value) => setSelectedNotification({ ...selectedNotification, weeks: Number(value) })}
                  >
                    <SelectTrigger id="weeks"><SelectValue placeholder="Select Week" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 42 }, (_, i) => i + 1).map(week => (
                        <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <Label htmlFor="visit">Visit</Label>
                  <Select
                    value={String(selectedNotification.visit || '')}
                    onValueChange={(value) => setSelectedNotification({ ...selectedNotification, visit: Number(value) })}
                  >
                    <SelectTrigger id="visit"><SelectValue placeholder="Select Visit" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 8 }, (_, i) => i + 1).map(visit => (
                        <SelectItem key={visit} value={String(visit)}>Visit {visit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={selectedNotification.type}
                    onValueChange={(value) => setSelectedNotification({ ...selectedNotification, type: value as Notification['type'] })}
                  >
                    <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="system_update">System Update</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Switch id="schedule-switch" checked={!scheduleNow} onCheckedChange={(checked) => setScheduleNow(!checked)} />
                    <Label htmlFor="schedule-switch">Schedule for later</Label>
                </div>
                {!scheduleNow && (
                    <div className="grid grid-cols-2 gap-4 pl-8 pt-2">
                        <div>
                            <Label htmlFor="schedule-date">Date</Label>
                            <Input id="schedule-date" type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="schedule-time">Time</Label>
                            <Input id="schedule-time" type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                        </div>
                    </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                {selectedNotification.id && (
                  <Button variant="destructive" onClick={() => handleDelete(selectedNotification.id)} disabled={isSubmitting}>
                    Delete
                  </Button>
                )}
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (selectedNotification.id ? 'Save Changes' : 'Create Notification')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
