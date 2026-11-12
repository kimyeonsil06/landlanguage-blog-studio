import { useState } from 'react';
import { createDraft, localTitles, localOutline, localArticle } from '../lib/draft';
import { evaluateLocally } from '../lib/evaluation';
import { saveArchive } from '../lib/storage';
import { Icon } from './Icon';
import type { Draft } from '../types';

const steps = ['주제 설정','아웃라인 구성','본문 작성 및 검증'];
export const examples = [
  {topic:'아파트 임장 체크리스트', keywords:['아파트 임장','현장 점검','생활권 비교']},
  {topic:'전세 계약 준비', keywords:['전세 계약','보증금','준비 서류']},
  {topic:'실거래가 살펴보기', keywords:['실거래가','매매 사례','단지 비교']}
];
const initialDraft = (example:number):Draft => ({...createDraft(),...examples[example],author:'',experienceMemo:''});

export function StudioPreview({example}:{example:number}) {
  const [draft,setDraft] = useState(()=>initialDraft(example));
  const [step,setStep] = useState(0);
  const [feedback,setFeedback] = useState('');
  const titles = draft.topic.trim() ? localTitles(draft) : [];
  const outline = draft.outline.length ? draft.outline : draft.topic.trim() ? localOutline(draft) : [];
  function edit(patch:Partial<Draft>) {
    setDraft(old=>({...old,article:'',title:'',outline:[],evaluation:undefined,...patch}));
    if(step===2) setStep(0);
    setFeedback('');
  }
  function showStage(index:number) {
    if (!draft.topic.trim()) {setFeedback('포스팅 핵심 주제를 입력해 주세요.');return;}
    if(index===2 && !draft.article) {
      const next = {...draft,titles,outline,title:draft.title || titles[0]};
      next.article = localArticle(next);
      next.evaluation = evaluateLocally(next);
      setDraft(next);
    }
    setStep(index);setFeedback('');
  }
  function save() {
    if(!draft.topic.trim()) {setFeedback('주제를 입력한 뒤 저장해 주세요.');return;}
    const ok=saveArchive({...draft,titles,outline,title:draft.title || titles[0]});
    setFeedback(ok?'내 보관함에 저장했습니다.':'브라우저 저장 공간을 확인해 주세요.');
  }
  async function copy() {
    const text = draft.article || [draft.title || titles[0],...outline.map(s=>s.heading)].join('\n');
    try {await navigator.clipboard.writeText(text);setFeedback('텍스트를 복사했습니다.');}
    catch {setFeedback('브라우저에서 복사 권한을 확인해 주세요.');}
  }
  return <div className="ll-canvas">
    <div className="ll-canvasbar"><div className="ll-steps" aria-label="체험 단계">{steps.map((label,i)=><button key={label} aria-current={i===step?'step':undefined} onClick={()=>showStage(i)}><b>{i+1}</b>{label}</button>)}</div><span className="ll-demo">예시 원고 체험</span></div>
    <div className="ll-split">
      <div className="ll-fields">
        <div className="ll-line"><h3>분석 매물 &amp; 타겟 정보</h3><small className="ll-date">기준일 {draft.informationDate}</small></div>
        <label>포스팅 핵심 주제<input value={draft.topic} maxLength={30} onChange={e=>edit({topic:e.target.value})}/></label>
        <div><strong className="ll-label">타겟 검색 키워드</strong><div className="ll-chips">{draft.keywords.map(k=><button key={k} onClick={()=>edit({keywords:draft.keywords.filter(v=>v!==k)})} aria-label={k+' 삭제'}>#{k} <span>×</span></button>)}{!draft.keywords.length&&<small>선택한 키워드가 없습니다.</small>}</div></div>
        <div className="ll-selects"><div className="ll-style"><strong className="ll-label">체험 문체</strong><span>정중체 (~습니다)</span></div><label>대상 독자<select value={draft.audience} onChange={e=>edit({audience:e.target.value})}><option>실거주</option><option>투자 검토</option><option>매도·매수 상담</option><option>정책 해설</option></select></label></div>
        <label className="ll-note"><span><Icon name="pen" size={16}/> 공인중개사 현장 메모</span><textarea rows={2} maxLength={2000} placeholder="방문일, 현장에서 확인한 사실을 적어보세요." value={draft.experienceMemo} onChange={e=>edit({experienceMemo:e.target.value})}/></label>
        <button className="ll-button primary" onClick={()=>step===2?showStage(0):showStage(step+1)}><Icon name="spark" size={16}/>{step===0?'다음 단계: 아웃라인 구성':step===1?'본문 작성 및 품질 점검':'주제 설정으로 돌아가기'}</button>
      </div>
      <div className="ll-output">
        <div className="ll-line preview-status"><div><b>NAVER BLOG PREVIEW</b> <small>원고 미리보기</small></div><small>품질 점수 <strong>{draft.evaluation?.total ?? '—'} / 100</strong></small></div>
        {step<2 ? <><div className="ll-previewcard"><strong>주제에 맞는 제목 3선</strong>{titles.map((title,i)=><button className={(draft.title || titles[0])===title?'chosen':''} key={title} onClick={()=>{edit({title});}}>{i+1}안. {title}<span>{(draft.title || titles[0])===title?'✓':'선택'}</span></button>)}</div>
        <div className="ll-previewcard"><h4><Icon name="list" size={18}/>{step===0?'아웃라인 미리보기':'생성된 아웃라인 구조'}</h4><ol>{outline.filter(s=>s.type==='body'||s.type==='conclusion').map(s=><li key={s.order}>{s.heading}{step===1&&<small>{s.notes}</small>}</li>)}</ol></div></>:
        <div className="ll-previewcard ll-result"><h4>{draft.title}</h4><p>{draft.article}</p></div>}
        <div className="ll-preview-actions"><small role="status">{feedback || '로컬 템플릿 체험'}</small><button className="ll-button secondary" disabled={!draft.topic.trim()} onClick={copy}>텍스트 복사</button><button className="ll-button save" onClick={save}><Icon name="archive" size={16}/>보관함 저장</button></div>
      </div>
    </div></div>;
}
