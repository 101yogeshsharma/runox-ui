import { AIInput } from "./AIInput";
import { ChatBubble } from "./ChatBubble";
import { StreamingText } from "./StreamingText";

export * from "./AIInput";
export * from "./ChatBubble";
export * from "./StreamingText";

export const AI = Object.assign(
  {},
  {
    Input: AIInput,
    ChatBubble,
    StreamingText,
  }
);
