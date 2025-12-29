import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Chat } from "@/app/(internal)/chat/_components/chat";
import { loadChat } from "@/services/chat-store";

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <ChatPage params={props.params} />
    </Suspense>
  );
}

async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const messages = await loadChat(id);

  if (messages === null) {
    // Chat doesn't exist - show 404
    notFound();
  }

  return <Chat key={id} id={id} initialMessages={messages} />;
}
