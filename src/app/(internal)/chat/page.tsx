import { Suspense } from "react";
import { connection } from "next/server";
import { Chat } from "@/app/(internal)/chat/_components/chat";
import { generateUUID } from "@/lib/utils";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <NewChatPage />
    </Suspense>
  );
}

async function NewChatPage() {
  // Indicate this component should be rendered per request, not prerendered
  await connection();
  const id = generateUUID();

  return <Chat key={id} id={id} initialMessages={[]} />;
}
