// Prints every waitlist sign-up as CSV (email, joined at), oldest first.
//
//   npx vercel env pull .env.local     # once, to get BLOB_READ_WRITE_TOKEN
//   node --env-file=.env.local scripts/export-waitlist.mjs > waitlist.csv
import { get, list } from '@vercel/blob';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN is not set. Run `npx vercel env pull .env.local` first.');
  process.exit(1);
}

const entries = [];
let cursor;
do {
  const page = await list({ prefix: 'waitlist/', cursor, limit: 1000 });
  for (const b of page.blobs) {
    const result = await get(b.pathname, { access: 'private', useCache: false });
    if (result) entries.push(JSON.parse(await new Response(result.stream).text()));
  }
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);

entries.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
console.log('email,joined_at');
for (const e of entries) console.log(`${cell(e.email)},${cell(e.joinedAt)}`);
console.error(`${entries.length} sign-up${entries.length === 1 ? '' : 's'}`);
