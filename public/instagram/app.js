const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const els = {
  form: $('#generatorForm'), topic: $('#topic'), topicCount: $('#topicCount'), tone: $('#tone'),
  count: $('#cardCount'), audience: $('#audience'), stage: $('#cardStage'), title: $('#cardTitle'),
  body: $('#cardBody'), number: $('#cardNumber'), label: $('#cardLabel'), timeline: $('#timeline'),
  total: $('#cardTotal'), projectTitle: $('#projectTitle'), toast: $('#toast')
};

const themes = {
  sunny: { bg: '#ffd84d', fg: '#181714', accent: '#ff6838' },
  mint: { bg: '#8be2c9', fg: '#13231f', accent: '#0e806e' },
  berry: { bg: '#ed7597', fg: '#2a1020', accent: '#ffe2a8' },
  mono: { bg: '#252528', fg: '#f7f4ea', accent: '#c7ff4a' }
};

const toneText = {
  friendly: { lead: '어렵게 생각할 필요 없어요.', close: '오늘부터 딱 하나만 시작해 보세요.' },
  expert: { lead: '핵심은 구조를 이해하는 것입니다.', close: '작은 실행을 반복하면 결과는 달라집니다.' },
  witty: { lead: '잠깐, 이건 알고 넘겨야죠!', close: '저장해 두면 미래의 내가 박수 칩니다.' },
  calm: { lead: '서두르지 않아도 괜찮아요.', close: '당신의 속도로 천천히 시작해 보세요.' }
};

let state = {
  active: 0,
  theme: localStorage.getItem('cardory-theme') || 'sunny',
  topic: '',
  cards: [
    { label: 'COVER STORY', title: '주제를 입력하면\n이곳에 표지가 만들어져요', body: '왼쪽에서 주제와 말투를 선택하고 초안 만들기를 눌러보세요.' },
    { label: 'WHY IT MATTERS', title: '사람들이 멈춰 보는\n첫 문장을 만들어요', body: '핵심 메시지를 짧고 선명한 흐름으로 정리합니다.' },
    { label: 'POINT 01', title: '한 카드에는\n한 가지 이야기만', body: '읽는 사람이 바로 이해하도록 정보의 밀도를 조절해요.' },
    { label: 'POINT 02', title: '저장하고 싶은\n내용으로 채워요', body: '실용적인 포인트와 자연스러운 예시를 함께 제안합니다.' },
    { label: 'ACTION', title: '작게 시작할 수 있는\n행동을 건네요', body: '읽고 끝나지 않도록 오늘 해볼 일을 구체적으로 적어요.' },
    { label: 'SAVE & SHARE', title: '도움이 됐다면\n저장해 두세요', body: '다음에 다시 볼 수 있도록 저장하고, 필요한 친구에게 공유해 보세요.' }
  ]
};

function cleanTopic(value) {
  return value.trim().replace(/[.!?。]+$/g, '');
}

function splitTitle(text, max = 14) {
  if (text.length <= max) return text;
  const words = text.split(/\s+/);
  if (words.length === 1) return `${text.slice(0, max)}\n${text.slice(max)}`;
  let first = '';
  while (words.length && (first + ' ' + words[0]).trim().length <= max) first = `${first} ${words.shift()}`.trim();
  return `${first}\n${words.join(' ')}`;
}

