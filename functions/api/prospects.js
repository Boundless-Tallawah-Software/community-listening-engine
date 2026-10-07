import { getDatabase, internalError, jsonResponse, textValue } from './_shared.js';

export async function onRequestPost({ request, env }) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonResponse({ detail: 'Content-Type must be application/json.' }, 415);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ detail: 'Request body must be valid JSON.' }, 400);
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return jsonResponse({ detail: 'Request body must be a JSON object.' }, 400);
  }

  const ownerName = textValue(data.owner_name, 200);
  const businessName = textValue(data.business_name, 200);
  const businessType = textValue(data.business_type, 200);
  const manualProcess = textValue(data.manual_process);
  const painPoint = textValue(data.pain_point);
  const email = textValue(data.email, 320);
  const phone = textValue(data.phone, 40);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!ownerName || !businessName || !businessType || !painPoint) {
    return jsonResponse({ detail: 'Owner name, business name, business type, and challenge are required.' }, 400);
  }
  if (email && !emailPattern.test(email)) {
    return jsonResponse({ detail: 'Email address is invalid.' }, 400);
  }

  const database = getDatabase({ env });
  if (!database) return jsonResponse({ detail: 'Database is unavailable.' }, 503);

  try {
    await database.prepare(
      `INSERT INTO prospects
        (id, owner_name, business_name, business_type, email, phone, manual_process, pain_point, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'web')`
    ).bind(
      crypto.randomUUID(),
      ownerName,
      businessName,
      businessType,
      email || null,
      phone || null,
      manualProcess,
      painPoint
    ).run();

    return jsonResponse({ status: 'success', message: 'Prospect created successfully.' }, 201);
  } catch {
    return internalError();
  }
}