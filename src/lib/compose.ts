import { z } from 'zod';
import type { Draft } from '../types';
import { localArticle, localOutline, localTitles, newId } from './draft';
import { api } from './api';
import { evaluateLocally } from './evaluation';

const outlineResult = z.object({
  titles: z.array(z.string().trim().min(1).max(150)).min(1).max(3),
  sections: z.array(z.object({type:z.string(), heading:z.string().trim().min(1), notes:z.string(),
    sourceIds:z.array(z.string()).default([]), imageIdeas:z.array(z.object({ caption:z.string(), query:z.string(), directPhoto:z.boolean() })).default([])
  })).min(1).max(30),
  metaDescription:z.string().optional()
});
const articleResult = z.object({ article:z.string().trim().min(1).max(200000), metaDescription:z.string().optional() });

export async function composeDraft(input: Draft, signal: AbortSignal) {
  const draft = { ...input, topic:input.topic.trim() };
  if (!draft.topic) throw new Error('작성할 주제를 입력해 주세요.');
  const {providers, active} = await api.providers();
  signal.throwIfAborted();
  const automatic = active !== 'prompt-only';
  if (automatic && !providers.some(p => p.id === active && p.available)) throw new Error('선택한 AI 엔진을 연결할 수 없습니다. 설정에서 연결 상태를 확인해 주세요.');
  if (automatic) {
    if (!draft.outline.length) {
      const response = await api.ai('generateOutline', draft, signal);
      const outline = outlineResult.parse(response.result);
      draft.titles = outline.titles;
      draft.metaDescription = outline.metaDescription;
      draft.outline = outline.sections.map((s, order) => ({...s, id:newId(), order}));
    }
    draft.title ||= draft.titles[0] || draft.topic;
    const response = await api.ai('generateArticle', draft, signal);
    const result = articleResult.parse(response.result);
    draft.article = result.article;
    draft.metaDescription = result.metaDescription || draft.metaDescription;
  } else {
    draft.titles = draft.titles.length ? draft.titles : localTitles(draft);
    draft.title ||= draft.titles[0];
    draft.outline = draft.outline.length ? draft.outline : localOutline(draft);
    draft.article = localArticle(draft);
  }
  signal.throwIfAborted();
  draft.evaluation = evaluateLocally(draft);
  draft.status = '초안';
  draft.updatedAt = new Date().toISOString();
  return {draft, source: automatic ? 'AI' : '로컬 템플릿'};
}
