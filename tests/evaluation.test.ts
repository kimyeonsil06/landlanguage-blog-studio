import { describe, expect, it } from 'vitest';
import { createDraft, localArticle } from '../src/lib/draft.js';
import { evaluateLocally } from '../src/lib/evaluation.js';

describe('로컬 평가', () => {
  it('9개 항목과 100점 배점을 유지하고 합계를 검증한다', () => {
    const draft = createDraft(); draft.topic = '구축아파트'; draft.keywords = ['칠곡군아파트']; draft.article = localArticle(draft);
    const result = evaluateLocally(draft);
    expect(result.items).toHaveLength(9);
    expect(result.items.reduce((sum, item) => sum + item.max, 0)).toBe(100);
    expect(result.total).toBe(result.items.reduce((sum, item) => sum + item.score, 0));
  });
  it('출처 링크가 없으면 정확성 점수는 최대 8점이다', () => {
    const draft = createDraft(); draft.topic = '구축아파트'; draft.article = localArticle(draft);
    const accuracy = evaluateLocally(draft).items.find((item) => item.name === '정보 정확성·출처');
    expect(accuracy?.score).toBeLessThanOrEqual(8);
  });
});
