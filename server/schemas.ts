import { z } from 'zod';

export const taskNames = ['suggestKeywords', 'suggestEmphasis', 'generateTitles', 'generateOutline', 'generateArticle', 'evaluateArticle', 'reviseArticle'] as const;
export const taskSchema = z.enum(taskNames);
export const aiRequestSchema = z.object({
  draft: z.object({
    author: z.string().max(100), topic: z.string().min(1).max(100), title: z.string().max(150),
    titles: z.array(z.string()).max(10), audience: z.string().max(100), keywords: z.array(z.string().max(60)).max(10),
    emphasis: z.array(z.string().max(500)).max(20), tone: z.string().max(20), experienceMemo: z.string().max(2000),
    sources: z.array(z.object({ id: z.string(), title: z.string().max(300), organization: z.string().max(200), publishedAt: z.string().max(40), url: z.string().max(2000), excerpt: z.string().max(10000), verified: z.boolean() })).max(5),
    informationDate: z.string().max(20), targetLength: z.number().min(500).max(20000),
    outline: z.array(z.unknown()).max(30), article: z.string().max(200000), officeProfile: z.record(z.string(), z.unknown())
  }).passthrough()
});

export const evaluationSchema = z.object({
  items: z.array(z.object({ name: z.string(), max: z.number().int().nonnegative(), score: z.number().int().nonnegative(), reason: z.string(), fix: z.string() })).length(9),
  total: z.number().int().min(0).max(100), grade: z.string(), topFixes: z.array(z.string()).length(3)
}).superRefine((value, ctx) => {
  if (value.items.reduce((s, i) => s + i.max, 0) !== 100) ctx.addIssue({ code: 'custom', message: '배점 합계는 100이어야 합니다.' });
  if (value.items.some((i) => i.score > i.max)) ctx.addIssue({ code: 'custom', message: '항목 점수가 배점을 초과했습니다.' });
  if (value.items.reduce((s, i) => s + i.score, 0) !== value.total) ctx.addIssue({ code: 'custom', message: '항목 점수 합계와 total이 다릅니다.' });
});
