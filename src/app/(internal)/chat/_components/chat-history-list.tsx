import { getUserChats } from "@/services/chat-store";
import { UIMessage } from "ai";
import Link from "next/link";
import { MessageCircle, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export async function ChatHistoryList() {
  const chats = await getUserChats();

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageCircle className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No chat history yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation to see your chat history here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {chats.map((chat) => {
        const firstMessage = chat.messages[0];
        const messageContent = firstMessage?.content as unknown as UIMessage;
        const firstMessageText =
          messageContent?.parts
            ?.find((part) => part.type === "text")
            ?.text?.slice(0, 100) || "New conversation";

        return (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className="block p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <MessageCircle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2">
                  {firstMessageText}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(chat.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
