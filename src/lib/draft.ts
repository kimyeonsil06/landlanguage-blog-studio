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
  const key = draft.keywords[0] || draft.topic;
  return [
    `${key} ${draft.topic}, 먼저 확인할 핵심 기준`,
    `${draft.topic} 선택 전 알아둘 장점과 주의점`,
    `${key} 관점에서 살펴본 ${draft.topic} 체크리스트`
  ].map((title) => title.slice(0, 50));
}

export function localOutline(draft: Draft): OutlineSection[] {
  const section = (type: string, heading: string, notes: string, order: number): OutlineSection => ({
    id: newId(), type, heading, notes, order, sourceIds: [],
    imageIdeas: [{ caption: `${heading}의 핵심 내용을 한눈에 정리`, query: `${draft.topic} ${heading}`, directPhoto: order === 3 }]
  });
  return [
    section('intro', '도입부 요지', `${draft.audience} 독자가 ${draft.topic}을 검토할 때 얻을 판단 기준을 안내합니다.`, 0),
    section('toc', '목차', '핵심 개념 → 확인 기준 → 대안 비교 → 실행 절차 순서', 1),
    section('body', `■ 1. ${draft.topic}을 볼 때 먼저 확인할 점`, '정의와 범위를 설명하고, 변동 가능한 내용은 출처와 기준일을 연결합니다.', 2),
    section('body', '■ 2. 현장에서 확인할 체크리스트', draft.experienceMemo || '[작성자 경험 입력: 현장 방문일·관찰사항·고객 질문 등]', 3),
    section('body', '■ 3. 대안별 장단점과 주의사항', '검증된 정보만으로 비교하며 수치가 없으면 [확인 필요]로 표시합니다.', 4),
    section('guide', '■ 4. 상담 전 준비할 단계', '예산·입주시점·생활권·권리관계를 순서대로 확인합니다.', 5),
    section('conclusion', '결론과 생각할 거리', '독자 상황에 따른 선택 기준을 요약합니다.', 6),
    section('cta', '다음 행동 제안', '과도한 광고 없이 자료 확인 또는 전문가 상담을 권합니다.', 7)
  ];
}

export function localArticle(draft: Draft): string {
  const date = draft.informationDate.replaceAll('-', '.');
  const title = draft.title || draft.titles[0] || draft.topic;
  const experience = draft.experienceMemo.trim()
    ? `제공해 주신 현장 메모를 기준으로 보면 다음과 같습니다.\n${draft.experienceMemo.trim()}`
    : '[작성자 경험 입력: 현장 방문일·관찰사항·고객 질문 등]';
  const refs = draft.sources.length
    ? draft.sources.map((s, i) => `${i + 1}. ${s.organization || s.title} (${s.publishedAt || '발표일 확인 필요'}) ${s.url || '[원문 링크 확인 필요]'}`).join('\n')
    : '[확인 필요: 활용할 공식 자료 또는 원문 링크]';
  const office = draft.officeProfile.display === '하단' && Object.values(draft.officeProfile).some(Boolean)
    ? `\n■ 중개사무소 안내\n상호: ${draft.officeProfile.businessName || '[확인 필요]'}\n주소: ${draft.officeProfile.address || '[확인 필요]'}\n대표: ${draft.officeProfile.representative || '[확인 필요]'}\n전화: ${draft.officeProfile.phone || '[확인 필요]'}\n등록번호: ${draft.officeProfile.registrationNumber || '[확인 필요]'}` : '';
  return `정보 기준일: ${date}\n\n${title}\n\n${draft.audience} 관점에서 ${draft.topic}을 검토할 때 무엇을 먼저 확인해야 하는지 정리했습니다. 이 글은 입력한 자료와 기준일을 바탕으로 판단 순서를 안내하며, 확인되지 않은 사실은 별도로 표시합니다.\n\n■ 1. ${draft.topic}을 이해하는 기준\n\n같은 조건처럼 보여도 위치, 사용승인 시점, 관리 상태, 자금 계획에 따라 판단이 달라질 수 있습니다. 먼저 본인의 목적과 입주 시점을 구체화해야 합니다.\n\n${draft.emphasis.length ? `특히 살펴볼 내용은 ${draft.emphasis.join(', ')}입니다.` : '강조할 세부 내용은 작성자가 직접 보완해 주세요.'}\n\n[이미지 1: ${draft.topic} 확인 기준을 정리한 카드뉴스]\n\n■ 2. 현장에서 확인할 체크리스트\n\n${experience}\n\n- 공용부와 전용부의 관리 상태를 나누어 확인합니다.\n- 등기·건축물대장 등 권리 및 공적 자료는 최신 발급본으로 확인합니다.\n- 가격·세금·대출 조건은 계약 시점과 개인 조건에 따라 달라질 수 있습니다.\n\n■ 3. 대안 비교표\n\n| 선택지 | 장점 | 확인할 위험 | 어울리는 상황 |\n| 구축 | 생활 인프라를 직접 확인하기 쉬움 | 수선 범위·관리 상태 [확인 필요] | 입지와 현재 생활권을 중시할 때 |\n| 신축 | 새 설비와 평면 선택 가능성 | 분양 조건·입주시점 [확인 필요] | 초기 관리 편의성을 중시할 때 |\n| 다른 생활권 | 예산 대안 탐색 가능 | 통근·교육·생활 변화 [확인 필요] | 선택 범위를 넓힐 수 있을 때 |\n\n표의 수치와 개별 단지 사실은 입력 자료만으로 확인되지 않았습니다. 실제 검토 시 대상 단지와 공식 자료를 기준으로 다시 비교해야 합니다.\n\n■ 4. 상황별 판단 기준\n\n- 실거주: 통근, 돌봄, 생활 편의, 실제 수선 부담의 우선순위를 정합니다.\n- 투자 검토: 보유 기간과 자금 조달 위험을 먼저 점검하고, 수익을 단정하지 않습니다.\n- 단기 자금 수요: 처분 기간과 거래 비용을 보수적으로 검토합니다.\n\n■ 5. 상담 전 준비 순서\n\n1. 예산과 필요 시점을 적습니다.\n2. 후보별 공적 자료와 현장 상태를 확인합니다.\n3. 변동 가능한 세금·대출·정책은 기준일에 맞춰 재확인합니다.\n4. 장점뿐 아니라 포기해야 할 조건도 함께 비교합니다.\n\n■ 결론\n\n${draft.topic}은 한 가지 수치만으로 결정하기 어렵습니다. 본인의 생활 조건과 자금 계획을 먼저 정하고, 확인 가능한 자료와 현장 관찰을 함께 놓고 판단하는 것이 안전합니다.\n\n■ 자주 묻는 질문\n\nQ1. ${draft.topic}은 무엇부터 확인해야 하나요?\n목적과 예산, 입주 시점을 먼저 정한 뒤 공적 자료와 현장 상태를 확인해야 합니다. 변동 가능한 조건은 정보 기준일에 맞춰 다시 점검합니다.\n\nQ2. 온라인 정보만으로 결정해도 되나요?\n온라인 자료는 후보를 좁히는 데 유용하지만 실제 상태와 권리관계를 모두 대신하지는 못합니다. 원문 출처와 현장을 함께 확인하는 편이 안전합니다.\n\nQ3. 상담 전에 무엇을 준비하면 좋나요?\n예산 범위, 희망 시점, 우선 생활권, 포기하기 어려운 조건을 적어 두면 좋습니다. 확인하고 싶은 질문도 목록으로 만들면 상담 시간을 효율적으로 쓸 수 있습니다.\n\n■ 참고 자료\n${refs}${office}`;
}
