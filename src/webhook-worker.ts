import type { Env } from "./types";
import { transcribeAudio } from "./worker-transcription";
import { extractInsights } from "./worker-intelligence";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Basic Twilio webhook validation placeholder
    const form = await request.formData();
    const audioFile = form.get("audio");
    if (!(audioFile instanceof File)) {
      return new Response("Missing audio", { status: 400 });
    }

    const transcript = await transcribeAudio(audioFile, env, ctx);
    const insights = await extractInsights(transcript, env, ctx);

    await env.DB.prepare(
      `INSERT INTO insights (transcript, payload) VALUES (?, ?)`
    ).bind(transcript, JSON.stringify(insights)).run();

    return new Response(JSON.stringify({ transcript, insights }), {
      headers: { "content-type": "application/json" },
    });
  },
};
