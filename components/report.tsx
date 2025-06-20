import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { Badge } from "./ui/badge";
import { AlertTriangle, Users, Calendar, Clock, Search, UserX } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Report {
  id: string;
  clientName: string;
  clientNumber: string;
  createdAt: Timestamp | null;
  description: string;
  facilityName: string;
  isAnonymous: boolean;
  phoneNumber: string;
  reportType: string;
}

export default function ReportList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(collection(db, "report"));
        const fetched: Report[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            clientName: data.clientName || "-",
            clientNumber: data.clientNumber || "-",
            createdAt: data.createdAt || null,
            description: data.description || "-",
            facilityName: data.facilityName || "-",
            isAnonymous: data.isAnonymous ?? true,
            phoneNumber: data.phoneNumber || "-",
            reportType: data.reportType || "-",
          };
        });
        setReports(fetched);
      } catch (err) {
        setError("Failed to fetch reports.");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleRowClick = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const searchFields = [
    { value: "all", label: "All Fields" },
    { value: "clientName", label: "Client Name" },
    { value: "facilityName", label: "Facility" },
    { value: "reportType", label: "Type" },
    { value: "createdAt", label: "Date" },
    { value: "description", label: "Description" },
  ];

  const filteredReports = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    if (!searchTerm.trim()) return reports;

    return reports.filter(r => {
      const checkField = (key: keyof Report) => {
        const value = r[key];
        if (key === 'createdAt' && value instanceof Timestamp) {
          return value.toDate().toLocaleString().toLowerCase().includes(lower);
        }
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lower);
        }
        return false;
      };

      if (searchField === "all") {
        return (
          checkField('clientName') ||
          checkField('clientNumber') ||
          checkField('facilityName') ||
          checkField('reportType') ||
          checkField('description') ||
          checkField('createdAt')
        );
      } else {
        return checkField(searchField as keyof Report);
      }
    });
  }, [reports, searchTerm, searchField]);

  const anonymousReportsCount = useMemo(() => {
    return filteredReports.filter(report => report.isAnonymous).length;
  }, [filteredReports]);

  if (loading) {
    return <div className="py-10 text-center">Loading reports...</div>;
  }
  if (error) {
    return <div className="py-10 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Reports</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            View and manage whistleblower reports submitted by users
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Reports</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{filteredReports.length}</div>
            <p className="text-xs text-white/80">of all reports</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Unique Reporters</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{[...new Set(filteredReports.map(r => r.clientNumber))].length}</div>
            <p className="text-xs text-white/80">Unique IDs</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Anonymous</CardTitle>
            <UserX className="h-3 w-3 sm:h-4 sm:w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{anonymousReportsCount}</div>
            <p className="text-xs text-white/80">Submitted anonymously</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Oldest Report</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {filteredReports.length > 0 && filteredReports[filteredReports.length - 1]?.createdAt
                ? new Date(filteredReports[filteredReports.length - 1]!.createdAt!.seconds * 1000).toLocaleDateString()
                : "-"}
            </div>
            <p className="text-xs text-white/80 truncate">
              {filteredReports.length > 0 && filteredReports[filteredReports.length - 1]?.description || "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={searchField} onValueChange={setSearchField}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            {searchFields.map(field => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>
            Click on any row to view full report details. Showing {filteredReports.length} of {reports.length} reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report: Report) => (
                  <TableRow
                    key={report.id}
                    className="cursor-pointer hover:bg-maternal-green-50 transition"
                    onClick={() => handleRowClick(report)}
                  >
                    <TableCell>{report.clientName}</TableCell>
                    <TableCell>{report.facilityName}</TableCell>
                    <TableCell>{report.reportType}</TableCell>
                    <TableCell>{report.createdAt ? new Date(report.createdAt.seconds * 1000).toLocaleString() : "-"}</TableCell>
                    <TableCell>{report.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredReports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No reports found.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div><strong>Client Name:</strong> {selectedReport.clientName}</div>
              <div><strong>Client Number:</strong> {selectedReport.clientNumber}</div>
              <div><strong>Facility:</strong> {selectedReport.facilityName}</div>
              <div><strong>Type:</strong> {selectedReport.reportType}</div>
              <div><strong>Date:</strong> {selectedReport.createdAt ? new Date(selectedReport.createdAt.seconds * 1000).toLocaleString() : "-"}</div>
              <div><strong>Description:</strong> {selectedReport.description}</div>
              <div><strong>Phone Number:</strong> {selectedReport.phoneNumber}</div>
              <div><strong>Anonymous:</strong> {selectedReport.isAnonymous ? "Yes" : "No"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
