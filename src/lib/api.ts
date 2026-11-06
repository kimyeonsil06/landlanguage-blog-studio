import type { AITask, Draft, NewsItem, ProviderStatus } from '../types';
import { buildBrowserPrompt } from './browserPrompt';

const isStaticPages = typeof location !== 'undefined' && location.hostname.endsWith('github.io');

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init); const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `요청 실패 (${response.status})`); return body;
}
export const api = {
  providers: () => isStaticPages
    ? Promise.resolve({ providers: [{ id: 'prompt-only', name: '프롬프트 복사', available: true, reason: 'GitHub Pages에서는 외부 AI 결과 붙여넣기 방식으로 동작합니다.', needsApiKey: false, localOnly: false } as ProviderStatus], active: 'prompt-only', guideLoaded: false })
    : json<{ providers: ProviderStatus[]; active: string; guideLoaded: boolean }>('/api/providers'),
  news: () => isStaticPages
    ? Promise.resolve({ items: [] as NewsItem[], connected: false, message: '정적 배포에서는 뉴스 연결을 사용하지 않습니다. 직접 입력을 이용하세요.', date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()) })
    : json<{ items: NewsItem[]; connected: boolean; message: string; date: string }>('/api/news/today'),
  ai: (task: AITask, draft: Draft, signal?: AbortSignal): Promise<{ mode: string; prompt: string; result?: unknown; provider: string }> => isStaticPages
    ? Promise.resolve({ mode: 'prompt-only', prompt: buildBrowserPrompt(task, draft), provider: 'prompt-only' })
    : json<{ mode: string; prompt: string; result?: unknown; provider: string }>(`/api/ai/${task}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ draft }), signal
    })
};
