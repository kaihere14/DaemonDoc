import { generateText } from "ai";
import { aiLog } from "../utils/logger.js";

// Thin wrapper over the AI SDK. No custom option abstraction —
// callers pass real generateText() options straight through.
export async function aiCall({ model, prompt, ...options }) {
  const { text } = await generateText({
    model,
    prompt,
    ...options,
  });

  // The completion itself is far too large for an info line — only its size
  // is useful, and the body stays behind debug for local troubleshooting.
  aiLog.debug("Completion received", { chars: text.length });

  return text;
}
