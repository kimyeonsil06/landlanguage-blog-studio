import type { Draft, OutlineSection } from '../types';

export const newId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function koreaToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function createDraft(): Draft {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1, id: newId(), createdAt: now, updatedAt: now,
    author: '태왕아너스공인중개사사무소 김연실 공인중개사', topic: '', title: '', titles: [],
    audience: '실거주', keywords: [], emphasis: [], tone: '~습니다', experienceMemo: '', sources: [],
    informationDate: koreaToday(), targetLength: 6000,
    officeProfile: { businessName: '', address: '', representative: '', phone: '', registrationNumber: '', display: '하단' },
    outline: [], article: '', images: [], status: '초안', theme: 'light', latestSearch: false,
    advertisingDisclosure: ''
  };
}

export function localTitles(draft: Draft): string[] {
  const key = draft.keywords.find(k => k.trim() && !draft.topic.includes(k));
  return [
    `${draft.topic}, 먼저 확인할 세 가지`,
    `${draft.audience}를 위한 ${draft.topic}${draft.topic.endsWith('체크리스트') ? '' : ' 체크리스트'}`,
    key ? `${draft.topic}, ${key}까지 살펴보는 방법` : `${draft.topic}에 관해 자주 묻는 질문`
  ].map(title => title.slice(0,50));
}

function topicNotes(topic:string) {
  if (/전세|임대차|보증금/.test(topic)) return [
    ['계약 전에 준비할 자료','계약하려는 집의 정확한 주소와 호수를 기록합니다. 계약 당사자, 서류에 적힌 소유자, 실제 방문한 주택이 일치하는지 각각 살펴봅니다.'],
    ['보증금과 지급 일정','보증금 외에 계약을 진행하며 지출할 비용을 따로 적습니다. 계약금과 잔금을 지급할 날짜를 자기 자금이 준비되는 시점과 나란히 놓고 비교합니다.'],
    ['서면으로 남길 질문','수선할 곳, 입주 가능한 날짜, 포함되는 시설을 질문 목록에 적습니다. 현장에서 들은 설명은 계약서에 어떻게 반영되는지 확인합니다.']
  ];
  if (/실거래|매매가|시세/.test(topic)) return [
    ['비교 조건 좁히기','지역과 단지 이름을 정한 뒤 전용면적, 층, 계약 시기를 함께 기록합니다. 조건이 다른 주택은 별도 행에 적어 비교합니다.'],
    ['호가와 거래 기록 구분','매물에 표시된 희망 가격과 신고된 거래 금액을 구분합니다. 거래 기록을 인용할 때는 조회한 날짜와 원문에서 확인한 거래 상태를 함께 적습니다.'],
    ['숫자에 담기지 않은 차이','같은 단지에서도 향, 내부 수선 상태, 조망이 다를 수 있습니다. 가격 차이를 한 가지 원인으로 해석하기 전에 실제 매물 조건을 확인합니다.']
  ];
  if (/임장|아파트|생활권|답사/.test(topic)) return [
    ['방문 전 동선 정하기','평일에 자주 이용할 목적지부터 정합니다. 단지 입구에서 정류장이나 학교까지 직접 걸어볼 경로를 지도에 표시합니다.'],
    ['집 안과 공용부 살펴보기','창문을 열고 닫아 소음 차이를 들어봅니다. 현관부터 승강기까지 이동하며 채광, 계단, 주차장 접근성을 각각 기록합니다.'],
    ['후보를 같은 조건에서 비교하기','방문 시간과 날씨를 함께 기록합니다. 한낮과 퇴근 시간의 차이가 궁금한 곳은 다시 찾아가 같은 지점에서 관찰합니다.']
  ];
  return [
    [topic+'의 적용 범위','먼저 대상 지역과 확인하려는 시점을 적습니다. 같은 명칭이라도 적용 대상이 달라질 수 있으므로 원문에서 대상과 예외를 함께 확인합니다.'],
    ['자료에서 확인할 항목','발표일과 실제 적용일을 구분해서 기록합니다. 여러 자료의 설명이 다르면 대상 지역과 조사 기간을 나누어 살펴봅니다.'],
    ['내 상황에 적용할 질문','내가 꼭 충족해야 하는 조건을 먼저 적습니다. 자료만으로 판단하기 어려운 점은 질문 목록으로 옮겨 현장이나 해당 기관에 확인합니다.']
  ];
}

