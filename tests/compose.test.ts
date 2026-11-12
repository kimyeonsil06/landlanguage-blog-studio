import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../src/lib/api';
import { composeDraft } from '../src/lib/compose';
import { createDraft, localOutline } from '../src/lib/draft';

afterEach(()=>vi.restoreAllMocks());
const signal = () => new AbortController().signal;
describe('초안 자동 생성',()=>{
  it('편집한 소제목, 메모, 출처를 순서대로 보존한다',async()=>{
    vi.spyOn(api,'providers').mockResolvedValue({providers:[],active:'prompt-only',guideLoaded:false});
    const input=createDraft();
    input.topic='전세 계약 준비';
    input.outline=localOutline(input).reverse();
    input.outline[0].heading='내가 정한 소제목';
    input.outline[0].notes='현장 기록을 다시 확인합니다.';
    input.sources=[{id:'s',title:'참고 문서',organization:'기관',url:'https://example.org/source',publishedAt:'2026-11-01',excerpt:'',verified:false}];
    input.outline[0].sourceIds=['s'];
    const result=await composeDraft(input,signal());
    expect(result.draft.article).toContain('■ 내가 정한 소제목\n\n현장 기록을 다시 확인합니다.\n\n기관 2026-11-01 https://example.org/source');
    expect(result.draft.evaluation?.items).toHaveLength(9);
    expect(result.draft.title).toContain(input.topic);
    expect(input.article).toBe('');
  });
  it('입력이 비어 있으면 생성을 시작하지 않는다',async()=>{
    await expect(composeDraft(createDraft(),signal())).rejects.toThrow('주제');
  });
  it('연결 오류를 성공으로 표시하지 않는다',async()=>{
    vi.spyOn(api,'providers').mockResolvedValue({providers:[],active:'openai',guideLoaded:false});
    await expect(composeDraft({...createDraft(),topic:'임장'},signal())).rejects.toThrow('연결');
  });
  it('AI 응답을 검증하고 선택된 제목을 본문 생성에 전달한다',async()=>{
    vi.spyOn(api,'providers').mockResolvedValue({providers:[{id:'openai',name:'AI',available:true,reason:'',needsApiKey:true,localOnly:false}],active:'openai',guideLoaded:false});
    const call=vi.spyOn(api,'ai').mockResolvedValueOnce({mode:'automatic',provider:'openai',prompt:'',result:{titles:['확인 순서'],sections:[{type:'body',heading:'현장 메모', notes:'날짜를 확인합니다.'}]}}).mockResolvedValueOnce({mode:'automatic',provider:'openai',prompt:'',result:{article:'검토할 본문'}});
    const result=await composeDraft({...createDraft(),topic:'임장'},signal());
    expect(call.mock.calls[1][1].title).toBe('확인 순서');
    expect(result.draft.article).toBe('검토할 본문');
  });
});
