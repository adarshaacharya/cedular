import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface UseChatNavigationResetProps {
  onReset: () => void;
}

/**
 * Hook that detects navigation from /chat/[id] to /chat and triggers a reset
 * This ensures the chat component shows a fresh interface when starting a new chat
 */
export function useChatNavigationReset({
  onReset,
}: UseChatNavigationResetProps) {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;

    // Detect transition from /chat/[id] to /chat
    if (
      pathname === "/chat" &&
      prevPathname.startsWith("/chat/") &&
      prevPathname !== "/chat"
    ) {
      // Navigated from existing chat to new chat - reset state for fresh experience
      onReset();
    }

    prevPathnameRef.current = pathname;
  }, [pathname, onReset]);
}
