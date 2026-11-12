import { useState } from 'react';
import { Icon } from './Icon';
import { StudioPreview, examples } from './StudioPreview';
import { CRITERIA } from '../lib/evaluation';

const metrics = [
  ['검색 의도 및 독자 목적 부합성','독자가 어떤 결정을 앞두고 있는지 정하고, 제목에서 던진 질문에 본문이 답하는지 살펴봅니다.','독자가 찾는 질문과 답'],
  ['정보 정확성 및 출처 명시','가격과 일정처럼 달라질 수 있는 정보에는 발표 기관과 날짜, 원문을 함께 기록합니다.','출처 링크와 확인할 항목'],
  ['전문성·경험·독창성','직접 방문한 날짜, 현장에서 관찰한 사실, 상담 중 받은 질문을 원고에 담습니다.','작성자 경험과 현장 메모'],
  ['심층 분석·비교·실용성','여러 선택지를 같은 조건에서 비교하고 실제로 적용할 수 있는 확인 순서를 제시합니다.','비교표와 자주 묻는 질문'],
  ['제목·소제목·문단 가독성','제목과 소제목으로 내용을 구분하고 긴 설명을 짧은 문단으로 나눕니다.','소제목과 문단 구성'],
  ['주제 일관성 및 키워드','주제와 관련된 핵심 단어를 문맥에 맞게 쓰고, 의미 없는 반복을 줄입니다.','제목과 본문의 주제 일치'],
  ['최신성 및 정보 기준일','자료를 확인한 날짜를 명시해 독자가 정보의 시점을 판단할 수 있게 합니다.','정보 기준일 표시'],
  ['이미지·표·데이터 적절성','현장 사진과 비교표가 본문에서 어떤 내용을 설명하는지 캡션으로 연결합니다.','사진 설명과 표의 역할'],
  ['진정성 및 스팸 위험 관리','확인할 수 없는 경험이나 수익을 보장하는 표현이 들어 있는지 검토합니다.','과장 표현 점검']
];
const features = [
  ['book','철저한 출처 & 기준일 안내','원문 링크와 발표일을 원고에 연결하고, 자료가 부족한 곳은 확인할 항목으로 남깁니다.','참고 자료와 정보 기준일'],
  ['file','네이버 맞춤 원고 복사','검토한 원고를 서식과 함께 복사한 뒤 네이버 글쓰기 창에서 최종 편집합니다.','서식 복사 및 텍스트 내보내기'],
  ['home','공인중개사 프로필 반영','직접 입력한 사무소 정보와 연락처를 원하는 위치에 배치할 수 있습니다.','상단·하단·미표시 선택']
] as const;
const ribbon = [
  ['layers','네이버 블로그','편집기용 원고 복사'],['list','9가지 품질 평가','100점 기준 자체 점검'],
  ['news','기준일 및 출처','참고 자료와 날짜 기록'],['archive','전문가 데이터 보관함','원고 저장 및 다시 편집']
] as const;
const nav=[['서비스 소개','intro'],['주요 기능','interactive-preview'],['품질 평가','core-process'],['활용 사례','examples']];
export function Landing() {
  const [example,setExample]=useState(0);
  const [mobileMenu,setMobileMenu]=useState(false);
  return <div className="ll-home">
    <header className="ll-header"><div className="ll-bound ll-head-inner"><a className="ll-brand" href="#intro"><span className="ll-mark"><Icon name="layers" size={23}/></span><strong>랜드랭귀지</strong><span>BLOG STUDIO</span></a>
      <nav aria-label="제품 소개" className={mobileMenu?'expanded':''}>{nav.map(([label,id])=><a key={id} href={'#'+id} onClick={()=>setMobileMenu(false)}>{label}</a>)}</nav>
      <div className="ll-head-actions"><a className="ll-instagram" href="./instagram/" target="_blank" rel="noreferrer" aria-label="인스타그램 카드뉴스 스튜디오 새 창에서 열기"><Icon name="instagram" size={17}/><span>인스타그램</span></a><a className="ll-archive" href="#archive">내 보관함</a><a className="ll-button primary" href="#write">스튜디오 시작하기</a><button className="ll-menu" aria-label="안내 메뉴" aria-expanded={mobileMenu} onClick={()=>setMobileMenu(!mobileMenu)}><Icon name="menu"/></button></div>
    </div></header>
    <main>
      <section className="ll-hero" id="intro"><div className="ll-bound">
        <span className="ll-pill"><Icon name="check" size={15}/> 공인중개사 &amp; 부동산 기획자를 위한 전문 AI 솔루션</span>
        <h1>출처가 확실한 부동산 글쓰기,<br/><em>3단계로 완성</em>하는 스마트 블로그 스튜디오</h1>
        <p>주제 설정부터 아웃라인 구성, 본문 작성, 100점 품질 점검까지.<br/>현장 경험과 자료를 담은 네이버 블로그 원고를 작성하세요.</p>
        <div className="ll-ctas"><a className="ll-button primary" href="#interactive-preview">스튜디오 무료 체험하기 <Icon name="arrow" size={17}/></a><a className="ll-button secondary" href="#core-process">작성 프로세스 살펴보기</a></div>
        <div className="ll-ribbon">{ribbon.map(([icon,name,caption],i)=><div key={name}><span className={'ll-tile tint'+i}><Icon name={icon} size={20}/></span><div><strong>{name}</strong><small>{caption}</small></div></div>)}</div>
      </div></section>
      <section className="ll-section ll-tinted" id="interactive-preview"><div className="ll-bound">
        <div className="ll-heading"><span>STUDIO CANVAS</span><h2>직관적인 3단계 인터랙티브 스튜디오</h2><p>예시 주제를 바꾸고, 아웃라인과 본문이 어떻게 구성되는지 확인해 보세요.</p></div>
        <StudioPreview key={example} example={example}/>
      </div></section>
      <section className="ll-section" id="core-process"><div className="ll-bound">
        <div className="ll-heading"><span>100-POINT QUALITY METRIC</span><h2>콘텐츠의 신뢰도를 점검하는<br/>9가지 품질 평가 기준</h2><p>스튜디오의 자체 점검표로 원고를 검토하고 보완할 부분을 찾습니다.</p></div>
        <div className="ll-grid">{metrics.map(([name,body,check],i)=><article className={'ll-metric '+(i===2?'featured':'')} key={name}><div className="ll-line"><b>{String(i+1).padStart(2,'0')}</b><small>{CRITERIA[i][1]}점 배점</small></div><h3>{name}</h3><p>{body}</p><footer><Icon name="check" size={14}/>{check}</footer></article>)}</div>
      </div></section>
      <section className="ll-section ll-white" id="features"><div className="ll-bound">
        <div className="ll-heading left"><span>PROPERTY &amp; AUTHENTICITY</span><h2>확인한 자료와 현장 경험을<br/>한 편의 원고에 담습니다</h2><p>공인중개사가 직접 검토하고 편집할 수 있도록 구성했습니다.</p></div>
        <div className="ll-grid">{features.map(([icon,title,body,note],i)=><article className="ll-feature" key={title}><span className={'ll-tile tint'+[2,0,3][i]}><Icon name={icon}/></span><h3>{title}</h3><p>{body}</p><div><Icon name="check" size={15}/>{note}</div></article>)}</div>
      </div></section>
      <section className="ll-section ll-tinted" id="examples"><div className="ll-bound">
        <div className="ll-heading"><span>FOR PROPERTY BROKERS</span><h2>현장 업무에 맞춰 시작하는<br/>부동산 포스팅 활용 사례</h2><p>작성하고 싶은 주제를 선택하면 체험 영역에서 예시 원고를 살펴볼 수 있습니다.</p></div>
        <div className="ll-grid">{examples.map((e,i)=><article className="ll-example" key={e.topic}><span className="ll-stars"><Icon name="book" size={21}/></span><h3>{e.topic}</h3><p>{['방문 전 동선과 현장에서 살펴볼 항목을 독자가 따라 할 수 있는 순서로 정리합니다.','임차인이 확인할 자료, 자금 일정, 상담 질문을 체크리스트로 구성합니다.','비교 가능한 거래 사례를 고르고, 가격 차이가 나는 조건을 정리합니다.'][i]}</p><a href="#interactive-preview" onClick={()=>setExample(i)}>예시로 작성하기 <Icon name="arrow" size={15}/></a></article>)}</div>
      </div></section>
      <section className="ll-final ll-bound"><div><span>부동산 전문 블로그 스튜디오</span><h2>지금 바로 첫 부동산 전문 블로그를 작성해 보세요</h2><p>주제를 입력하고, 직접 확인한 사실과 현장 경험을 더하세요.</p><div className="ll-ctas"><a className="ll-button secondary" href="#write">스튜디오 바로 시작하기 <Icon name="arrow" size={17}/></a><a className="ll-button ghost" href="#archive">내 보관함 열기</a></div></div></section>
    </main>
    <footer className="ll-footer"><div className="ll-bound"><div><strong>랜드랭귀지 블로그 스튜디오</strong><p>공인중개사와 부동산 전문가를 위한 콘텐츠 작성 스튜디오</p></div><div><b>솔루션 탐색</b><a href="#interactive-preview">3단계 스튜디오</a><a href="#core-process">품질 점검 기준</a></div><div><b>워크스페이스</b><a href="#write">포스팅 작성</a><a href="#archive">원고 보관함</a></div></div></footer>
  </div>;
}
