"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHistoryDialogProps {
  trigger?: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function ChatHistoryDialog({
  trigger,
  content,
  className,
}: ChatHistoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button
            className={cn(
              "flex items-center py-2 text-sm rounded-md hover:bg-accent transition-colors",
              className
            )}
          >
            History
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="min-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" />
            Chat History
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">{content}</div>
      </DialogContent>
    </Dialog>
  );
}