function makeCards(topic, count, tone, audience) {
  const voice = toneText[tone];
  const who = audience ? `${audience}라면 더 주목해 주세요. ` : '';
  const middle = [
    { label: 'WHY IT MATTERS', title: `${topic},\n왜 지금 중요할까요?`, body: `${who}${voice.lead} 작은 차이가 쌓이면 일상과 선택의 방향까지 바뀔 수 있어요.` },
    { label: 'POINT 01', title: '첫 번째,\n핵심부터 이해하기', body: `${topic}의 출발점은 거창한 방법보다 ‘왜 하는지’를 분명히 아는 데 있어요.` },
    { label: 'POINT 02', title: '두 번째,\n작게 나누어 시작하기', body: '부담 없이 반복할 수 있는 최소 단위로 나누면 꾸준함은 훨씬 쉬워집니다.' },
    { label: 'POINT 03', title: '세 번째,\n나만의 기준 만들기', body: '남의 정답을 그대로 따르기보다 내 상황에 맞는 기준을 하나씩 기록해 보세요.' },
    { label: 'CHECK LIST', title: '이것만은\n꼭 기억하세요', body: `① 목적을 한 문장으로 적기  ② 작게 실행하기  ③ 결과를 보고 조정하기` },
    { label: 'TODAY’S ACTION', title: '오늘 바로\n해볼 한 가지', body: `${topic}와 관련해 10분 안에 끝낼 수 있는 행동 하나를 정하고 지금 시작해 보세요.` }
  ];
  const cover = { label: 'COVER STORY', title: splitTitle(topic, 13), body: `${audience ? `${audience}를 위한 ` : ''}핵심 포인트를 ${count - 2}개 카드로 정리했어요.` };
  const end = { label: 'SAVE & SHARE', title: '도움이 됐다면\n저장해 두세요', body: `${voice.close} 필요한 친구에게 공유하면 더 오래 기억할 수 있어요.` };
  return [cover, ...middle.slice(0, Math.max(0, count - 2)), end];
}

function saveState() {
  localStorage.setItem('cardory-draft', JSON.stringify({ ...state, active: 0 }));
}

function render() {
  const card = state.cards[state.active];
  els.stage.className = `card-stage theme-${state.theme}`;
  els.title.innerText = card.title;
  els.body.innerText = card.body;
  els.label.textContent = card.label;
  els.number.textContent = `${String(state.active + 1).padStart(2, '0')} / ${String(state.cards.length).padStart(2, '0')}`;
  els.total.textContent = `${state.cards.length}장`;
  els.projectTitle.textContent = state.topic ? `${state.topic} · 카드뉴스` : '나의 카드뉴스';
  $$('.swatch').forEach((el) => el.classList.toggle('is-active', el.dataset.theme === state.theme));
  renderTimeline();
}

function renderTimeline() {
  els.timeline.innerHTML = '';
  state.cards.forEach((card, index) => {
    const btn = document.createElement('button');
    btn.className = `thumb${index === state.active ? ' is-active' : ''}`;
    btn.dataset.theme = state.theme;
    btn.type = 'button';
    btn.setAttribute('aria-label', `${index + 1}번 카드: ${card.title.replace(/\n/g, ' ')}`);
    const frame = document.createElement('div');
    frame.className = 'thumb-card';
    const title = document.createElement('h4');
    title.innerText = card.title;
    const num = document.createElement('span');
    num.textContent = String(index + 1).padStart(2, '0');
    frame.appendChild(title);
    btn.append(frame, num);
    btn.addEventListener('click', () => { syncEdits(); state.active = index; render(); });
    els.timeline.appendChild(btn);
  });
}

function syncEdits() {
  const card = state.cards[state.active];
  if (!card) return;
  card.title = els.title.innerText.trim();
  card.body = els.body.innerText.trim();
  saveState();
}

function moveCard(delta) {
  syncEdits();
  state.active = (state.active + delta + state.cards.length) % state.cards.length;
  render();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 1900);
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  String(text).split('\n').forEach((paragraph) => {
    const tokens = paragraph.includes(' ') ? paragraph.split(' ') : [...paragraph];
    let line = '';
    tokens.forEach((token) => {
      const spacer = paragraph.includes(' ') && line ? ' ' : '';
      const test = line + spacer + token;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = token; }
      else line = test;
    });
    if (line) lines.push(line);
  });
  return lines;
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}

