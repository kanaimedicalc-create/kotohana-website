import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
const userId = process.env.INSTAGRAM_USER_ID;
const apiVersion = process.env.INSTAGRAM_API_VERSION || 'v25.0';
const graphBaseUrl = process.env.INSTAGRAM_GRAPH_BASE_URL || 'https://graph.instagram.com';
const outputPath = resolve(process.env.INSTAGRAM_OUTPUT_PATH || 'assets/instagram-feed.json');

if (!accessToken || !userId) {
  console.log('Instagram credentials are not configured; keeping the current feed.');
  process.exit(0);
}

const endpoint = new URL(`${graphBaseUrl.replace(/\/$/, '')}/${apiVersion}/${encodeURIComponent(userId)}/media`);
endpoint.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp');
endpoint.searchParams.set('limit', '12');
endpoint.searchParams.set('access_token', accessToken);

const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
if (!response.ok) {
  const details = await response.text();
  throw new Error(`Instagram API request failed (${response.status}): ${details.slice(0, 300)}`);
}

const payload = await response.json();
if (!Array.isArray(payload.data)) throw new Error('Instagram API response did not contain a media list.');

const items = payload.data
  .map((item) => ({
    id: String(item.id || ''),
    caption: typeof item.caption === 'string' ? item.caption : '',
    media_type: String(item.media_type || ''),
    image_url: String(item.thumbnail_url || item.media_url || ''),
    permalink: String(item.permalink || ''),
    timestamp: String(item.timestamp || ''),
  }))
  .filter((item) => item.id && item.image_url && item.permalink)
  .slice(0, 6);

if (!items.length) throw new Error('Instagram API returned no displayable media.');

const nextFeed = `${JSON.stringify({ updated_at: new Date().toISOString(), items }, null, 2)}\n`;
let currentFeed = '';
try {
  currentFeed = await readFile(outputPath, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const comparable = (value) => {
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed.items || []);
  } catch {
    return '';
  }
};

if (comparable(currentFeed) === JSON.stringify(items)) {
  console.log('Instagram feed is already up to date.');
  process.exit(0);
}

await mkdir(dirname(outputPath), { recursive: true });
const temporaryPath = `${outputPath}.tmp`;
await writeFile(temporaryPath, nextFeed, 'utf8');
await rename(temporaryPath, outputPath);
console.log(`Updated ${items.length} Instagram posts.`);
