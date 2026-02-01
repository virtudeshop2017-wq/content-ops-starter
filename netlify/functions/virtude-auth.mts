import type { Config, Context } from '@netlify/functions';

const jsonResponse = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const allowedEmail = Netlify.env.EDITOR_EMAIL;
  const allowedPassword = Netlify.env.EDITOR_PASSWORD;

  if (!allowedEmail || !allowedPassword) {
    return jsonResponse(500, { error: 'Missing credentials configuration' });
  }

  const { email, password } = await req.json();
  const ok = email === allowedEmail && password === allowedPassword;

  if (!ok) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  return jsonResponse(200, { ok: true });
};

export const config: Config = {
  path: '/api/virtude-auth'
};
