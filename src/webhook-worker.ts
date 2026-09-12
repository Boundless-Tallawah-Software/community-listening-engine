// @ts-nocheck

import type { Env } from './types';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const form = await request.formData();
    const audioFile = form.get("audio");
    if (!(audioFile instanceof File)) {
      return new Response("Missing audio", { status: 400 });
    }

    const { transcribeAudio } = await import('./worker-transcription.ts');
    const { extractInsights } = await import('./worker-intelligence.ts');

    const transcript = await transcribeAudio(audioFile, env, ctx);
    const insights = await extractInsights(transcript, env, ctx);

    await env.DB.prepare(
      `INSERT INTO insights (transcript, payload) VALUES (?, ?)`
    ).bind(transcript, JSON.stringify(insights)).run();

    return new Response(
      JSON.stringify({ transcript, insights }),
      { headers: { "content-type": "application/json" } }
    );
  },
};
