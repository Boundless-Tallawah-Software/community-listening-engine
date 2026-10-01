import { jsonResponse } from './_shared.js';

export function onRequestGet({ env }) {
  return jsonResponse({
    message: env.INFORMATION_MESSAGE || 'Owner Directory: Voice input is available via WhatsApp or manual form entry.',
  });
}