function drawCard(index) {
  syncEdits();
  const card = state.cards[index];
  const colors = themes[state.theme];
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = .9; ctx.strokeStyle = colors.accent; ctx.lineWidth = 72;
  ctx.beginPath(); ctx.arc(1050, 350, 195, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = colors.accent; ctx.save(); ctx.translate(65, 1030); ctx.rotate(-.105); ctx.fillRect(-90, -22, 270, 48); ctx.restore();
  ctx.globalAlpha = .18; ctx.strokeStyle = colors.fg; ctx.lineWidth = 2; ctx.strokeRect(30, 30, 1020, 1290); ctx.globalAlpha = 1;

  ctx.fillStyle = colors.fg; roundedRect(ctx, 88, 85, 270, 54, 27);
  ctx.fillStyle = colors.bg; ctx.font = '800 22px sans-serif'; ctx.letterSpacing = '2px'; ctx.fillText(card.label, 116, 120);
  ctx.fillStyle = colors.fg; ctx.font = '800 22px sans-serif'; ctx.fillText(`${String(index + 1).padStart(2,'0')} / ${String(state.cards.length).padStart(2,'0')}`, 865, 120);

  ctx.fillStyle = colors.fg; ctx.font = '900 82px "Arial", "Malgun Gothic", sans-serif';
  const titleLines = wrapText(ctx, card.title, 850).slice(0, 5);
  const titleY = 420 - Math.max(0, titleLines.length - 2) * 37;
  titleLines.forEach((line, i) => ctx.fillText(line, 88, titleY + i * 100));

  ctx.globalAlpha = .78; ctx.font = '600 35px "Arial", "Malgun Gothic", sans-serif';
  const bodyLines = wrapText(ctx, card.body, 820).slice(0, 5);
  const bodyY = titleY + titleLines.length * 100 + 44;
  bodyLines.forEach((line, i) => ctx.fillText(line, 88, bodyY + i * 57));
  ctx.globalAlpha = 1;

  ctx.font = '800 21px sans-serif'; ctx.fillText('@cardory.studio', 88, 1260);
  ctx.fillStyle = colors.accent; ctx.beginPath(); ctx.arc(946, 1248, 35, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = colors.fg; ctx.font = '800 32px sans-serif'; ctx.fillText('↗', 929, 1260);
  return canvas;
}

function downloadCard(index, quiet = false) {
  const canvas = drawCard(index);
  const link = document.createElement('a');
  const slug = (state.topic || 'cardnews').replace(/[^a-zA-Z0-9가-힣]+/g, '-').slice(0, 28);
  link.download = `${slug}-${String(index + 1).padStart(2, '0')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  if (!quiet) showToast(`${index + 1}번 카드를 저장했어요`);
}

async function downloadAll() {
  syncEdits();
  showToast(`${state.cards.length}장 저장을 시작해요`);
  for (let i = 0; i < state.cards.length; i += 1) {
    downloadCard(i, true);
    await new Promise((resolve) => setTimeout(resolve, 280));
  }
}

els.topic.addEventListener('input', () => { els.topicCount.textContent = `${els.topic.value.length}/80`; });
els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const topic = cleanTopic(els.topic.value);
  if (!topic) { els.topic.focus(); return; }
  state.topic = topic;
  state.cards = makeCards(topic, Number(els.count.value), els.tone.value, els.audience.value.trim());
  state.active = 0;
  saveState(); render(); showToast('카드뉴스 초안을 만들었어요');
  if (window.innerWidth < 700) $('.studio').scrollIntoView({ behavior: 'smooth' });
});

$('#prevCard').addEventListener('click', () => moveCard(-1));
$('#nextCard').addEventListener('click', () => moveCard(1));
$('#downloadCurrent').addEventListener('click', () => downloadCard(state.active));
$('#downloadAllTop').addEventListener('click', downloadAll);
els.title.addEventListener('input', syncEdits);
els.body.addEventListener('input', syncEdits);
$$('.swatch').forEach((button) => button.addEventListener('click', () => {
  state.theme = button.dataset.theme; localStorage.setItem('cardory-theme', state.theme); saveState(); render();
}));
document.addEventListener('keydown', (event) => {
  if (document.activeElement?.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
  if (event.key === 'ArrowLeft') moveCard(-1);
  if (event.key === 'ArrowRight') moveCard(1);
});

try {
  const saved = JSON.parse(localStorage.getItem('cardory-draft'));
  if (saved?.cards?.length) {
    state = { ...state, ...saved, active: 0, theme: localStorage.getItem('cardory-theme') || saved.theme || 'sunny' };
    els.topic.value = state.topic || '';
    els.topicCount.textContent = `${els.topic.value.length}/80`;
  }
} catch (_) { /* 새 초안으로 시작 */ }
render();
