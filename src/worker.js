/**
 * The only server-side code on this site: the contact form endpoint.
 *
 * Static assets are served from Cloudflare's asset storage without invoking
 * this script at all, so the Worker runs for /api/contact and nothing else —
 * the site keeps costing no request quota for ordinary traffic.
 */

const MAX = { name: 120, email: 200, company: 160, message: 4000, budget: 40 };

const BUDGETS = new Set([
  'under-5k',
  '5-15k',
  '15-50k',
  'over-50k',
  'not-sure',
]);

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

function clean(value, limit) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, limit);
}

// Deliberately permissive: the point is to catch typos, not to adjudicate
// RFC 5322. Anything stricter rejects real addresses.
const looksLikeEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== '/api/contact') {
      return new Response('Not found', { status: 404 });
    }
    if (request.method !== 'POST') {
      return json(405, { error: 'Use POST.' });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json(400, { error: 'Expected JSON.' });
    }

    // Honeypot. A real person never fills a field they cannot see, so treat a
    // filled one as success and send nothing — telling a bot it failed only
    // teaches it to try again.
    if (clean(data.website, 200)) return json(200, { ok: true });

    const name = clean(data.name, MAX.name);
    const email = clean(data.email, MAX.email);
    const company = clean(data.company, MAX.company);
    const message = clean(data.message, MAX.message);
    const budget = clean(data.budget, MAX.budget);

    const missing = [];
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!message) missing.push('message');
    if (missing.length) {
      return json(400, { error: `Missing: ${missing.join(', ')}.`, fields: missing });
    }
    if (!looksLikeEmail(email)) {
      return json(400, { error: 'That email address does not look right.', fields: ['email'] });
    }
    if (budget && !BUDGETS.has(budget)) {
      return json(400, { error: 'Unknown budget band.', fields: ['budget'] });
    }

    if (!env.RESEND_API_KEY) {
      // Misconfiguration, not the visitor's problem. Say so plainly so the
      // front end can show the email and WhatsApp routes instead of pretending
      // the message went somewhere.
      return json(503, { error: 'The form is not connected yet.', fallback: true });
    }

    const to = env.CONTACT_TO || 'helloayursen@gmail.com';
    const from = env.CONTACT_FROM || 'jains.es <onboarding@resend.dev>';

    const body = [
      `Name:    ${name}`,
      `Email:   ${email}`,
      company ? `Company: ${company}` : null,
      budget ? `Budget:  ${budget}` : null,
      '',
      message,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `jains.es — ${name}${company ? ` (${company})` : ''}`,
        text: body,
      }),
    });

    if (!res.ok) {
      // Never surface the provider's response to the visitor; it can contain
      // account details. Log it for us, give them a route that works.
      console.error('resend failed', res.status, await res.text().catch(() => ''));
      return json(502, { error: 'We could not send that just now.', fallback: true });
    }

    return json(200, { ok: true });
  },
};
