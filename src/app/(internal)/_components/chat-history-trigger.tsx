import { Suspense } from "react";
import { ChatHistoryDialog } from "@/app/(internal)/chat/_components/chat-history-dialog";
import { ChatHistoryList } from "@/app/(internal)/chat/_components/chat-history-list";
import { Loader2 } from "lucide-react";

function ChatHistoryLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function ChatHistoryTrigger({ className }: { className?: string }) {
  return (
    <ChatHistoryDialog
      className={className}
      content={
        <Suspense fallback={<ChatHistoryLoading />}>
          <ChatHistoryList />
        </Suspense>
      }
    />
  );
}
