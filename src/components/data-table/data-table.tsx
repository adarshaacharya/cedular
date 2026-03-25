
import {
  flexRender,
  type Table as TanstackTable,
  type Row,
} from "@tanstack/react-table";
import type * as React from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles } from "@/components/data-table/_lib/data-table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  onRowClick?: (row: Row<TData>) => void;
  renderCustomRow?: (row: Row<TData>) => React.ReactNode;
}

export function DataTable<TData>({
  table,
  actionBar,
  onRowClick,
  renderCustomRow,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  "use no memo";
  return (
    <div
      className={cn("flex w-full flex-col gap-4 overflow-auto", className)}
      {...props}
    >
      {children}
      
      {renderCustomRow ? (
        <div className="grid gap-4 w-full">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div key={row.id}>
                {renderCustomRow(row)}
              </div>
            ))
          ) : (
            <div className="h-24 flex items-center justify-center border rounded-xl bg-muted/5 text-muted-foreground font-tech text-xs tracking-widest">
              NO RESULTS FOUND
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/40">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="font-tech text-[10px] uppercase tracking-widest text-muted-foreground h-10"
                      style={{
                        ...getCommonPinningStyles({ column: header.column }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-border/40 transition-colors",
                      onRowClick ? "cursor-pointer hover:bg-muted/30" : "hover:bg-muted/10"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-4"
                        style={{
                          ...getCommonPinningStyles({ column: cell.column }),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center font-tech text-xs tracking-widest text-muted-foreground"
                  >
                    NO RESULTS FOUND
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <div className="flex flex-col gap-2.5 mt-2">
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
