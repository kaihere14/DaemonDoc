import { generateText } from "ai";

export async function aiCall({
  model,
  prompt,
  constraints = {},
}) {
  const { text } = await generateText({
    model,
    prompt,
    constraints,
  });
  console.log(text)
  return text;
}
