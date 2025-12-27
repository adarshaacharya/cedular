import { useCallback, useEffect, useRef, useState } from "react";

interface UseMessagesOptions {
  status: string;
}

export function useMessages({ status }: UseMessagesOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasSentMessage, setHasSentMessage] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const checkIfAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
    setIsAtBottom(atBottom);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkIfAtBottom);
    return () => container.removeEventListener("scroll", checkIfAtBottom);
  }, [checkIfAtBottom]);

  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      setHasSentMessage(true);
      // Auto-scroll to bottom when streaming starts
      setTimeout(() => scrollToBottom("auto"), 0);
    }
  }, [status, scrollToBottom]);

  // Check if at bottom initially
  useEffect(() => {
    checkIfAtBottom();
  }, [checkIfAtBottom]);

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  };
}
