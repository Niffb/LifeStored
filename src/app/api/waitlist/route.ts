import { createHash } from 'node:crypto';
import { head, put } from '@vercel/blob';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Saves a waitlist sign-up to Vercel Blob as a private JSON file.
 * One file per email (named by its hash), so signing up twice keeps the first entry.
 */
export async function POST(request: Request) {
  let body: { email?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (typeof body.company === 'string' && body.company.trim()) return Response.json({ ok: true });

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL.test(email)) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const pathname = `waitlist/${createHash('sha256').update(email).digest('hex')}.json`;
  const entry = JSON.stringify({ email, joinedAt: new Date().toISOString(), source: 'launch-page' });

  try {
    await put(pathname, entry, { access: 'private', contentType: 'application/json', addRandomSuffix: false });
  } catch (err) {
    // put refuses to overwrite: if the entry is already there, they're already on the list.
    const existing = await head(pathname).catch(() => null);
    if (!existing) {
      console.error('Waitlist save failed:', (err as Error).message);
      return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
  }

  return Response.json({ ok: true });
}
