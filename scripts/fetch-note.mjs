import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const feedUrl = process.env.NOTE_RSS_URL || 'https://note.com/dementiacom/rss';
const outputPath = resolve(process.env.NOTE_OUTPUT_PATH || 'assets/note-feed.json');
const maximumItems = Number.parseInt(process.env.NOTE_ITEM_LIMIT || '8', 10);

const decodeEntities = (value) => value
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));

const unwrapCdata = (value) => value.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/i, '$1');
const plainText = (value) => decodeEntities(unwrapCdata(value))
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<\/p>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .replace(/続きをみる\s*$/u, '')
  .trim();

const tagValue = (xml, tagName) => {
  const escapedName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = xml.match(new RegExp(`<${escapedName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedName}>`, 'i'));
  return match ? match[1].trim() : '';
};

const safeUrl = (value, type) => {
  try {
    const url = new URL(decodeEntities(unwrapCdata(value).trim()));
    if (url.protocol !== 'https:') return '';
    if (type === 'article' && url.hostname !== 'note.com' && !url.hostname.endsWith('.note.com')) return '';
    return url.href;
  } catch {
    return '';
  }
};

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30_000);
let response;
try {
  response = await fetch(feedUrl, {
    signal: controller.signal,
    headers: {
      Accept: 'application/rss+xml, application/xml, text/xml',
      'User-Agent': 'kotohana-website-note-feed/1.0',
    },
  });
} finally {
  clearTimeout(timeout);
}

if (!response.ok) throw new Error(`note RSS request failed (${response.status}).`);
const xml = await response.text();
if (!/<rss\b/i.test(xml) || !/<item\b/i.test(xml)) throw new Error('note RSS did not contain any articles.');

const channelXml = xml.split(/<item\b/i, 1)[0];
const source = {
  name: plainText(tagValue(channelXml, 'title')) || 'いろのわ@千葉',
  profile_url: safeUrl(tagValue(channelXml, 'link'), 'article') || 'https://note.com/dementiacom',
  feed_url: feedUrl,
};

const itemBlocks = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
  .map((match) => match[1])
  .slice(0, Number.isFinite(maximumItems) && maximumItems > 0 ? maximumItems : 8);

const items = itemBlocks.map((itemXml) => {
  const title = plainText(tagValue(itemXml, 'title'));
  const permalink = safeUrl(tagValue(itemXml, 'link'), 'article');
  const imageUrl = safeUrl(tagValue(itemXml, 'media:thumbnail'), 'image');
  const description = plainText(tagValue(itemXml, 'description'));
  const publishedAt = new Date(plainText(tagValue(itemXml, 'pubDate')));
  return {
    title,
    permalink,
    image_url: imageUrl,
    published_at: Number.isNaN(publishedAt.getTime()) ? '' : publishedAt.toISOString(),
    excerpt: description.length > 170 ? `${description.slice(0, 169).trim()}…` : description,
  };
}).filter((item) => item.title && item.permalink);

if (!items.length) throw new Error('note RSS returned no displayable articles.');

const nextPayload = { source, items };
let currentFeed = '';
try {
  currentFeed = await readFile(outputPath, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

try {
  const currentPayload = JSON.parse(currentFeed);
  if (JSON.stringify({ source: currentPayload.source, items: currentPayload.items }) === JSON.stringify(nextPayload)) {
    console.log('note feed is already up to date.');
    process.exit(0);
  }
} catch {
  // Missing or invalid local data is replaced with the current RSS content.
}

const nextFeed = `${JSON.stringify({ updated_at: new Date().toISOString(), ...nextPayload }, null, 2)}\n`;
await mkdir(dirname(outputPath), { recursive: true });
const temporaryPath = `${outputPath}.tmp`;
await writeFile(temporaryPath, nextFeed, 'utf8');
await rename(temporaryPath, outputPath);
console.log(`Updated ${items.length} note articles from ${source.name}.`);
