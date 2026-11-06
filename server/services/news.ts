import dns from 'node:dns/promises';
import net from 'node:net';

function privateIp(ip: string): boolean {
  if (net.isIPv4(ip)) { const p = ip.split('.').map(Number); return p[0] === 10 || p[0] === 127 || p[0] === 0 || (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168); }
  const value = ip.toLowerCase(); return value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80:');
}
async function safeUrl(raw: string): Promise<URL> {
  const url = new URL(raw); if (url.protocol !== 'https:') throw new Error('RSS는 HTTPS만 허용합니다.');
  const addresses = await dns.lookup(url.hostname, { all: true }); if (!addresses.length || addresses.some((a) => privateIp(a.address))) throw new Error('내부망 주소는 허용되지 않습니다.');
  return url;
}
const decode = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
const pick = (block: string, tag: string) => decode(block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] || '');

export async function getNews() {
  const feeds = (process.env.NEWS_RSS_URLS || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5);
  if (!feeds.length) return { items: [], connected: false, message: '뉴스 연결이 필요합니다. 직접 입력 탭은 계속 사용할 수 있습니다.' };
  const all: any[] = [];
  for (const raw of feeds) {
    try {
      const url = await safeUrl(raw); const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 7000);
      const response = await fetch(url, { signal: controller.signal, redirect: 'error', headers: { 'user-agent': 'LandlanguageBlogStudio/1.0 RSS reader' } }); clearTimeout(timeout);
      if (!response.ok) continue; const xml = (await response.text()).slice(0, 2_000_000);
      for (const block of xml.match(/<item[\s\S]*?<\/item>/gi) || []) {
        const title = pick(block, 'title'); const link = pick(block, 'link'); const publishedAt = pick(block, 'pubDate') || pick(block, 'published'); const organization = pick(block, 'source') || url.hostname;
        if (title && link && /(부동산|아파트|주택|전세|매매|재건축|분양|토지|임대)/.test(title)) all.push({ title, url: link, publishedAt, organization });
      }
    } catch { /* a failed feed does not expose network details */ }
  }
  const unique = [...new Map(all.map((item) => [item.title.replace(/\s/g, ''), item])).values()]
    .sort((a: any, b: any) => +new Date(b.publishedAt) - +new Date(a.publishedAt)).slice(0, 20);
  return { items: unique, connected: true, message: `오늘 기준 확인 가능한 기사 ${unique.length}건` };
}
