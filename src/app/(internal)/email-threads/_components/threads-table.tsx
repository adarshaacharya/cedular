"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useDataTable } from "@/components/data-table/_hooks/use-data-table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { EmailThreadModel } from "@/prisma/generated/prisma/models/EmailThread";
import React from "react";

interface ThreadsTableProps {
  threadsPromise: Promise<EmailThreadModel[]>;
}

export function ThreadsTable({ threadsPromise }: ThreadsTableProps) {
  const threads = React.use(threadsPromise);

  const columns = useMemo<ColumnDef<EmailThreadModel>[]>(
    () => [
      {
        id: "subject",
        accessorKey: "subject",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Subject" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {row.getValue("subject") || "No subject"}
          </div>
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
          return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
        },
        meta: {
          label: "Status",
          variant: "multiSelect",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Processing", value: "processing" },
            { label: "Scheduled", value: "scheduled" },
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
    ],
    []
  );

  const { table } = useDataTable({
    data: threads,
    columns,
    pageCount: 1,
    getRowId: (row: EmailThreadModel) => row.id,
  });

  return (
    <div className="p-10">
      <DataTable table={table}>
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
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}
