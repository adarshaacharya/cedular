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
import { Calendar, Clock, Users, Video } from "lucide-react";
import { UserModel } from "@/prisma/generated/prisma/models/User";
import Link from "next/link";
import { MeetingSource } from "@/prisma/generated/prisma/enums";

type MeetingWithThread = MeetingModel & {
  user: Pick<UserModel, "id" | "name" | "email" | "image">;
  emailThread: Pick<EmailThreadModel, "id" | "subject" | "threadId"> | null;
};

interface MeetingsTableProps {
  meetingsPromise: Promise<MeetingWithThread[]>;
}

const MEETING_SOURCE_LABELS = {
  [MeetingSource.email_thread]: "Email Thread",
  [MeetingSource.chat_assistant]: "Chat Assistant",
};

export function MeetingsTable({ meetingsPromise }: MeetingsTableProps) {
  const meetings = React.use(meetingsPromise);

  const columns = useMemo<ColumnDef<MeetingWithThread>[]>(
    () => [
      {
        id: "title",
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Meeting" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{row.getValue("title")}</span>
            {row.original.description && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {row.original.description}
              </span>
            )}
          </div>
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
        id: "calendarSync",
        accessorKey: "calendarEventId",
        header: "Calendar",
        cell: ({ row }) => {
          const calendarEventId = row.getValue<string | null>("calendarSync");
          return calendarEventId ? (
            <Badge variant="outline" className="text-green-600">
              Synced
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Not synced</span>
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
    pageCount: 1,
    getRowId: (row: MeetingWithThread) => row.id,
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
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
