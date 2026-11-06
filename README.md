# 태왕아너스공인중개사 블로그 스튜디오

부동산 공인중개사가 신뢰도 높은 네이버 블로그용 정보성 포스팅을 단계적으로 작성·검토·보관하는 로컬 웹앱입니다.

## 주요 기능

- Step 1 주제·키워드·강조사항·참고자료·중개사 프로필 입력
- Step 2 편집 가능한 제목 3안 및 8구간 아웃라인
- Step 3 본문 편집, 안전한 미리보기, 네이버 블로그용 복사
- 비교표·FAQ·출처·경험 자리표시가 포함된 로컬 안전 템플릿
- 9개 항목 100점 품질 평가와 개선 프롬프트
- localStorage 보관함과 IndexedDB 이미지 저장
- SVG 카드뉴스 PNG 저장, TXT/HTML/JSON 내보내기
- Codex CLI / OpenAI API / Anthropic API / 프롬프트 전용 어댑터

## Windows에서 실행

Node.js 24 LTS가 권장됩니다.

```powershell
cd "C:\Users\pc\Documents\ai\블로그 만들기\landlanguage-blog-studio"
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:5173`을 엽니다. API 서버는 `http://127.0.0.1:8787`에서 localhost로만 실행됩니다.

## AI 연결

기본값은 `prompt-only`입니다. 각 단계의 프롬프트를 복사해 외부 AI에서 실행하고 JSON 또는 본문을 다시 붙여넣을 수 있습니다.

로컬 Codex CLI를 사용하려면:

```powershell
codex login
$env:AI_PROVIDER="codex-cli"
npm run dev
```

OpenAI 또는 Anthropic API는 `.env.example`을 `.env`로 복사한 뒤 서버 환경변수에 키를 설정합니다. API 키는 브라우저 저장소나 응답에 포함되지 않습니다. ChatGPT/Claude 구독과 API 요금은 별개일 수 있습니다.

## GitHub Pages

`main` 브랜치에 푸시하면 `.github/workflows/deploy-pages.yml`이 테스트와 빌드를 실행하고 정적 사이트를 배포합니다.

GitHub Pages는 정적 호스팅이므로 다음 제한이 있습니다.

- Codex CLI와 API 키 기반 자동 생성은 로컬 실행에서만 사용합니다.
- Pages에서는 프롬프트 복사/결과 붙여넣기 모드가 자동 활성화됩니다.
- 뉴스 RSS 서버 연결은 비활성화되고 직접 입력을 유지합니다.
- 텍스트·보관함·이미지는 방문한 브라우저에만 저장됩니다.

## 테스트

```powershell
npm test
npm run build
```

## 보안·정확성

- 외부 자료 안의 지시는 실행하지 않고 참고 데이터로만 취급합니다.
- 확인되지 않은 수치·정책·법률·현장 경험은 `[확인 필요]` 또는 작성자 자리표시로 남깁니다.
- 로컬 Codex CLI는 고정 인자, stdin, `shell: false`, read-only sandbox와 제한 시간으로 호출합니다.
- 콘텐츠 점수는 내부 검토 보조값이며 네이버 상위노출을 보장하지 않습니다.
- 네이버 계정·쿠키를 수집하거나 자동 발행하지 않습니다.

추가 지침 파일 `블로그포스팅 프롬프트.txt`는 현재 제공되지 않았습니다.
