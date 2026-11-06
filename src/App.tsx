import { useEffect, useState } from 'react';
import { AiDialog } from './components/AiDialog';
import { Archive } from './components/Archive';
import { Settings } from './components/Settings';
import { StepOne } from './components/StepOne';
import { StepTwo } from './components/StepTwo';
import { StepThree } from './components/StepThree';
import { createDraft, localArticle, localOutline, localTitles } from './lib/draft';
import { saveArchive, loadCurrent, saveCurrent } from './lib/storage';
import type { AITask, Draft } from './types';

export default function App() {
  const [draft, setDraft] = useState<Draft>(loadCurrent); const [step, setStep] = useState(1); const [page, setPage] = useState<'write' | 'archive'>('write');
  const [sidebar, setSidebar] = useState(false); const [aiTask, setAiTask] = useState<AITask | null>(null); const [settings, setSettings] = useState(false); const [message, setMessage] = useState('');
  const update = (patch: Partial<Draft>) => setDraft((old) => ({ ...old, ...patch, updatedAt: new Date().toISOString() }));
  useEffect(() => { document.documentElement.dataset.theme = draft.theme; const timer = setTimeout(() => { if (!saveCurrent(draft)) setMessage('자동 저장에 실패했습니다. 브라우저 저장소 설정을 확인하세요.'); }, 300); return () => clearTimeout(timer); }, [draft]);
  const next = () => {
    if (step === 1) { if (!draft.topic.trim()) return setMessage('주제를 입력해야 다음 단계로 이동할 수 있습니다.'); const nextDraft = { ...draft, titles: draft.titles.length ? draft.titles : localTitles(draft), outline: draft.outline.length ? draft.outline : localOutline(draft) }; setDraft(nextDraft); setStep(2); }
    else if (step === 2) { if (!draft.title && draft.titles[0]) update({ title: draft.titles[0] }); if (!draft.outline.length) return setMessage('아웃라인을 만들거나 항목을 추가하세요.'); setStep(3); }
    setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const generateLocal = () => { if (!draft.article || confirm('현재 본문을 새 버전으로 덮어쓸까요? 보관함에 먼저 저장할 수 있습니다.')) update({ article: localArticle(draft), evaluation: undefined }); };
  const save = () => { const ok = saveArchive(draft); setMessage(ok ? '보관함에 저장했습니다.' : '저장 공간이 부족하거나 localStorage를 사용할 수 없습니다. JSON으로 내보내 백업하세요.'); };
  const load = (item: Draft) => { setDraft(item); setPage('write'); setStep(item.article ? 3 : item.outline.length ? 2 : 1); };
  const newDraft = () => { if (confirm('현재 작업을 보관함에 저장하지 않았다면 잃을 수 있습니다. 새 글을 시작할까요?')) { setDraft(createDraft()); setPage('write'); setStep(1); } };
  return <div className="app-shell">
    <aside className={`sidebar ${sidebar ? 'open' : ''}`}><div className="brand"><div className="brand-mark" aria-hidden="true"><i /><i /><i /></div><div><strong>태왕아너스</strong><span>BLOG STUDIO</span></div><button className="icon-btn mobile-only" onClick={() => setSidebar(false)} aria-label="메뉴 닫기">×</button></div><nav aria-label="주 메뉴"><button className={page === 'write' ? 'active' : ''} onClick={() => { setPage('write'); setSidebar(false); }}><span>✦</span> AI 글쓰기</button><button className="sub active" onClick={() => { setPage('write'); setSidebar(false); }}>정보성(부동산)</button><button className={page === 'archive' ? 'active' : ''} onClick={() => { setPage('archive'); setSidebar(false); }}><span>▣</span> 보관함</button><div className="nav-label">준비 중</div>{['방문후기', '뉴스로 블로그 쓰기', '유튜브로 블로그 쓰기', '키워드 분석'].map((name) => <button disabled key={name}>{name}<small>준비 중</small></button>)}</nav><div className="sidebar-bottom"><div className="connection-card"><span className="connection-dot" /><div><strong>프롬프트 모드</strong><small>AI 연결 없이도 사용 가능</small></div></div><button onClick={() => setSettings(true)}>⚙ 설정 및 연결 상태</button><p>브라우저 로컬 저장 · 자동 발행 없음</p></div></aside>
    <div className="main-area"><header className="topbar"><button className="icon-btn mobile-only" onClick={() => setSidebar(true)} aria-label="메뉴 열기">☰</button><div><strong>{page === 'archive' ? '보관함' : draft.title || draft.topic || '새 정보성 글'}</strong><span>{draft.informationDate} 기준 · 실시간 저장</span></div><div className="top-actions"><span className="engine-pill"><i /> 프롬프트 모드</span><button className="icon-btn" onClick={() => update({ theme: draft.theme === 'light' ? 'dark' : 'light' })} aria-label="테마 전환">{draft.theme === 'light' ? '◐' : '☀'}</button><button className="secondary" onClick={newDraft}>+ 새 글</button></div></header>
      {page === 'write' ? <><div className="stepper-wrap"><div className="stepper-label"><span>CONTENT WORKFLOW</span><strong>3단계 전문 콘텐츠 저작</strong></div><div className="stepper" aria-label="작성 단계">{[1, 2, 3].map((n) => <button key={n} className={`${step === n ? 'active' : ''} ${step > n ? 'done' : ''}`} onClick={() => n <= step && setStep(n)}><span>{step > n ? '✓' : `0${n}`}</span><div><strong>{n === 1 ? '주제 설정' : n === 2 ? '아웃라인 구성' : '글쓰기 완료'}</strong><small>{n === 1 ? '자료와 독자 정의' : n === 2 ? '논리 구조 설계' : '검토·복사·저장'}</small></div></button>)}</div></div><main className="workspace">{step === 1 && <StepOne draft={draft} update={update} openAI={setAiTask} />}{step === 2 && <StepTwo draft={draft} update={update} openAI={setAiTask} />}{step === 3 && <StepThree draft={draft} update={update} openAI={setAiTask} />}</main>{message && <div className="toast" role="status" onClick={() => setMessage('')}>{message}</div>}<div className="actionbar"><div className="action-status"><span className="connection-dot" /><div><strong>로컬 자동 저장</strong><small>{draft.updatedAt ? '변경 사항이 브라우저에 보관됩니다' : '저장 대기'}</small></div></div><button className="secondary" disabled={step === 1} onClick={() => setStep(step - 1)}>이전</button><div className="action-spacer" />{step < 3 ? <button onClick={next}>{step === 1 ? '다음: 아웃라인 구성' : '다음: 본문 작성'}</button> : <><button className="secondary" onClick={generateLocal}>로컬 안전 템플릿</button><button onClick={() => setAiTask('generateArticle')}>생성 / 다시 생성</button></>}<button className="save" onClick={save}>보관함에 저장</button></div></> : <Archive onLoad={load} />}
    </div>
    {sidebar && <div className="sidebar-scrim" onClick={() => setSidebar(false)} />}
    <AiDialog task={aiTask} draft={draft} onClose={() => setAiTask(null)} onApply={setDraft} />{settings && <Settings onClose={() => setSettings(false)} />}
  </div>;
}
