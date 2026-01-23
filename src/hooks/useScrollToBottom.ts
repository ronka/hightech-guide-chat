import { type UIMessage } from "ai";
import { useEffect, useRef } from "react";

interface Props {
  messages: UIMessage[];
}

const useScrollToBottom = ({ messages }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrolling = useRef<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      isUserScrolling.current =
        container.scrollTop < container.scrollHeight - container.clientHeight;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isUserScrolling.current) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return { containerRef };
};

export { useScrollToBottom };
