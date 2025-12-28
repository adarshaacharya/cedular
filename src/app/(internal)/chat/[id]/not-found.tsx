export default function NotFound() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Chat Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The chat you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have access to it.
        </p>
        <a href="/chat" className="text-primary hover:underline">
          Start a new chat
        </a>
      </div>
    </div>
  );
}
