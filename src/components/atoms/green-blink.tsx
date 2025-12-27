import { cn } from "@/lib/utils";

interface GreenBlinkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function GreenBlink({ className, size = "md" }: GreenBlinkProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-green-500 animate-pulse",
        sizeClasses[size],
        className
      )}
      style={{
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
    />
  );
}
