"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Sparkles,
  RefreshCw,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface UsageRecord {
  id: string;
  date: string;
  action: string;
  actionLabel: string;
  creditsUsed: number;
  reviewPreview: string | null;
  reviewId: string | null;
  platform: string | null;
  reviewerName: string | null;
  toneUsed: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsageData {
  records: UsageRecord[];
  pagination: Pagination;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getActionIcon(action: string) {
  switch (action) {
    case "GENERATE_RESPONSE":
      return <Sparkles className="h-4 w-4 text-blue-500" />;
    case "REGENERATE":
      return <RefreshCw className="h-4 w-4 text-purple-500" />;
    case "REFUND":
      return <Undo2 className="h-4 w-4 text-green-500" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
}

function getActionBadgeVariant(action: string) {
  switch (action) {
    case "GENERATE_RESPONSE":
      return "default";
    case "REGENERATE":
      return "secondary";
    case "REFUND":
      return "outline";
    default:
      return "default";
  }
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchUsage = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (actionFilter && actionFilter !== "all") {
        params.append("action", actionFilter);
      }
      if (startDate) {
        params.append("startDate", new Date(startDate).toISOString());
      }
      if (endDate) {
        params.append("endDate", new Date(endDate).toISOString());
      }

      const response = await fetch(`/api/credits/usage?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error?.message || "Failed to load usage history");
      }
    } catch {
      toast.error("Unable to connect to server");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, actionFilter, startDate, endDate]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const handleExportCSV = () => {
    if (!data || data.records.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Build CSV content
    const headers = ["Date", "Action", "Credits Used", "Platform", "Reviewer", "Review Preview"];
    const rows = data.records.map((record) => [
      format(new Date(record.date), "yyyy-MM-dd HH:mm:ss"),
      record.actionLabel,
      record.creditsUsed.toString(),
      record.platform || "",
      record.reviewerName || "",
      record.reviewPreview?.replace(/"/g, '""') || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `credit-usage-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast.success("Usage history exported");
  };

  const handleClearFilters = () => {
    setActionFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters = actionFilter !== "all" || startDate || endDate;

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credit Usage History</h1>
          <p className="text-muted-foreground">
            View your credit usage and response generation history
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">Action Type</label>
              <Select value={actionFilter} onValueChange={(value) => {
                setActionFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="GENERATE_RESPONSE">Generate Response</SelectItem>
                  <SelectItem value="REGENERATE">Regenerate Response</SelectItem>
                  <SelectItem value="REFUND">Credit Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-[180px] pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-[180px] pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 justify-end">
              <label className="text-sm text-muted-foreground invisible">Export</label>
              <Button variant="outline" onClick={handleExportCSV} disabled={isLoading || !data?.records.length}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Records</CardTitle>
          <CardDescription>
            {data?.pagination.totalCount
              ? `Showing ${(data.pagination.page - 1) * data.pagination.limit + 1}-${Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)} of ${data.pagination.totalCount} records`
              : "No records found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              ))}
            </div>
          ) : data?.records && data.records.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead className="hidden sm:table-cell">Review Preview</TableHead>
                      <TableHead className="hidden md:table-cell">Tone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {formatTimeAgo(record.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(record.action)}
                            <Badge variant={getActionBadgeVariant(record.action) as "default" | "secondary" | "outline"}>
                              {record.actionLabel}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={record.creditsUsed < 0 ? "text-green-600" : ""}>
                            {record.creditsUsed > 0 ? `-${record.creditsUsed}` : `+${Math.abs(record.creditsUsed)}`}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell max-w-[200px]">
                          {record.reviewPreview ? (
                            <Link
                              href={`/dashboard/reviews/${record.reviewId}`}
                              className="text-sm text-muted-foreground hover:text-foreground truncate block"
                            >
                              {record.reviewPreview}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {record.toneUsed ? (
                            <Badge variant="outline" className="capitalize text-xs">
                              {record.toneUsed}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!data.pagination.hasPrevPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!data.pagination.hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No usage records yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your credit usage history will appear here once you start generating responses.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/reviews">
                  View Reviews
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
