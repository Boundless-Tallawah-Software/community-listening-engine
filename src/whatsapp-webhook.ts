// @ts-nocheck
import type { Env } from "./types";
import { enqueueTranscription } from "./queue-producer";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const payload = await request.json();
    const sender = payload.from;
    const audioUrl = payload.audio_url;

    if (audioUrl) {
      const resp = await fetch(audioUrl);
      const buffer = await resp.arrayBuffer();
      const key = `whatsapp/${sender}/${Date.now()}.webm`;
      await env.R2.put(key, buffer);

      await enqueueTranscription(env, key, { sender, receivedAt: new Date().toISOString() });
      return new Response("audio queued", { status: 200 });
    }

    // handle text immediately
    return new Response("text handled", { status: 200 });
  }
};