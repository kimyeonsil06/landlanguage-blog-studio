import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { newId } from '../lib/draft';
import type { AITask, Draft, NewsItem, Source } from '../types';

export function StepOne({ draft, update, openAI }: { draft: Draft; update(patch: Partial<Draft>): void; openAI(task: AITask): void }) {
  const [keyword, setKeyword] = useState(''); const [tab, setTab] = useState<'direct' | 'news'>('direct');
  const [news, setNews] = useState<NewsItem[]>([]); const [newsMessage, setNewsMessage] = useState('뉴스 상태를 확인하지 않았습니다.');
  useEffect(() => { if (tab === 'news') api.news().then((r) => { setNews(r.items); setNewsMessage(r.message); }).catch((e) => setNewsMessage(e.message)); }, [tab]);
  const addKeyword = () => { const value = keyword.trim().replace(/,$/, ''); if (!value) return; if (draft.keywords.includes(value)) return setKeyword(''); update({ keywords: [...draft.keywords, value].slice(0, 10) }); setKeyword(''); };
  const updateSource = (id: string, patch: Partial<Source>) => update({ sources: draft.sources.map((s) => s.id === id ? { ...s, ...patch } : s) });
  const addNews = (item: NewsItem) => {
    update({ topic: item.title.slice(0, 30), sources: draft.sources.length < 5 && !draft.sources.some((s) => s.url === item.url) ? [...draft.sources, { id: newId(), title: item.title, organization: item.organization, publishedAt: item.publishedAt.slice(0, 10), url: item.url, excerpt: '', verified: false }] : draft.sources });
    setTab('direct');
  };
  return <div className="step-content">
    <section className="card hero-card"><div><span className="eyebrow">STEP 01 · CONTENT BRIEF</span><h1>어떤 부동산 이야기를 작성할까요?</h1><p>확인된 자료와 실제 경험을 입력할수록 더 신뢰도 높은 글을 만들 수 있습니다.</p></div><div className="hero-symbol" aria-hidden="true"><span>✦</span></div></section>
    <div className="step-one-layout"><div className="step-one-main"><div className="tabs" role="tablist"><button className={tab === 'direct' ? 'active' : ''} onClick={() => setTab('direct')}>직접 입력</button><button className={tab === 'news' ? 'active' : ''} onClick={() => setTab('news')}>오늘의 핫이슈 TOP 20</button></div>
    {tab === 'news' ? <section className="card"><h2>오늘의 부동산 주제</h2><div className="notice">TOP 20은 이 서비스의 주제 선정 결과이며 네이버 공식 인기순위가 아닙니다. {newsMessage}</div>{news.length ? <div className="news-list">{news.map((item) => <button key={item.url} className="news-item" onClick={() => addNews(item)}><strong>{item.title}</strong><span>{item.organization} · {item.publishedAt || '발행시각 확인 필요'}</span></button>)}</div> : <div className="empty">가짜 기사를 만들지 않습니다. 연결 가능한 RSS가 없으면 직접 입력을 이용하세요.</div>}</section> : <>
      <section className="card form-grid">
        <label className="span-2">작성자 <span className="counter">{draft.author.length}/50</span><input value={draft.author} maxLength={50} onChange={(e) => update({ author: e.target.value })} /></label>
        <label>주제 <span className="required">필수</span><input value={draft.topic} maxLength={30} onChange={(e) => update({ topic: e.target.value })} placeholder="예: 구축아파트" aria-invalid={!draft.topic} />{!draft.topic && <small className="field-error">다음 단계로 가려면 주제를 입력하세요.</small>}</label>
        <label>블로그 제목 <span className="optional">선택</span><input value={draft.title} maxLength={50} onChange={(e) => update({ title: e.target.value })} placeholder="비워두면 Step 2에서 3안을 제안합니다" /></label>
        <label>글의 목적과 독자<select value={draft.audience} onChange={(e) => update({ audience: e.target.value })}><option>실거주</option><option>투자 검토</option><option>매도·매수 상담</option><option>정책 해설</option><option>직접 입력</option></select></label>
        <label>말투<select value={draft.tone} onChange={(e) => update({ tone: e.target.value as Draft['tone'] })}><option>~해요</option><option>~습니다</option><option>~한다</option><option>~과거형</option></select></label>
        <label>정보 기준일<input type="date" value={draft.informationDate} onChange={(e) => update({ informationDate: e.target.value })} /></label>
        <label>목표 분량 (공백 포함)<input type="number" min="500" max="20000" step="500" value={draft.targetLength} onChange={(e) => update({ targetLength: Number(e.target.value) })} /><small>제작 목표일 뿐 SEO 보장 기준이 아닙니다.</small></label>
      </section>
      <section className="card"><div className="section-head"><div><h2>핵심 키워드</h2><p>최대 10개 · 띄어쓰기는 유지되고 Enter 또는 쉼표로 추가합니다.</p></div><button className="text-btn" onClick={() => openAI('suggestKeywords')}>AI 제안</button></div><div className="tag-input">{draft.keywords.map((k, i) => <span className="tag" key={`${k}-${i}`}><input aria-label={`키워드 ${i + 1}`} value={k} onChange={(e) => update({ keywords: draft.keywords.map((v, x) => x === i ? e.target.value : v) })} /><button aria-label={`${k} 삭제`} onClick={() => update({ keywords: draft.keywords.filter((_, x) => x !== i) })}>×</button></span>)}<input value={keyword} onChange={(e) => { const value = e.target.value; if (value.endsWith(',')) { setKeyword(value.slice(0, -1)); setTimeout(addKeyword); } else setKeyword(value); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }} placeholder="키워드 입력" /><button className="small" onClick={addKeyword}>추가</button></div></section>
      <section className="card"><div className="section-head"><div><h2>강조하고 싶은 내용</h2><p>사실로 확인할 항목과 독자에게 꼭 전할 내용을 적으세요.</p></div><button className="text-btn" onClick={() => openAI('suggestEmphasis')}>AI 제안</button></div>{draft.emphasis.map((v, i) => <div className="list-edit" key={i}><input value={v} onChange={(e) => update({ emphasis: draft.emphasis.map((x, n) => n === i ? e.target.value : x) })} /><button className="icon-btn" onClick={() => update({ emphasis: draft.emphasis.filter((_, n) => n !== i) })} aria-label="삭제">×</button></div>)}<button className="secondary" onClick={() => update({ emphasis: [...draft.emphasis, ''] })}>+ 항목 추가</button></section>
      <section className="card"><h2>직접 경험 메모 <span className="optional">선택</span></h2><textarea rows={6} maxLength={2000} value={draft.experienceMemo} onChange={(e) => update({ experienceMemo: e.target.value })} placeholder="현장 방문일, 관찰사항, 상담 사례, 실제 고객 질문을 입력하세요. 비워두면 본문에 노란색 자리표시가 남습니다." /><div className="counter right">{draft.experienceMemo.length}/2,000</div></section>
      <Sources draft={draft} update={update} updateSource={updateSource} />
      <Office draft={draft} update={update} />
      <section className="card toggle-row"><div><h2>최신 검색정보 활용</h2><p>실제 검색 연결이 있을 때만 결과 URL과 발행시각을 참고합니다.</p></div><label className="switch"><input type="checkbox" checked={draft.latestSearch} onChange={(e) => update({ latestSearch: e.target.checked })} /><span /></label><div className="notice span-2">현재 기본 구성은 검색 연결이 없어 입력한 참고 자료만 사용합니다. RSS는 `.env`에서 별도 연결할 수 있습니다.</div></section>
    </>}</div><StepOneGuide draft={draft} />
    </div>
  </div>;
}

