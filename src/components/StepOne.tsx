import { Icon } from './Icon';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { localTitles, localOutline, newId } from '../lib/draft';
import type { AITask, Draft, NewsItem, Source } from '../types';

export function StepOne({ draft, update, openAI, compose, next }: { compose():void; next():void; draft: Draft; update(patch: Partial<Draft>): void; openAI(task: AITask): void }) {
  const [view,setView] = useState<'edit'|'preview'>('edit');
  const [keyword, setKeyword] = useState(''); const [tab, setTab] = useState<'direct' | 'news'>('direct');
  const [news, setNews] = useState<NewsItem[]>([]); const [newsMessage, setNewsMessage] = useState('뉴스 상태를 확인하지 않았습니다.');
  useEffect(() => { if (tab === 'news') api.news().then((r) => { setNews(r.items); setNewsMessage(r.message); }).catch((e) => setNewsMessage(e.message)); }, [tab]);
  const addKeyword = (raw = keyword) => { const value = raw.trim().replace(/,$/, ''); if (!value) return; if (draft.keywords.includes(value)) return setKeyword(''); update({ keywords: [...draft.keywords, value].slice(0, 10) }); setKeyword(''); };
  const updateSource = (id: string, patch: Partial<Source>) => update({ sources: draft.sources.map((s) => s.id === id ? { ...s, ...patch } : s) });
  const addNews = (item: NewsItem) => {
    update({ topic: item.title.slice(0, 30), sources: draft.sources.length < 5 && !draft.sources.some((s) => s.url === item.url) ? [...draft.sources, { id: newId(), title: item.title, organization: item.organization, publishedAt: item.publishedAt.slice(0, 10), url: item.url, excerpt: '', verified: false }] : draft.sources });
    setTab('direct');
  };
  return <div className="step-content">
    <div className="brief-mobile-tabs" aria-label="주제 설정 보기"><button aria-pressed={view==='edit'} onClick={()=>setView('edit')}>입력</button><button aria-pressed={view==='preview'} onClick={()=>setView('preview')}>미리보기</button></div>
    <div className={'step-one-layout brief-view-'+view}><div className="step-one-main">
    <section className="card brief-card"><div className="brief-title"><span className="tile-icon"><Icon name="pen" size={20}/></span><h2>주제 설정</h2></div>
    <div className="input-tabs" role="tablist"><button role="tab" aria-selected={tab==='direct'} onClick={()=>setTab('direct')}><Icon name="pen" size={15}/>직접 입력</button><button role="tab" aria-selected={tab==='news'} onClick={()=>setTab('news')}><Icon name="news" size={15}/>오늘의 핫이슈</button></div>
    {tab === 'news' ? <section className="card"><h2>오늘의 부동산 주제</h2><div className="notice">TOP 20은 이 서비스의 주제 선정 결과이며 네이버 공식 인기순위가 아닙니다. {newsMessage}</div>{news.length ? <div className="news-list">{news.map((item) => <button key={item.url} className="news-item" onClick={() => addNews(item)}><strong>{item.title}</strong><span>{item.organization} · {item.publishedAt || '발행시각 확인 필요'}</span></button>)}</div> : <div className="empty">표시할 기사가 없습니다. 직접 입력에서 주제를 작성할 수 있습니다.</div>}</section> : <>
      <div className="brief-fields">
        <label htmlFor="post-topic"><span>포스팅 주제 <em>*</em></span><textarea id="post-topic" rows={2} maxLength={30} value={draft.topic} onChange={e=>update({topic:e.target.value})} placeholder="어떤 부동산 이야기를 작성할까요?" /><small className="field-count">{draft.topic.length} / 30</small></label>
        <div className="suggested-topics"><small>주제 예시</small>{['아파트 임장 체크리스트','전세 계약 준비','실거래가 살펴보기'].map(t=><button key={t} onClick={()=>update({topic:t})}>{t}</button>)}</div>
        <label><span>블로그 제목 <small>선택</small></span><input maxLength={50} value={draft.title} onChange={e=>update({title:e.target.value})} placeholder="비워두면 주제에 맞는 제목을 제안합니다" /></label>
      </div>
      <details className="brief-details"><summary><Icon name="settings" size={16}/>작성 옵션 <span>{draft.audience} · {draft.tone}</span></summary><div className="form-grid top-gap">
        <label className="span-2">작성자<input maxLength={50} value={draft.author} onChange={e=>update({author:e.target.value})}/></label>
        <label>글의 목적과 독자<select value={draft.audience} onChange={(e) => update({ audience: e.target.value })}><option>실거주</option><option>투자 검토</option><option>매도·매수 상담</option><option>정책 해설</option></select></label>
        <label>말투<select value={draft.tone} onChange={(e) => update({ tone: e.target.value as Draft['tone'] })}><option>~해요</option><option>~습니다</option><option>~한다</option><option>~과거형</option></select></label>
        <label>정보 기준일<input type="date" value={draft.informationDate} onChange={(e) => update({ informationDate: e.target.value })} /></label>
        <label>목표 분량 (공백 포함)<input type="number" min="500" max="20000" step="500" value={draft.targetLength} onChange={(e) => update({ targetLength: Number(e.target.value) })} /><small>제작 목표일 뿐 SEO 보장 기준이 아닙니다.</small></label>
      </div></details></>}
      <div className="brief-actions"><button className="secondary" onClick={next}>단계별 작성<Icon name="chevron" size={14}/></button><button onClick={compose}><Icon name="spark" size={16}/> 초안 자동 생성</button></div></section>
      <section className="card"><div className="section-head"><div><h2>핵심 키워드</h2><p>최대 10개 · 띄어쓰기는 유지되고 Enter 또는 쉼표로 추가합니다.</p></div><button className="text-btn" onClick={() => openAI('suggestKeywords')}>AI 제안</button></div><div className="tag-input">{draft.keywords.map((k, i) => <span className="tag" key={`${k}-${i}`}><input aria-label={`키워드 ${i + 1}`} value={k} onChange={(e) => update({ keywords: draft.keywords.map((v, x) => x === i ? e.target.value : v) })} /><button aria-label={`${k} 삭제`} onClick={() => update({ keywords: draft.keywords.filter((_, x) => x !== i) })}>×</button></span>)}<input value={keyword} onChange={(e) => { const value = e.target.value; if (value.endsWith(',')) { addKeyword(value.slice(0,-1)); } else setKeyword(value); }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addKeyword(); } }} placeholder="키워드 입력" /><button className="small" onClick={()=>addKeyword()}>추가</button></div></section>
      <section className="card"><div className="section-head"><div><h2>강조하고 싶은 내용</h2><p>사실로 확인할 항목과 독자에게 꼭 전할 내용을 적으세요.</p></div><button className="text-btn" onClick={() => openAI('suggestEmphasis')}>AI 제안</button></div>{draft.emphasis.map((v, i) => <div className="list-edit" key={i}><input value={v} onChange={(e) => update({ emphasis: draft.emphasis.map((x, n) => n === i ? e.target.value : x) })} /><button className="icon-btn" onClick={() => update({ emphasis: draft.emphasis.filter((_, n) => n !== i) })} aria-label="삭제">×</button></div>)}<button className="secondary" onClick={() => update({ emphasis: [...draft.emphasis, ''] })}>+ 항목 추가</button></section>
      <section className="card"><h2>직접 경험 메모 <span className="optional">선택</span></h2><textarea rows={6} maxLength={2000} value={draft.experienceMemo} onChange={(e) => update({ experienceMemo: e.target.value })} placeholder="현장 방문일, 관찰사항, 상담 사례, 실제 고객 질문을 입력하세요. 비워두면 본문에 노란색 자리표시가 남습니다." /><div className="counter right">{draft.experienceMemo.length}/2,000</div></section>
      <Sources draft={draft} update={update} updateSource={updateSource} />
      <Office draft={draft} update={update} />
    </div><StepOneGuide draft={draft} />
    </div>
  </div>;
}

