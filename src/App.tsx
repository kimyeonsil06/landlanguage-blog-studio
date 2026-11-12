import { useEffect, useState } from 'react';
import { AiDialog } from './components/AiDialog';
import { Landing } from './components/Landing';
import { Archive } from './components/Archive';
import { Settings } from './components/Settings';
import { StepOne } from './components/StepOne';
import { StepTwo } from './components/StepTwo';
import { StepThree } from './components/StepThree';
import { Icon } from './components/Icon';
import { createDraft, localArticle, localOutline, localTitles } from './lib/draft';
import { composeDraft } from './lib/compose';
import { saveArchive, loadCurrent, saveCurrent } from './lib/storage';
import type { AITask, Draft } from './types';

const stages = ['주제 설정','아웃라인 구성','본문 작성'];
export default function App() {
  const [draft, setDraft] = useState<Draft>(loadCurrent);
  const [step,setStep] = useState(draft.article ? 3 : draft.outline.length ? 2 : 1);
  const [route,setRoute] = useState(()=>window.location.hash.slice(1));
  const page = route==='archive'?'archive':'write';
  const inStudio = route==='write' || route==='archive';
  useEffect(()=>{
    const readLocation=()=>setRoute(window.location.hash.slice(1));
    window.addEventListener('hashchange',readLocation);
    return ()=>window.removeEventListener('hashchange',readLocation);
  },[]);
  useEffect(()=>{
    if(inStudio || !route || route==='intro') window.scrollTo(0,0);
    else document.getElementById(route)?.scrollIntoView();
  },[route,inStudio]);
  const [sidebar,setSidebar] = useState(false);
  const [settings,setSettings] = useState(false);
  const [aiTask,setAiTask] = useState<AITask|null>(null);
  const [message,setMessage] = useState('');
  const [saved,setSaved] = useState(false);
  const [busy,setBusy] = useState<AbortController|null>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = draft.theme;
    const success = saveCurrent(draft);
    setSaved(success);
    if (!success) setMessage('이 브라우저에 저장할 수 없습니다. 원고를 파일로 내보내세요.');
  },[draft]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(()=>setMessage(''),6500);
    return () => clearTimeout(timer);
  },[message]);
  const update = (patch:Partial<Draft>) => setDraft(old => ({
    ...old, ...(patch.topic !== undefined && patch.topic !== old.topic ? {titles:[], outline:[], title:old.titles.includes(old.title)?'':old.title} : {}),
    ...(patch.evaluation === undefined && Object.keys(patch).some(k=>k !== 'theme') ? {evaluation:undefined} : {}),
    ...patch, updatedAt:new Date().toISOString()
  }));
  const go = (n:number) => { setStep(n); window.scrollTo({top:0, behavior:'instant'}); };
  const validate = () => {
    if (!draft.topic.trim()) { setMessage('작성할 주제를 입력해 주세요.'); document.querySelector<HTMLInputElement>('#post-topic')?.focus(); return false; }
    if (draft.sources.some(s=>s.url && !/^https?:\/\//i.test(s.url))) { setMessage('참고 자료의 URL을 확인해 주세요.'); return false; }
    return true;
  };
  const next = () => {
    if(!validate()) return;
    if(step===1) update({titles:draft.titles.length?draft.titles:localTitles(draft),outline:draft.outline.length?draft.outline:localOutline(draft)});
    if(step===2 && !draft.outline.length) {setMessage('아웃라인 항목을 하나 이상 추가하세요.');return;}
    if(step===2 && !draft.title) update({title:draft.titles[0] || draft.topic});
    go(step+1);
  };
  const compose = async () => {
    if(!validate() || busy) return;
    if (draft.article && !confirm('현재 본문을 새 초안으로 교체할까요?')) return;
    const controller = new AbortController(); setBusy(controller);
    try {
      const result = await composeDraft(draft,controller.signal);
      if(controller.signal.aborted) return;
      setDraft(result.draft); go(3); setMessage(result.source+'으로 초안을 작성했습니다. 본문과 출처를 검토해 주세요.');
    } catch(e) { setMessage(controller.signal.aborted ? '초안 생성을 취소했습니다.' : e instanceof Error && e.name !== 'ZodError' ? e.message : '생성 결과의 형식을 확인할 수 없습니다. 다시 시도하거나 단계별 작성을 이용하세요.'); }
    finally { setBusy(null); }
  };
  const save = () => setMessage(saveArchive(draft)?'보관함에 저장했습니다.':'보관함에 저장할 수 없습니다. 파일로 내보내세요.');
  const navigate = (p:'write'|'archive') => {window.location.hash=p; setSidebar(false); window.scrollTo(0,0);};
  const newDraft = () => {
    if ((draft.topic || draft.article) && !confirm('현재 원고를 닫고 새 글을 시작할까요? 보관할 원고는 보관함에 먼저 저장하세요.')) return;
    setDraft({...createDraft(), theme:draft.theme,author:draft.author,officeProfile:draft.officeProfile});
    navigate('write');go(1);
  };
  const openAI = (task:AITask) => { if(validate()) setAiTask(task); };
  if(!inStudio) return <Landing/>;
  return <div className="app-shell">
    <aside className={'sidebar '+(sidebar?'open':'')}>
      <div className="studio-brand"><div className="studio-logo"><Icon name="layers" size={25}/></div><div><strong>랜드랭귀지</strong><small>BLOG STUDIO</small></div><button aria-label="메뉴 닫기" className="mobile-only icon-btn" onClick={()=>setSidebar(false)}>×</button></div>
      <nav aria-label="주 메뉴"><a href="#intro"><Icon name="home"/>서비스 소개</a><div className="nav-label">워크스페이스</div>
        <button className={page==='write'?'active':''} onClick={()=>navigate('write')}><Icon name="pen"/> 포스팅 작성</button>
        <button className={page==='archive'?'active':''} onClick={()=>navigate('archive')}><Icon name="archive"/> 내 보관함</button>
        <div className="nav-label second-label">도구</div>
        <a href="https://help.naver.com/service/5593/contents/10582" target="_blank" rel="noreferrer"><Icon name="book"/> 검색 노출 가이드 <Icon name="upRight" size={13}/></a>
        <button onClick={()=>{setSettings(true);setSidebar(false);}}><Icon name="settings"/> 스튜디오 설정</button>
      </nav>
      <div className="office-id"><span className="office-icon"><Icon name="home"/></span><div><b>태왕아너스부동산</b><small>개인 워크스페이스</small></div></div>
    </aside>
    {sidebar && <div className="sidebar-scrim" onClick={()=>setSidebar(false)}/>}
    <div className="main-area"><header className="topbar">
      <button className="mobile-only icon-btn" aria-label="메뉴 열기" onClick={()=>setSidebar(true)}><Icon name="menu"/></button>
      <div className="crumb"><Icon name="grid" size={16}/><span>워크스페이스</span><Icon name="chevron" size={12}/><strong>{page==='write'?'포스팅 작성':'내 보관함'}</strong></div>
      <div className="top-actions"><a className="instagram-shortcut" href="./instagram/" target="_blank" rel="noreferrer" aria-label="인스타그램 카드뉴스 스튜디오 새 창에서 열기"><Icon name="instagram" size={16}/><span>인스타그램</span></a><button className="icon-btn" onClick={()=>update({theme:draft.theme==='light'?'dark':'light'})} aria-label="테마 전환"><Icon name="moon"/></button><button className="secondary new-post" onClick={newDraft}><Icon name="plus" size={15}/>새 글</button></div>
    </header>
    {page==='write' ? <main className="workspace">
      <section className="workspace-title"><div><small>LANDLANGUAGE BLOG STUDIO</small><h1>부동산 포스팅 스튜디오</h1><p>주제를 정하고, 자료와 현장 경험을 담은 원고를 작성하세요.</p></div></section>
      <div className="workflow" aria-label="작성 단계">{stages.map((label,i)=><button key={label} disabled={i+1>step} aria-current={i+1===step?'step':undefined} className={step===i+1?'current':step>i+1?'finished':''} onClick={()=>go(i+1)}><span className="step-no">{step>i+1?<Icon name="check" size={15}/>:i+1}</span>{label}{i<2&&<i/>}</button>)}</div>
      {step===1 && <StepOne draft={draft} update={update} openAI={openAI} compose={compose} next={next}/>}
      {step===2 && <StepTwo draft={draft} update={update} openAI={openAI}/>}
      {step===3 && <StepThree draft={draft} update={update} openAI={openAI}/>}
      <div className="studio-footer"><span><Icon name="cloud" size={17}/>{saved?'브라우저에 저장됨':'저장 상태 확인 필요'}</span><div className="row wrap">
      {step>1 && <button className="secondary" onClick={()=>go(step-1)}>이전 단계</button>}
      {step===2 && <button onClick={next}>본문 작성으로 <Icon name="arrow" size={16}/></button>}
      {step===3 && <button className="secondary" onClick={()=>{if(!draft.article || confirm('현재 본문을 로컬 템플릿으로 교체할까요?')) update({article:localArticle(draft)});}}>템플릿으로 다시 작성</button>}
      <button className="save studio-save" onClick={save}><Icon name="archive" size={16}/> 보관함에 저장</button></div></div>
    </main> : <Archive onLoad={item=>{setDraft(item); navigate('write');go(item.article?3:item.outline.length?2:1);}}/>}</div>
    {message && <div className="toast" role="status">{message}</div>}
    {busy && <div className="modal-backdrop"><section className="modal generate-progress" role="dialog" aria-modal="true"><Icon name="spark" size={30}/><h2>초안을 작성하고 있습니다</h2><p>제목과 본문을 구성하고 품질 항목을 점검합니다.</p><button className="secondary" onClick={()=>busy.abort()}>생성 취소</button></section></div>}
    {aiTask && <AiDialog task={aiTask} draft={draft} onClose={()=>setAiTask(null)} onApply={setDraft}/>}
    {settings && <Settings onClose={()=>setSettings(false)}/>}
  </div>;
}