function StepOneGuide({ draft }: { draft: Draft }) {
  const checks = [
    ['주제', !!draft.topic, draft.topic || '주제를 입력해 주세요'],
    ['핵심 키워드', draft.keywords.length > 0, draft.keywords.length ? `${draft.keywords.length}개 입력` : '입력 또는 AI 제안'],
    ['강조사항', draft.emphasis.some(Boolean), draft.emphasis.some(Boolean) ? `${draft.emphasis.filter(Boolean).length}개 입력` : '선택 입력'],
    ['근거 자료', draft.sources.length > 0, draft.sources.length ? `${draft.sources.length}개 연결` : '출처 확인 필요']
  ] as const;
  return <aside className="step-guide">
    <section className="card readiness-card"><div className="guide-title"><span className="guide-icon">✓</span><div><span className="eyebrow">WRITING READINESS</span><h2>작성 준비도</h2></div></div><div className="readiness-list">{checks.map(([label, ok, detail]) => <div key={label} className={ok ? 'ready' : ''}><span>{ok ? '✓' : '○'}</span><div><strong>{label}</strong><small>{detail}</small></div></div>)}</div><div className="guide-note">가짜 점수 대신 실제 입력 상태만 표시합니다.</div></section>
    <section className="card structure-card"><span className="eyebrow">ARTICLE STRUCTURE</span><h2>완성 글 구성</h2><ol><li><span>01</span>정보 기준일과 도입</li><li><span>02</span>소제목과 핵심 근거</li><li><span>03</span>대안 비교표와 이미지</li><li><span>04</span>상황별 판단 기준</li><li><span>05</span>FAQ·참고 자료·프로필</li></ol></section>
    <section className="card audience-card"><span className="guide-icon purple">◎</span><h2>이 글의 독자</h2><p><strong>{draft.audience}</strong> 관점에서 <strong>{draft.topic || '선택한 주제'}</strong>의 판단 기준과 확인 순서를 찾는 독자입니다.</p></section>
  </aside>;
}

