import { useEffect, useState } from 'react';
import { api, selectEngine } from '../lib/api';
import type { ProviderStatus } from '../types';

export function Settings({ onClose }: { onClose(): void }) {
  const [data, setData] = useState<{ providers: ProviderStatus[]; active: string; guideLoaded: boolean } | null>(null);
  const [message,setMessage] = useState('');
  const choose = (id:string) => {
    try {selectEngine(id);setData(prev=>prev && {...prev,active:id});setMessage('이 브라우저의 생성 방식을 저장했습니다.');}
    catch {setMessage('생성 방식을 저장할 수 없습니다. 브라우저 저장소를 확인하세요.');}
  };
  useEffect(() => { api.providers().then(setData).catch(() => setData({ providers: [], active: 'prompt-only', guideLoaded: false })); }, []);
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal settings" role="dialog" aria-modal="true"><div className="modal-head"><div><span className="eyebrow">연결 상태</span><h2>설정 및 실행 엔진</h2></div><button className="icon-btn" onClick={onClose} aria-label="닫기">×</button></div><div className="notice">프롬프트 모드에서는 로컬 템플릿으로 초안을 만듭니다. AI 엔진을 선택하면 생성 시 입력한 자료를 해당 엔진으로 전송합니다. API 이용 시 별도 요금이 발생할 수 있습니다.</div>{data ? <div className="provider-list">{data.providers.length>0 ? <label>초안 생성 방식<select value={data.active} onChange={e=>choose(e.target.value)}>{data.providers.map(p=><option key={p.id} value={p.id} disabled={!p.available}>{p.name}{!p.available?' · 연결 필요':''}</option>)}</select></label> : <div className="notice error">연결 상태를 확인할 수 없습니다. 로컬 서버 실행 상태를 확인하세요.</div>}{message&&<p role="status">{message}</p>}{data.providers.map((p) => <article className={`provider ${data.active === p.id ? 'active' : ''}`} key={p.id}><div><strong>{p.name}</strong>{data.active === p.id && <span className="badge">현재 엔진</span>}</div><span className={p.available ? 'available' : 'unavailable'}>{p.available ? '사용 가능' : '사용 불가'}</span><p>{p.reason}</p>{p.localOnly && <small>localhost/127.0.0.1 단일 사용자 전용</small>}</article>)}</div> : <div className="empty">서버 연결 상태를 확인하는 중입니다.</div>}<div className="notice warning">추가 가이드 파일: {data?.guideLoaded ? '로드됨' : '미제공'} · 뉴스 검색은 실제 RSS 연결이 있을 때만 사용합니다.</div><div className="modal-actions"><button onClick={onClose}>확인</button></div></section></div>;
}
