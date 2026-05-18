const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const CLEANUP_MODEL = process.env.OPENROUTER_CLEANUP_MODEL || "qwen/qwen3-32b";

const CLEANUP_SYSTEM_PROMPT = `You are a senior technical documentation architect.

Your task is to CLEAN and RESTRUCTURE a cluttered README.md file.

The README has grown over time through many incremental AI updates.
It may contain duplicated features, repeated sections, stale wording,
excessive UI details, bloated explanations, repeated technology mentions,
and changelog-like noise.

Goals:
- preserve all important technical information
- aggressively remove redundancy
- merge overlapping concepts
- rewrite for clarity and structure
- keep the README professional and concise

Rules:
- Rewrite the README from scratch
- Keep clean markdown formatting
- Do not remove important technical capabilities
- Do not invent features
- Return ONLY raw markdown (no code fences)`;

function normalizeMarkdownOutput(text) {
  let cleaned = text.trim();
  const fenced = cleaned.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i);
  if (fenced) {
    cleaned = fenced[1].trim();
  }
  return cleaned;
}

export async function cleanReadmeWithAI(existingReadme) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CLEANUP_MODEL,
      messages: [
        { role: "system", content: CLEANUP_SYSTEM_PROMPT },
        { role: "user", content: existingReadme },
      ],
      temperature: 0.3,
      max_tokens: 12000,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenRouter request failed (${response.status}): ${errorBody.slice(0, 200)}`,
    );
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content?.trim()) {
    throw new Error("OpenRouter returned empty README content");
  }

  return normalizeMarkdownOutput(content);
}
