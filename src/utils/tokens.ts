import { openAIConfiguration } from "@/lib/config";
import { encode } from "gpt-3-encoder";

export const reduceMessages = (messages: any) => {
  const MAX_TOKENS = 3000;

  let tokenCount = 0;
  let reducedMessages = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = encode(message.content).length;

    if (tokenCount + messageTokens > MAX_TOKENS) {
      break;
    }

    tokenCount += messageTokens;
    reducedMessages.unshift(message);
  }

  return { messages: reducedMessages, usedTokens: tokenCount };
};
