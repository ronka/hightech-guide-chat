import { Message } from "ai";
import { useEffect } from "react";

interface Props {
  containerRef: React.RefObject<HTMLDivElement>;
  messages: Message[];
}

const useScrollToBottom = ({ containerRef, messages }: Props) => {
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);
};

export { useScrollToBottom };
