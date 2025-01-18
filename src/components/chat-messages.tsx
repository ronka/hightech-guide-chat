import { type Message } from "ai/react";
import { ChatLine } from "./chat-line";
import { getSources } from "@/services/utils";

const shouldSkipMessage = (
  message: Message,
  messages: Message[],
  index: number
): boolean => {
  return (
    message.content.length === 0 &&
    index < messages.length - 1 &&
    messages[index + 1].content.length > 0
  );
};

const getCombinedToolInvocations = (
  message: Message,
  prevMessage: Message | null
) => {
  if (!prevMessage || prevMessage.content.length !== 0) {
    return message.toolInvocations;
  }
  return [
    ...(prevMessage.toolInvocations || []),
    ...(message.toolInvocations || []),
  ];
};

interface ChatMessagesProps {
  messages: Message[];
}

const ThinkingIndicator = ({ toolName = "" }: { toolName?: string }) => {
  if (toolName === "getInformation") {
    return (
      <div className="flex items-center gap-2 italic font-light">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
        <span>מחפש בספר</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 italic font-light">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
    </div>
  );
};

interface ChatMessageProps {
  message: Message;
  messages: Message[];
  index: number;
}

const ChatMessage = ({ message, messages, index }: ChatMessageProps) => {
  const { id, role, content, toolInvocations } = message;

  if (shouldSkipMessage(message, messages, index)) {
    return null;
  }

  const prevMessage = index > 0 ? messages[index - 1] : null;
  const combinedToolInvocations = getCombinedToolInvocations(
    message,
    prevMessage
  );

  if (content.length === 0) {
    return (
      <ThinkingIndicator key={id} toolName={toolInvocations?.[0].toolName} />
    );
  }

  return (
    <ChatLine
      key={id}
      role={role}
      content={content}
      sources={
        combinedToolInvocations ? getSources(combinedToolInvocations) : []
      }
    />
  );
};

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  return messages.map((message, index) => (
    <ChatMessage
      key={message.id}
      message={message}
      messages={messages}
      index={index}
    />
  ));
};
