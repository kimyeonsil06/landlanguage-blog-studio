import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aiRequestSchema, taskSchema } from './schemas.js';
import { additionalGuide, buildPrompt } from './prompts.js';
import { providers } from './ai/provider.js';
import { getNews } from './services/news.js';

const app = express(); const host = '127.0.0.1'; const port = Number(process.env.PORT || 8787);
app.disable('x-powered-by');
app.use(cors({ origin: ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:4173', 'http://localhost:4173'], methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '1mb' }));

const hits = new Map<string, { count: number; reset: number }>();
app.use('/api', (req, res, next) => { const key = req.ip || 'local'; const now = Date.now(); const item = hits.get(key); if (!item || item.reset < now) hits.set(key, { count: 1, reset: now + 60000 }); else if (++item.count > 40) return res.status(429).json({ error: '요청이 너무 많습니다. 1분 뒤 다시 시도하세요.' }); next(); });

app.get('/api/health', (_req, res) => res.json({ ok: true, localOnly: true, time: new Date().toISOString() }));
app.get('/api/providers', async (_req, res) => {
  const statuses = await Promise.all(Object.values(providers).map((provider) => provider.status()));
  const active = process.env.AI_PROVIDER && process.env.AI_PROVIDER in providers ? process.env.AI_PROVIDER : 'prompt-only';
  res.json({ providers: statuses, active, guideLoaded: !!additionalGuide });
});
app.get('/api/news/today', async (_req, res) => {
  const now = new Date(); const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now);
  try { res.json({ ...(await getNews()), date }); } catch { res.status(502).json({ error: '뉴스 피드를 읽지 못했습니다. 직접 입력을 이용하세요.', items: [], connected: false, date }); }
});
app.post('/api/ai/:task', async (req, res) => {
  const taskResult = taskSchema.safeParse(req.params.task); const input = aiRequestSchema.safeParse(req.body);
  if (!taskResult.success || !input.success) return res.status(400).json({ error: '입력 형식 또는 크기를 확인해 주세요.' });
  const task = taskResult.data; const prompt = buildPrompt(task, input.data.draft);
  const providerId = (process.env.AI_PROVIDER && process.env.AI_PROVIDER in providers ? process.env.AI_PROVIDER : 'prompt-only') as keyof typeof providers;
  const provider = providers[providerId]; const status = await provider.status();
  if (!status.available || providerId === 'prompt-only') return res.json({ mode: 'prompt-only', prompt, provider: providerId });
  try { const result = await provider.run(task, prompt); res.json({ mode: 'automatic', prompt, result, provider: providerId }); }
  catch (error) { res.status(502).json({ error: error instanceof Error ? error.message : 'AI 실행 실패', fallbackPrompt: prompt }); }
});

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
app.use(express.static(path.join(root, 'dist')));
app.use((_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));
app.listen(port, host, () => console.log(`Landlanguage server: http://${host}:${port}`));