export function localOutline(draft:Draft): OutlineSection[] {
  const section = (type:string, heading:string, notes:string, order:number):OutlineSection => ({
    id:newId(),type,heading,notes,order,sourceIds:[],
    imageIdeas:[{caption:heading+' 확인 항목',query:draft.topic+' '+heading,directPhoto:type==='body'}]
  });
  return [
    section('intro','도입',`${draft.audience} 관점에서 살펴볼 주제는 ‘${draft.topic}’입니다. 필요한 자료와 확인 순서를 정리했습니다.`,0),
    section('toc','목차','본문에서 확인할 내용',1),
    ...topicNotes(draft.topic).map(([heading,notes],i)=>section('body',heading,notes,i+2)),
    section('guide','현장에서 확인한 내용',draft.experienceMemo.trim() || '[작성자 경험 입력: 방문 날짜와 직접 확인한 사실]',5),
    section('conclusion','결정 전 점검',draft.emphasis.filter(Boolean).join('\n') || '지금 확인한 점과 추가로 확인할 점을 구분해 기록합니다.',6),
    section('cta','다음 단계','비교 중인 후보마다 궁금한 점을 한 가지씩 적어 다음 방문이나 상담 때 확인해 보세요.',7)
  ];
}

export function localArticle(draft:Draft):string {
  const sections = draft.outline.length ? draft.outline : localOutline(draft);
  const parts = ['정보 기준일: '+draft.informationDate.replaceAll('-','.'),draft.title || draft.titles[0] || draft.topic];
  const office = draft.officeProfile;
  const profile = [office.businessName,office.representative,office.address,office.phone,office.registrationNumber].filter(Boolean).join(' · ');
  if(draft.advertisingDisclosure) parts.push(draft.advertisingDisclosure);
  if(profile && office.display==='상단') parts.push(profile);
  for(const section of sections) {
    const references = draft.sources.filter(s=>section.sourceIds.includes(s.id)).map(s=>[s.organization,s.publishedAt,s.url].filter(Boolean).join(' '));
    parts.push('■ '+section.heading.replace(/^■\s*/, ''),section.notes);
    if(section.type==='toc') parts.push(sections.filter(s=>s.type==='body').map(s=>'- '+s.heading).join('\n'));
    if(references.length) parts.push(references.join('\n'));
  }
  if(draft.experienceMemo && !sections.some(s=>s.notes.includes(draft.experienceMemo))) parts.push('■ 직접 확인한 내용',draft.experienceMemo);
  if(draft.emphasis.some(Boolean) && !sections.some(s=>s.notes===draft.emphasis.filter(Boolean).join('\n'))) parts.push('■ 중점 확인 항목',draft.emphasis.filter(Boolean).map(v=>'- '+v).join('\n'));
  parts.push('■ 자료 비교표','| 선택지 | 확인 방법 | 기록할 항목 |\n| 자료 조사 | 원문에서 범위와 기준일 확인 | 출처, 발표일, 적용 대상 |\n| 현장 방문 | 같은 질문으로 후보별 점검 | 방문 시점, 직접 관찰한 차이 |');
  parts.push('■ 자주 묻는 질문',topicNotes(draft.topic).map(([head,answer],i)=>`Q${i+1}. ${head}에서 무엇을 살펴보나요?\n${answer.split('. ')[0].replace(/\.$/,'')}.`).join('\n\n'));
  parts.push('■ 참고 자료',draft.sources.length ? draft.sources.map(s=>[s.title,s.organization,s.publishedAt,s.url].filter(Boolean).join(' · ') || '[확인 필요: 출처 정보]').join('\n') : '[확인 필요: 인용할 자료의 발표일과 원문 링크]');
  if(draft.images.length) parts.push(...draft.images.map((image,i)=>`[이미지 ${i+1}: ${image.caption || image.alt}]`));
  if(profile && office.display==='하단') parts.push('■ 중개사무소 안내',profile);
  if(draft.author) parts.push('작성자 '+draft.author);
  return parts.filter(Boolean).join('\n\n');
}
