// @ts-nocheck

import type { Env } from './types';
import type { QueueMessage } from "@cloudflare/workers-types";

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname === "/whatsapp") {
      // WhatsApp webhook logic
      const payload = await request.json();
      const sender = payload.from;
      const audioUrl = payload.audio_url;
      if (audioUrl) {
        const resp = await fetch(audioUrl);
        const buffer = await resp.arrayBuffer();
        const key = `whatsapp/${sender}/${Date.now()}.webm`;
        await env.R2.put(key, buffer);
        // enqueue transcription
        const { enqueueTranscription } = await import('./queue-producer.ts');
        await enqueueTranscription(env, key, { sender, receivedAt: new Date().toISOString() });
        return new Response("audio queued", { status: 200 });
      }
      return new Response("text handled", { status: 200 });
    }

    // Default handler (original webhook logic)
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
