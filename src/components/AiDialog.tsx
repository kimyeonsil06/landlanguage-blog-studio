import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { newId } from '../lib/draft';
import type { AITask, Draft, Evaluation } from '../types';

interface Props { task: AITask | null; draft: Draft; onClose(): void; onApply(next: Draft): void; }
export function AiDialog({ task, draft, onClose, onApply }: Props) {
  const [prompt, setPrompt] = useState(''); const [pasted, setPasted] = useState('');
  const [status, setStatus] = useState('프롬프트를 준비하는 중입니다…'); const [busy, setBusy] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);
  useEffect(() => {
    if (!task) return; const abort = new AbortController(); setController(abort); setBusy(true);
    api.ai(task, draft, abort.signal).then((data) => {
      setPrompt(data.prompt); setStatus(data.mode === 'automatic' ? `${data.provider}에서 결과를 받았습니다.` : '프롬프트를 복사해 외부 AI에서 실행한 뒤 결과를 붙여넣으세요.');
      if (data.result) { setPasted(JSON.stringify(data.result, null, 2)); }
    }).catch((e) => setStatus(e.message)).finally(() => setBusy(false));
    return () => abort.abort();
  }, [task]);
  if (!task) return null;
  const apply = () => {
    try {
      const raw = pasted.trim(); let value: any;
      try { value = JSON.parse(raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')); }
      catch { if (task === 'generateArticle' || task === 'reviseArticle') value = { article: raw }; else throw new Error('JSON 형식으로 붙여넣어 주세요.'); }
      const next = { ...draft, updatedAt: new Date().toISOString() };
      if (task === 'suggestKeywords') next.keywords = unique((value.keywords || []).map(String)).slice(0, 10);
      if (task === 'suggestEmphasis') next.emphasis = (value.emphasis || []).map(String).slice(0, 20);
      if (task === 'generateTitles') next.titles = unique((value.titles || []).map(String)).slice(0, 3);
      if (task === 'generateOutline') {
        next.titles = unique((value.titles || next.titles).map(String)).slice(0, 3);
        next.outline = (value.sections || []).map((s: any, order: number) => ({ id: newId(), type: String(s.type || 'body'), heading: String(s.heading || `항목 ${order + 1}`), notes: String(s.notes || ''), order, sourceIds: Array.isArray(s.sourceIds) ? s.sourceIds.map(String) : [], imageIdeas: Array.isArray(s.imageIdeas) ? s.imageIdeas : [] }));
        if (!next.outline.length) throw new Error('sections 배열이 비어 있습니다.');
      }
      if (task === 'generateArticle' || task === 'reviseArticle') { if (!value.article) throw new Error('article 값이 없습니다.'); next.article = String(value.article); }
      if (task === 'evaluateArticle') next.evaluation = validateEvaluation(value);
      onApply(next); onClose();
    } catch (e) { setStatus(`적용 실패: ${e instanceof Error ? e.message : '결과 형식을 확인하세요.'}`); }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="ai-title">
      <div className="modal-head"><div><span className="eyebrow">AI 연결 또는 수동 실행</span><h2 id="ai-title">{taskLabel[task]}</h2></div><button className="icon-btn" onClick={onClose} aria-label="닫기">×</button></div>
      <div className={`notice ${status.startsWith('적용 실패') ? 'error' : ''}`}>{status}</div>
      <label>실행 프롬프트<textarea className="prompt-box" value={prompt} readOnly rows={10} /></label>
      <div className="row wrap"><button onClick={() => navigator.clipboard.writeText(prompt)} disabled={!prompt}>프롬프트 복사</button>{busy && <button className="secondary" onClick={() => controller?.abort()}>생성 취소</button>}</div>
      <label>외부 AI 결과 붙여넣기<textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={10} placeholder={task.includes('Article') ? 'JSON 또는 본문 텍스트를 붙여넣으세요.' : 'JSON 결과를 붙여넣으세요.'} /></label>
      <div className="modal-actions"><button className="secondary" onClick={onClose}>닫기</button><button onClick={apply} disabled={!pasted.trim()}>검증 후 적용</button></div>
    </section>
  </div>;
}

const taskLabel: Record<AITask, string> = { suggestKeywords: '키워드 제안', suggestEmphasis: '강조사항 제안', generateTitles: '제목 3안 생성', generateOutline: '아웃라인 생성', generateArticle: '본문 생성', evaluateArticle: 'AI 품질 평가', reviseArticle: '평가 기준으로 보완' };
const unique = (items: string[]) => [...new Set(items.map((s) => s.trim()).filter(Boolean))];
function validateEvaluation(value: any): Evaluation {
  if (!Array.isArray(value.items) || value.items.length !== 9) throw new Error('평가 항목은 정확히 9개여야 합니다.');
  const items = value.items.map((i: any) => ({ name: String(i.name), max: Number(i.max), score: Number(i.score), reason: String(i.reason), fix: String(i.fix) }));
  if (items.some((i: any) => !Number.isFinite(i.score) || i.score < 0 || i.score > i.max)) throw new Error('항목 점수 범위를 확인하세요.');
  const max = items.reduce((s: number, i: any) => s + i.max, 0); const total = items.reduce((s: number, i: any) => s + i.score, 0);
  if (max !== 100 || Number(value.total) !== total) throw new Error('배점 또는 점수 합계가 올바르지 않습니다.');
  return { items, total, grade: total >= 90 ? '발행 권장' : total >= 80 ? '보완 후 발행' : '재작성 권장', topFixes: (value.topFixes || []).map(String).slice(0, 3), evaluatedAt: new Date().toISOString(), evaluatorType: 'ai' };
}
