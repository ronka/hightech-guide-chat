import type { UIMessage } from "ai";

/**
 * Extract text content from a UIMessage's parts array.
 * In AI SDK v5, messages use parts array instead of direct content property.
 */
export function getMessageContent(message: UIMessage): string {
  if (!message.parts) return "";

  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/**
 * Get tool invocation parts from a UIMessage.
 * Tool parts have types starting with "tool-" in AI SDK v5.
 */
export function getToolParts(message: UIMessage): Array<unknown> {
  if (!message.parts) return [];

  return message.parts.filter((part) => {
    const type = part.type as string;
    return type.startsWith("tool-") || type === "dynamic-tool";
  });
}

/**
 * Get the tool name from a tool part.
 */
export function getToolName(toolPart: unknown): string | undefined {
  if (!toolPart || typeof toolPart !== "object") return undefined;

  const part = toolPart as { type?: string; toolName?: string };

  // For dynamic tools
  if (part.toolName) return part.toolName;

  // For static tools, extract from type (e.g., "tool-getInformation" -> "getInformation")
  if (part.type && part.type.startsWith("tool-")) {
    return part.type.replace("tool-", "");
  }

  return undefined;
}

/**
 * Check if a tool part has a result/output available.
 */
export function hasToolOutput(toolPart: unknown): boolean {
  if (!toolPart || typeof toolPart !== "object") return false;

  const part = toolPart as { state?: string };
  return part.state === "output-available" || part.state === "result";
}

/**
 * Get the output from a tool part.
 */
export function getToolOutput(toolPart: unknown): unknown {
  if (!toolPart || typeof toolPart !== "object") return undefined;

  const part = toolPart as { output?: unknown };
  return part.output;
}
