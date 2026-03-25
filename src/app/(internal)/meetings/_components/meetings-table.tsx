"use client";

import { useMemo } from "react";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useDataTable } from "@/components/data-table/_hooks/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { MeetingModel } from "@/prisma/generated/prisma/models/Meeting";
import type { EmailThreadModel } from "@/prisma/generated/prisma/models/EmailThread";
import { Calendar, Clock, Users, Video, ExternalLink, MapPin, Zap } from "lucide-react";
import { UserModel } from "@/prisma/generated/prisma/models/User";
import Link from "next/link";
import { MeetingSource } from "@/prisma/generated/prisma/enums";
import { cn } from "@/lib/utils";

type MeetingWithThread = MeetingModel & {
  user: Pick<UserModel, "id" | "name" | "email" | "image">;
  emailThread: Pick<EmailThreadModel, "id" | "subject" | "threadId"> | null;
};

interface MeetingsTableProps {
  meetingsPromise: Promise<{
    data: MeetingWithThread[];
    pageCount: number;
  }>;
}

const MEETING_SOURCE_LABELS = {
  [MeetingSource.email_thread]: "Email Thread",
  [MeetingSource.chat_assistant]: "Chat Assistant",
};

export function MeetingsTable({ meetingsPromise }: MeetingsTableProps) {
  "use no memo";
  const { data: meetings, pageCount } = React.use(meetingsPromise);

  const columns = useMemo<ColumnDef<MeetingWithThread>[]>(
    () => [
      {
        id: "title",
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Meeting" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/meetings/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.getValue("title")}
          </Link>
        ),
        meta: {
          label: "Meeting",
          placeholder: "Search meetings...",
          variant: "text",
        },
        enableColumnFilter: true,
      },
      {
        id: "date",
        accessorKey: "startTime",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Date" />
        ),
        cell: ({ row }) => {
          const startTime = row.original.startTime;
          return (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(startTime), "MMM d, yyyy")}
              </span>
            </div>
          );
        },
      },
      {
        id: "time",
        accessorKey: "startTime",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Time" />
        ),
        cell: ({ row }) => {
          const startTime = row.original.startTime;
          const endTime = row.original.endTime;
          const timezone = row.original.timezone;

          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs">
                  {format(new Date(startTime), "h:mm a")} -{" "}
                  {format(new Date(endTime), "h:mm a")}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{timezone}</span>
            </div>
          );
        },
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
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{participants.length} attendees</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {participants.slice(0, 2).map((email, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-muted-foreground truncate max-w-[200px]"
                  >
                    {email}
                  </span>
                ))}
                {participants.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{participants.length - 2} more
                  </span>
                )}
              </div>
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
          return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
        },
        meta: {
          label: "Status",
          variant: "multiSelect",
          options: [
            { label: "Proposed", value: "proposed" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "source",
        accessorKey: "source",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Source" />
        ),
        cell: ({ row }) => {
          const source = row.getValue<MeetingSource>("source");
          return (
            <Badge variant="outline">{MEETING_SOURCE_LABELS[source]}</Badge>
          );
        },
      },
      {
        id: "meetingLink",
        header: "Meeting Link",
        cell: ({ row }) => {
          const meetingLink = row.original.meetingLink;
          return meetingLink ? (
            <Button asChild variant="ghost" size="sm" className="h-8 px-2">
              <Link
                href={meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Video className="h-4 w-4 mr-1" />
                Join
              </Link>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">No link</span>
          );
        },
      },
    ],
    []
  );

  const { table } = useDataTable({
    data: meetings,
    columns,
    pageCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    shallow: false,
    getRowId: (row: MeetingWithThread) => row.id,
  });

  return (
    <div className="space-y-4">
      <DataTable 
        table={table}
        renderCustomRow={(row) => {
          const meeting = row.original;
          const status = meeting.status;
          
          return (
            <Link
              href={`/meetings/${meeting.id}`}
              className="block group"
            >
              <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <Calendar className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 shadow-sm",
                        status === "confirmed" ? "bg-green-500/10 border-green-500/20" : 
                        status === "cancelled" ? "bg-destructive/10 border-destructive/20" :
                        "bg-primary/10 border-primary/20"
                      )}>
                        <Calendar className={cn(
                          "h-6 w-6",
                          status === "confirmed" ? "text-green-500" : 
                          status === "cancelled" ? "text-destructive" :
                          "text-primary"
                        )} />
                      </div>
                      <div>
                        <h3 className="text-xl font-tech font-bold tracking-tight truncate group-hover:text-primary transition-colors">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="font-tech text-[9px] tracking-widest px-2 py-0 border-primary/20 text-primary/70 bg-primary/5">
                            {MEETING_SOURCE_LABELS[meeting.source].toUpperCase()}
                          </Badge>
                          {meeting.meetingLink && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                              <Video className="h-3 w-3" />
                              Remote Session
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/40 group-hover:bg-background transition-colors">
                        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border/60 group-hover:border-primary/30 transition-colors">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-tech uppercase tracking-tighter opacity-60">Schedule</p>
                          <p className="text-xs font-bold text-foreground">
                            {format(new Date(meeting.startTime), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/40 group-hover:bg-background transition-colors">
                        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border/60 group-hover:border-primary/30 transition-colors">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-tech uppercase tracking-tighter opacity-60">Attendees</p>
                          <p className="text-xs font-bold text-foreground">
                            {meeting.participants.length} Participant{meeting.participants.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/40 group-hover:bg-background transition-colors">
                        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border/60 group-hover:border-primary/30 transition-colors">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-tech uppercase tracking-tighter opacity-60">Status</p>
                          <p className={cn(
                            "text-xs font-bold uppercase tracking-widest",
                            status === "confirmed" ? "text-green-500" : 
                            status === "cancelled" ? "text-destructive" :
                            "text-primary"
                          )}>
                            {status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 shrink-0">
                    {meeting.meetingLink && (
                      <Button 
                        asChild 
                        size="sm" 
                        className="font-tech text-[10px] tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 px-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                          JOIN SESSION
                        </Link>
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-tech text-[10px] tracking-widest px-6 border-border/60 hover:bg-muted/50 transition-all"
                    >
                      VIEW DETAILS
                    </Button>
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
    case "proposed":
      return "secondary";
    case "confirmed":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}
