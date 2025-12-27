interface ChatHeaderProps {
  title?: string;
  className?: string;
}

export const ChatHeader = ({
  title = "AI Chat",
  className = "",
}: ChatHeaderProps) => {
  return (
    <div className={`border-b bg-background px-4 py-3 ${className}`}>
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </div>
  );
};