function Sources({ draft, update, updateSource }: { draft: Draft; update(p: Partial<Draft>): void; updateSource(id: string, p: Partial<Source>): void }) {
  return <section className="card"><div className="section-head"><div><h2>참고 자료</h2><p>최대 5개 · 원문을 자동 복제하지 않습니다.</p></div><button className="secondary" disabled={draft.sources.length >= 5} onClick={() => update({ sources: [...draft.sources, { id: newId(), title: '', organization: '', publishedAt: '', url: '', excerpt: '', verified: false }] })}>+ 자료 추가</button></div>
    {draft.sources.map((s, i) => <div className="source-box" key={s.id}><div className="row"><strong>자료 {i + 1}</strong><button className="icon-btn" aria-label="자료 삭제" onClick={() => update({ sources: draft.sources.filter((x) => x.id !== s.id) })}>×</button></div><div className="form-grid"><label>출처명<input value={s.organization} onChange={(e) => updateSource(s.id, { organization: e.target.value })} /></label><label>발표일<input type="date" value={s.publishedAt} onChange={(e) => updateSource(s.id, { publishedAt: e.target.value })} /></label><label className="span-2">제목<input value={s.title} onChange={(e) => updateSource(s.id, { title: e.target.value })} /></label><label className="span-2">URL<input type="url" value={s.url} aria-invalid={!!s.url && !/^https?:\/\//.test(s.url)} onChange={(e) => updateSource(s.id, { url: e.target.value })} />{!!s.url && !/^https?:\/\//.test(s.url) && <small className="field-error">http:// 또는 https://로 시작해야 합니다.</small>}</label><label className="span-2">원문/요약<textarea rows={4} value={s.excerpt} onChange={(e) => updateSource(s.id, { excerpt: e.target.value })} /></label></div></div>)}
    {!draft.sources.length && <div className="empty">입력한 자료가 없습니다. 확인되지 않은 사실은 본문에 [확인 필요]로 남습니다.</div>}
  </section>;
}
function Office({ draft, update }: { draft: Draft; update(p: Partial<Draft>): void }) {
  const set = (key: keyof Draft['officeProfile'], value: string) => update({ officeProfile: { ...draft.officeProfile, [key]: value } });
  return <details className="card"><summary><strong>공인중개사 프로필</strong> <span className="optional">선택</span></summary><div className="form-grid top-gap"><label>사무소 상호<input value={draft.officeProfile.businessName} onChange={(e) => set('businessName', e.target.value)} /></label><label>대표자 성명<input value={draft.officeProfile.representative} onChange={(e) => set('representative', e.target.value)} /></label><label className="span-2">사무소 주소<input value={draft.officeProfile.address} onChange={(e) => set('address', e.target.value)} /></label><label>전화번호<input value={draft.officeProfile.phone} onChange={(e) => set('phone', e.target.value)} /></label><label>중개사무소 등록번호<input value={draft.officeProfile.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} /></label><label>글 표시 위치<select value={draft.officeProfile.display} onChange={(e) => set('display', e.target.value)}><option>상단</option><option>하단</option><option>미표시</option></select></label><div className="notice">입력하지 않은 연락처·주소·등록번호는 채우지 않습니다. 추가 법적 의무 표시는 사람의 확인이 필요합니다.</div></div></details>;
}
