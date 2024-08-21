import { Message } from "ai";
import { useEffect, useRef } from "react";

interface Props {
  messages: Message[];
}

const useScrollToBottom = ({ messages }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return { containerRef };
};

export { useScrollToBottom };
