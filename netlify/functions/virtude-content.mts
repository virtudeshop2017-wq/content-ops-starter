import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import defaultContent from '../../src/data/virtude-default.json';

const jsonResponse = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

const getStoreName = () => {
  const context = Netlify.env.CONTEXT || 'dev';
  return context === 'production' ? 'virtude-content' : `virtude-content-${context}`;
};

const isAuthorized = (body: any) => {
  const allowedEmail = Netlify.env.EDITOR_EMAIL;
  const allowedPassword = Netlify.env.EDITOR_PASSWORD;
  if (!allowedEmail || !allowedPassword) return false;
  return body?.auth?.email === allowedEmail && body?.auth?.password === allowedPassword;
};

export default async (req: Request, _context: Context) => {
  const store = getStore(getStoreName());

  if (req.method === 'GET') {
    const stored = await store.get('content', { type: 'json' });
    return jsonResponse(200, { content: stored ?? defaultContent });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const body = await req.json();

  if (!isAuthorized(body)) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  if (!body?.content) {
    return jsonResponse(400, { error: 'Missing content' });
  }

  await store.setJSON('content', body.content);
  return jsonResponse(200, { ok: true });
};

export const config: Config = {
  path: '/api/virtude-content'
};
