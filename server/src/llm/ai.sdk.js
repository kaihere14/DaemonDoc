import { generateText } from "ai";

// Thin wrapper over the AI SDK. No custom option abstraction —
// callers pass real generateText() options straight through.
export async function aiCall({ model, prompt, ...options }) {
  const { text } = await generateText({
    model,
    prompt,
    ...options,
  });

  console.log(text);

  return text;
}
