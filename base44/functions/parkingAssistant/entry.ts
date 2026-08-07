import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const question = String(body.question || '').slice(0, 600);
    if (!question) return Response.json({ error: 'Question required' }, { status: 400 });

    const reservations = await base44.entities.Reservation.list('-created_date', 20);
    const context = reservations
      .map(r => `Slot ${r.slot_code} (Level ${r.floor}, ${r.vehicle_type}, ${r.status}, ${r.hours}h, fee ₹${r.estimated_fee}, vehicle ${r.vehicle_number || 'n/a'}, booked ${r.created_date || 'n/a'})`)
      .join('\n');

    const prompt =
      'You are Parky, the friendly assistant for MallPark, a smart mall parking app. ' +
      'Help the user with reservation issues: booking, cancelling, fees, EV charging, finding slots, extending time. ' +
      'Be concise and warm, max 3 short sentences. Do not invent slot codes; use the data below if relevant. ' +
      'Here are the user\'s recent reservations:\n' + (context || 'No reservations found.') +
      '\n\nUser question: ' + question;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: { answer: { type: 'string' } },
        required: ['answer']
      }
    });

    return Response.json({ answer: (res && res.answer) || String(res || 'Sorry, I could not help with that.') });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}