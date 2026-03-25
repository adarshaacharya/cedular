"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useDataTable } from "@/components/data-table/_hooks/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Eye, Mail, Users, Zap, Calendar } from "lucide-react";
import type { EmailThreadModel } from "@/prisma/generated/prisma/models/EmailThread";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ThreadsTableProps {
  threadsPromise: Promise<{
    data: EmailThreadModel[];
    pageCount: number;
  }>;
}

export function ThreadsTable({ threadsPromise }: ThreadsTableProps) {
  "use no memo";
  const { data: threads, pageCount } = React.use(threadsPromise);
  const router = useRouter();

  const columns = useMemo<ColumnDef<EmailThreadModel>[]>(
    () => [
      {
        id: "subject",
        accessorKey: "subject",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Subject" />
        ),
        cell: ({ row }) => (
          <Link
            className="font-medium hover:underline hover:text-blue-500 cursor-pointer"
            href={`/email-threads/${row.original.id}`}
          >
            {row.getValue("subject") || "No subject"}
          </Link>
        ),
        meta: {
          label: "Subject",
          placeholder: "Search subjects...",
          variant: "text",
        },
        enableColumnFilter: true,
      },
      {
        id: "participants",
        accessorKey: "participants",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Participants" />
        ),
        cell: ({ row }) => {
          const participants = row.getValue<string[]>("participants");
          return (
            <div className="flex flex-col gap-1">
              {participants.slice(0, 2).map((email, idx) => (
                <span key={idx} className="text-sm text-muted-foreground">
                  {email}
                </span>
              ))}
              {participants.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{participants.length - 2} more
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue<string>("status");
          return (
            <Badge variant={getStatusVariant(status)}>
              {formatEnumLabel(status)}
            </Badge>
          );
        },
        meta: {
          label: "Status",
          variant: "multiSelect",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Processing", value: "processing" },
            { label: "Scheduled", value: "scheduled" },
            { label: "Awaiting Confirmation", value: "awaiting_confirmation" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Failed", value: "failed" },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "intent",
        accessorKey: "intent",
        header: "Intent",
        cell: ({ row }) => {
          const intent = row.getValue<string | null>("intent");
          return intent ? (
            <Badge variant="outline">{intent}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Created" />
        ),
        cell: ({ row }) => {
          const date = row.getValue<Date>("createdAt");
          return (
            <span className="text-muted-foreground">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/email-threads/${row.original.id}`)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View thread details</span>
          </Button>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [router]
  );

  const { table } = useDataTable({
    data: threads,
    columns,
    pageCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    shallow: false,
    getRowId: (row: EmailThreadModel) => row.id,
  });

  return (
    <div className="space-y-4">
      <DataTable 
        table={table}
        renderCustomRow={(row) => {
          const thread = row.original;
          const status = thread.status;
          
          return (
            <Link
              href={`/email-threads/${thread.id}`}
              className="block group"
            >
              <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <Mail className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110",
                        status === "confirmed" ? "bg-green-500/10 border-green-500/20" : 
                        status === "failed" ? "bg-destructive/10 border-destructive/20" :
                        "bg-primary/10 border-primary/20"
                      )}>
                        <Mail className={cn(
                          "h-5 w-5",
                          status === "confirmed" ? "text-green-500" : 
                          status === "failed" ? "text-destructive" :
                          "text-primary"
                        )} />
                      </div>
                      <div>
                        <h3 className="text-lg font-tech font-bold tracking-tight truncate group-hover:text-primary transition-colors">
                          {thread.subject || "No Subject"}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span className="font-tech text-[10px] tracking-widest uppercase opacity-70">SESSION ID:</span>
                          <span className="font-mono">{thread.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          {thread.participants.length} Participants
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                        <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-tighter">
                          {thread.intent || "Analyzing..."}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          {formatDistanceToNow(thread.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <Badge 
                      variant={getStatusVariant(status)}
                      className="font-tech text-[10px] tracking-[0.1em] px-3 py-1 uppercase border-none"
                    >
                      {formatEnumLabel(status)}
                    </Badge>
                    <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        }}
      >
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "scheduled":
      return "default";
    case "awaiting_confirmation":
      return "outline";
    case "confirmed":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word
    )
    .join(" ");
}
