import { spawn } from 'node:child_process';
import type { AITask, AIProviderId, ProviderStatus } from '../../src/types.js';

export interface AIProvider { id: AIProviderId; status(): Promise<ProviderStatus>; run(task: AITask, prompt: string, signal?: AbortSignal): Promise<unknown>; }

function parseJson(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(cleaned); } catch {
    const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('AI 응답을 JSON으로 해석할 수 없습니다. 프롬프트 복사 모드로 결과를 직접 붙여넣어 주세요.');
  }
}

export class PromptOnlyProvider implements AIProvider {
  id = 'prompt-only' as const;
  async status(): Promise<ProviderStatus> { return { id: this.id, name: '프롬프트 복사', available: true, reason: '외부 AI에서 실행한 결과를 붙여넣습니다.', needsApiKey: false, localOnly: false }; }
  async run() { throw new Error('프롬프트 전용 모드는 서버에서 AI를 호출하지 않습니다.'); }
}

function checkCommand(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => { const child = spawn(command, args, { shell: false, windowsHide: true, stdio: 'ignore' }); child.once('error', () => resolve(false)); child.once('exit', (code) => resolve(code === 0)); setTimeout(() => { child.kill(); resolve(false); }, 4000); });
}

export class CodexCliProvider implements AIProvider {
  id = 'codex-cli' as const;
  async status(): Promise<ProviderStatus> {
    const installed = await checkCommand('codex', ['--version']);
    return { id: this.id, name: '로컬 Codex CLI', available: installed, reason: installed ? 'CLI 설치됨. 실제 로그인·사용 한도는 실행 시 확인합니다.' : 'codex CLI를 찾지 못했습니다.', needsApiKey: false, localOnly: true };
  }
  async run(_task: AITask, prompt: string, signal?: AbortSignal): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const child = spawn('codex', ['exec', '--sandbox', 'read-only', '-'], { shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], env: process.env });
      let stdout = ''; let stderr = ''; let size = 0; let settled = false;
      const finish = (error?: Error, value?: unknown) => { if (settled) return; settled = true; clearTimeout(timer); error ? reject(error) : resolve(value); };
      const timer = setTimeout(() => { child.kill(); finish(new Error('Codex CLI 호출이 90초를 초과해 중단되었습니다.')); }, 90000);
      signal?.addEventListener('abort', () => { child.kill(); finish(new Error('사용자가 생성을 취소했습니다.')); }, { once: true });
      child.stdout.on('data', (chunk) => { size += chunk.length; if (size > 2_000_000) { child.kill(); finish(new Error('AI 출력이 허용 크기를 초과했습니다.')); } else stdout += chunk.toString(); });
      child.stderr.on('data', (chunk) => { if (stderr.length < 4000) stderr += chunk.toString(); });
      child.on('error', () => finish(new Error('Codex CLI 실행에 실패했습니다. 설치 및 codex login 상태를 확인하세요.')));
      child.on('exit', (code) => { if (code !== 0) finish(new Error(`Codex CLI가 완료되지 않았습니다. 로그인·플랜·한도를 확인하세요. ${stderr.slice(-500)}`)); else { try { finish(undefined, parseJson(stdout)); } catch (e) { finish(e as Error); } } });
      child.stdin.end(prompt);
    });
  }
}

export class OpenAIProvider implements AIProvider {
  id = 'openai' as const;
  async status(): Promise<ProviderStatus> { const ok = !!process.env.OPENAI_API_KEY; return { id: this.id, name: 'OpenAI API', available: ok, reason: ok ? '서버 환경변수에 키가 설정되었습니다.' : 'OPENAI_API_KEY가 필요합니다.', needsApiKey: true, localOnly: false }; }
  async run(_task: AITask, prompt: string, signal?: AbortSignal) {
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', signal, headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5-mini', input: prompt }) });
    if (!response.ok) throw new Error(`OpenAI API 오류 (${response.status}). 인증·잔액·사용 한도를 확인하세요.`);
    const body: any = await response.json(); const text = body.output_text || body.output?.flatMap((o: any) => o.content || []).find((c: any) => c.text)?.text;
    return parseJson(text || '');
  }
}

export class AnthropicProvider implements AIProvider {
  id = 'anthropic' as const;
  async status(): Promise<ProviderStatus> { const ok = !!process.env.ANTHROPIC_API_KEY; return { id: this.id, name: 'Anthropic API', available: ok, reason: ok ? '서버 환경변수에 키가 설정되었습니다.' : 'ANTHROPIC_API_KEY가 필요합니다.', needsApiKey: true, localOnly: false }; }
  async run(_task: AITask, prompt: string, signal?: AbortSignal) {
    const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal, headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5', max_tokens: 8000, messages: [{ role: 'user', content: prompt }] }) });
    if (!response.ok) throw new Error(`Anthropic API 오류 (${response.status}). 인증·잔액·사용 한도를 확인하세요.`);
    const body: any = await response.json(); return parseJson(body.content?.find((c: any) => c.type === 'text')?.text || '');
  }
}

export const providers: Record<AIProviderId, AIProvider> = { 'prompt-only': new PromptOnlyProvider(), 'codex-cli': new CodexCliProvider(), openai: new OpenAIProvider(), anthropic: new AnthropicProvider() };
