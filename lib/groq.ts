import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY;

console.log("🔍 Environment check:");
console.log("GROQ_API_KEY exists:", !!apiKey);
console.log("GROQ_API_KEY length:", apiKey?.length);

if (!apiKey) {
  console.error("❌ GROQ_API_KEY is missing in .env.local");
}

const client = new OpenAI({
  apiKey: apiKey || "",
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "llama-3.3-70b-versatile";

export async function summarizeContent(content: string): Promise<string> {
  if (!content || content.trim().length === 0) {
    throw new Error("Content is empty");
  }

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Summarize the following note content in a concise paragraph:\n\n${content}`,
      },
    ],
  });

  return completion.choices[0]?.message?.content || "Summary could not be generated";
}

export async function improveContent(content: string): Promise<string> {
  if (!content || content.trim().length === 0) {
    throw new Error("Content is empty");
  }

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Improve the following note content for grammar, clarity, and readability while keeping the meaning the same:\n\n${content}`,
      },
    ],
  });

  return completion.choices[0]?.message?.content || content;
}

export async function generateTags(
  content: string,
  title?: string
): Promise<string[]> {
  const combinedContent = `${title ? title + "\n" : ""}${content}`.trim();

  if (!combinedContent) {
    return [];
  }

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Generate 3-5 relevant tags for the following note. Return ONLY a comma separated list.\n\n${combinedContent}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content || "";

  return text
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0 && tag.length < 50);
}

