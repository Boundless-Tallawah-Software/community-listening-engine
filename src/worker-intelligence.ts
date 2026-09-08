import type { Env } from "./types";

export async function extractInsights(
  transcript: string,
  env: Env,
  ctx: ExecutionContext
): Promise<object> {
  const result = await env.AI.run("@cf/mistral-small-3.1-24b-instruct", {
    messages: [
      {
        role: "system",
        content:
          "Analyze the conversation and extract pain points, needs, sentiment, and owner info in JSON.",
      },
      {
        role: "user",
        content: transcript,
      },
    ],
  });

  return result.response;
}
