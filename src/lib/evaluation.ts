import type { Draft, Evaluation, EvaluationItem } from '../types';
import { incompleteCount } from './metrics';

const CRITERIA: Array<[string, number]> = [
  ['검색 의도 및 독자 목적', 15], ['정보 정확성·출처', 15], ['전문성·경험·독창성', 20],
  ['심층분석·비교·실용성', 15], ['제목·구조·가독성', 10], ['주제 일관성·키워드', 10],
  ['최신성 및 기준일', 5], ['이미지·표·영상 적절성', 5], ['진정성·스팸 위험 관리', 5]
];

export function evaluateLocally(draft: Draft): Evaluation {
  const article = draft.article;
  const experienceSlots = (article.match(/\[작성자 경험 입력[^\]]*\]/g) ?? []).length;
  const confirmSlots = (article.match(/\[확인 필요[^\]]*\]/g) ?? []).length;
  const hasSources = /https?:\/\//.test(article) || draft.sources.some((s) => s.url);
  const hasTable = /\|\s*선택지\s*\|/.test(article) || /<table/i.test(article);
  const hasDate = /정보 기준일:\s*\d{4}[.-]\d{2}[.-]\d{2}/.test(article);
  const hasFaq = (article.match(/Q\d\./g) ?? []).length >= 3;
  const scoreMap: Record<string, number> = {
    '검색 의도 및 독자 목적': draft.audience && article.includes(draft.topic) ? 13 : 8,
    '정보 정확성·출처': hasSources ? Math.max(7, 14 - Math.min(confirmSlots, 5)) : Math.min(8, 12 - Math.min(confirmSlots, 5)),
    '전문성·경험·독창성': Math.max(8, (draft.experienceMemo ? 18 : 14) - Math.min(experienceSlots * 2, 8)),
    '심층분석·비교·실용성': hasTable ? (hasFaq ? 14 : 12) : 9,
    '제목·구조·가독성': article.split('\n').filter((l) => l.startsWith('■')).length >= 4 ? 9 : 6,
    '주제 일관성·키워드': draft.keywords.some((k) => article.includes(k)) ? 9 : 7,
    '최신성 및 기준일': hasDate ? 5 : 2,
    '이미지·표·영상 적절성': /\[이미지 \d+/.test(article) || draft.images.length ? 4 : 2,
    '진정성·스팸 위험 관리': /(무조건|수익 보장|폭등 확정|대박)/.test(article) ? 2 : 5
  };
  const items: EvaluationItem[] = CRITERIA.map(([name, max]) => ({
    name, max, score: Math.max(0, Math.min(max, scoreMap[name])),
    reason: localReason(name, { hasSources, hasTable, hasDate, experienceSlots, confirmSlots }),
    fix: localFix(name, { hasSources, hasTable, hasDate, experienceSlots, confirmSlots })
  }));
  const total = items.reduce((sum, item) => sum + item.score, 0);
  const topFixes = items.slice().sort((a, b) => (a.score / a.max) - (b.score / b.max)).slice(0, 3).map((i) => i.fix);
  return { items, total, grade: total >= 90 ? '발행 권장' : total >= 80 ? '보완 후 발행' : '재작성 권장', topFixes, evaluatedAt: new Date().toISOString(), evaluatorType: 'local' };
}

function localReason(name: string, s: any) {
  if (name === '정보 정확성·출처') return `${s.hasSources ? '출처 링크가 있습니다.' : '출처 링크가 없습니다.'} 확인 필요 ${s.confirmSlots}개를 반영했습니다.`;
  if (name === '전문성·경험·독창성') return `작성자 경험 자리표시 ${s.experienceSlots}개를 반영했습니다.`;
  if (name === '심층분석·비교·실용성') return s.hasTable ? '대안 비교표가 있습니다.' : '대안 비교표가 없습니다.';
  if (name === '최신성 및 기준일') return s.hasDate ? '정보 기준일이 표시됩니다.' : '정보 기준일이 없습니다.';
  return '본문의 정적 구조와 금칙 표현을 로컬에서 점검했습니다.';
}
function localFix(name: string, s: any) {
  if (name === '정보 정확성·출처') return s.hasSources ? '남은 [확인 필요] 항목을 원문과 대조하세요.' : '공식 원문 링크와 발표일을 추가하세요.';
  if (name === '전문성·경험·독창성') return '실제 방문일·관찰·고객 질문을 직접 입력하세요.';
  if (name === '심층분석·비교·실용성') return '독자 상황별 대안과 위험을 비교표로 보강하세요.';
  if (name === '최신성 및 기준일') return '첫머리에 정보 기준일을 YYYY.MM.DD로 넣으세요.';
  return `${name} 항목을 사람이 읽고 구체적인 근거와 표현을 보완하세요.`;
}