function StepOneGuide({draft}: {draft:Draft}) {
  const checks: [string,boolean][] = [['포스팅 주제',!!draft.topic.trim()],['핵심 키워드',draft.keywords.some(Boolean)],['현장 경험 메모',!!draft.experienceMemo.trim()],['참고 자료',draft.sources.some(s=>s.url || s.excerpt)]];
  const done=checks.filter(([,yes])=>yes).length;
  const titles = draft.topic.trim() ? (draft.titles.length ? draft.titles : localTitles(draft)) : [];
  const headings = draft.topic.trim() ? (draft.outline.length ? draft.outline : localOutline(draft)).filter(s=>s.type==='body') : [];
  return <aside className="step-guide"><section className="card writer-preview"><div className="writer-preview-head"><strong>NAVER BLOG PREVIEW</strong><small>원고 미리보기</small></div><h2>제목 · 아웃라인</h2>{titles.length ? <><div className="writer-titles">{titles.map(title=><p key={title}>{title}</p>)}</div><ol>{headings.map(section=><li key={section.order}>{section.heading}</li>)}</ol></> : <p>주제를 입력하면 제목 후보와 글의 구성을 미리 볼 수 있습니다.</p>}</section><section className="card checklist">
    <div className="check-heading"><span className="tile-icon mint"><Icon name="list" size={19}/></span><h2>작성 체크리스트</h2></div>
    <div className="progress-label"><span>입력 현황</span><b>{done} <small>/ 4</small></b></div>
    <progress max={4} value={done} aria-label="입력 현황"/>
    <ul>{checks.map(([label,ok])=><li key={label}><span className={ok?'checked':''}>{ok&&<Icon name="check" size={12}/>}</span>{label}</li>)}</ul>
  </section><section className="search-tip"><div><Icon name="bulb" size={19}/><h2>검색 노출 작성 팁</h2></div><p>독자가 궁금해하는 질문을 주제로 잡고, 직접 확인한 현장 경험과 출처를 함께 담아보세요.</p><a href="https://help.naver.com/service/5626/contents/22926" target="_blank" rel="noreferrer">네이버 검색 가이드 <Icon name="upRight" size={13}/></a></section></aside>;
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
