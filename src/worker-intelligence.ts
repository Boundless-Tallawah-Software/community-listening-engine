// @ts-nocheck

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
      content: "Analyze the following text and extract pain points, needs, sentiment, and business details in JSON format."
    },
    {
      role: "user",
      content: transcript
    }
  ]
});
return result.response;
}
