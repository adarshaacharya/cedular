"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ThreadsTableSkeleton() {
  return (
    <div className="p-10">
      {/* Toolbar skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>

      {/* Table header skeleton */}
      <div className="border rounded-md">
        <div className="border-b p-4">
          <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Table rows skeleton */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="border-b p-4 last:border-b-0">
            <div className="grid grid-cols-5 gap-4">
              {/* Subject */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full max-w-xs" />
                <Skeleton className="h-3 w-3/4 max-w-xs" />
              </div>

              {/* Participants */}
              <div className="space-y-1">
                <Skeleton className="h-3 w-full max-w-sm" />
                <Skeleton className="h-3 w-2/3 max-w-sm" />
              </div>

              {/* Status */}
              <Skeleton className="h-6 w-16" />

              {/* Intent */}
              <Skeleton className="h-6 w-20" />

              {/* Created At */}
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
