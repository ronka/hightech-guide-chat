import { type UIMessage } from "ai";
import { ChatLine } from "./chat-line";
import { getSources } from "@/services/utils";
import { getMessageContent, getToolParts, getToolName } from "@/services/message-utils";

const shouldSkipMessage = (
  message: UIMessage,
  messages: UIMessage[],
  index: number
): boolean => {
  const content = getMessageContent(message);
  const nextContent = index < messages.length - 1 ? getMessageContent(messages[index + 1]) : "";
  return content.length === 0 && index < messages.length - 1 && nextContent.length > 0;
};

const getCombinedToolInvocations = (
  message: UIMessage,
  prevMessage: UIMessage | null
) => {
  const getToolInvocations = (msg: UIMessage) => getToolParts(msg);

  const prevContent = prevMessage ? getMessageContent(prevMessage) : "";
  if (!prevMessage || prevContent.length !== 0) {
    return getToolInvocations(message);
  }

  return [...getToolInvocations(prevMessage), ...getToolInvocations(message)];
};

interface ChatMessagesProps {
  messages: UIMessage[];
}

const ThinkingIndicator = ({ toolName = "" }: { toolName?: string }) => {
  const isGettingInformationFromTheBook = toolName === "getInformation";

  const loadingText = isGettingInformationFromTheBook
    ? "מחפש בספר הכי טוב בגלקסיה ..."
    : "מדמה שאני עובד קשה ...";

  return (
    <div className="flex items-center gap-2 italic font-light p-4">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
      {loadingText}
    </div>
  );
};

interface ChatMessageProps {
  message: UIMessage;
  messages: UIMessage[];
  index: number;
}

const ChatMessage = ({ message, messages, index }: ChatMessageProps) => {
  const { id, role, parts } = message;
  const content = getMessageContent(message);

  if (shouldSkipMessage(message, messages, index)) {
    return null;
  }

  const prevMessage = index > 0 ? messages[index - 1] : null;
  const combinedToolInvocations = getCombinedToolInvocations(
    message,
    prevMessage
  );

  const toolParts = getToolParts(message);

  if (content.length === 0) {
    const toolName = toolParts.length > 0 ? getToolName(toolParts[0]) : undefined;
    return <ThinkingIndicator key={id} toolName={toolName} />;
  }

  return (
    <ChatLine
      key={id}
      role={role}
      content={content}
      sources={
        combinedToolInvocations.length > 0
          ? getSources(combinedToolInvocations)
          : []
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
