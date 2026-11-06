import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { ProviderStatus } from '../types';

export function Settings({ onClose }: { onClose(): void }) {
  const [data, setData] = useState<{ providers: ProviderStatus[]; active: string; guideLoaded: boolean } | null>(null);
  useEffect(() => { api.providers().then(setData).catch(() => setData({ providers: [], active: 'prompt-only', guideLoaded: false })); }, []);
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal settings" role="dialog" aria-modal="true"><div className="modal-head"><div><span className="eyebrow">연결 상태</span><h2>설정 및 실행 엔진</h2></div><button className="icon-btn" onClick={onClose} aria-label="닫기">×</button></div><div className="notice">API 키는 서버 환경변수에서만 읽으며 브라우저·localStorage·응답에 노출하지 않습니다. ChatGPT/Claude 구독료와 API 이용료는 별개일 수 있습니다.</div>{data ? <div className="provider-list">{data.providers.map((p) => <article className={`provider ${data.active === p.id ? 'active' : ''}`} key={p.id}><div><strong>{p.name}</strong>{data.active === p.id && <span className="badge">현재 엔진</span>}</div><span className={p.available ? 'available' : 'unavailable'}>{p.available ? '사용 가능' : '사용 불가'}</span><p>{p.reason}</p>{p.localOnly && <small>localhost/127.0.0.1 단일 사용자 전용</small>}</article>)}</div> : <div className="empty">서버 연결 상태를 확인하는 중입니다.</div>}<div className="notice warning">추가 가이드 파일: {data?.guideLoaded ? '로드됨' : '미제공'} · 뉴스 검색은 실제 RSS 연결이 있을 때만 사용합니다.</div><div className="modal-actions"><button onClick={onClose}>확인</button></div></section></div>;
}
