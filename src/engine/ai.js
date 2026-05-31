/* ================================================================
 *  AI (OpenAI) 클라이언트 + 콘텐츠 프롬프트
 *  - 사용자 API 키는 localStorage에 저장
 *  - 브라우저에서 직접 OpenAI Chat Completions 호출
 *  - 키가 없으면 폴백 (템플릿 사용)
 * ================================================================ */

const KEY_STORAGE = 'wfl_openai_key';
const MODEL_STORAGE = 'wfl_openai_model';
const DEFAULT_MODEL = 'gpt-4o-mini';

export function setApiKey(key) { localStorage.setItem(KEY_STORAGE, key); }
export function getApiKey() { return localStorage.getItem(KEY_STORAGE) || ''; }
export function hasApiKey() { return !!getApiKey(); }
export function clearApiKey() { localStorage.removeItem(KEY_STORAGE); }
export function setModel(m) { localStorage.setItem(MODEL_STORAGE, m); }
export function getModel() { return localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL; }

/* ---------- 저수준 호출 (OpenAI Chat Completions) ---------- */
// 함수명은 callClaude로 유지 (기존 호출부 호환). 내부는 OpenAI.
export async function callClaude({ system, prompt, maxTokens = 800, temperature = 0.95 }) {
  return callAI({ system, prompt, maxTokens, temperature });
}

export async function callAI({ system, prompt, maxTokens = 800, temperature = 0.95 }) {
  if (!hasApiKey()) return null;
  const model = getModel();
  // GPT-5 계열은 max_completion_tokens 사용. 기타 모델은 max_tokens.
  const useMaxCompletionTokens = /^(gpt-5|o\d|gpt-4\.\d)/i.test(model);
  const body = {
    model,
    temperature,
    messages: [
      { role: 'system', content: system || 'You are a helpful assistant.' },
      { role: 'user', content: prompt }
    ]
  };
  if (useMaxCompletionTokens) body.max_completion_tokens = maxTokens;
  else body.max_tokens = maxTokens;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`
      },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      console.warn('OpenAI API error:', resp.status, await resp.text().catch(() => ''));
      return null;
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.warn('OpenAI call failed:', e);
    return null;
  }
}

/* ---------- JSON 파서 (모델 응답에서 JSON 추출) ---------- */
function extractJson(text) {
  if (!text) return null;
  try {
    // 가장 큰 [...]나 {...} 블록 추출
    const arrMatch = text.match(/\[[\s\S]*\]/);
    const objMatch = text.match(/\{[\s\S]*\}/);
    const target = arrMatch ? arrMatch[0] : (objMatch ? objMatch[0] : text);
    return JSON.parse(target);
  } catch (e) {
    return null;
  }
}

/* ================================================================
 *  SNS (X / Twitter 스타일) 트윗 / 댓글 생성
 * ================================================================ */

/* ---------- 시즌별 / 경기별 기자 트윗 생성 ---------- */
export async function generateJournalistTweets(context) {
  /*  context = { player, recentMatch?, transferRumor?, season, situation }
   *  반환: [{ handle, name, text, timestamp }]
   */
  const system = `당신은 글로벌 축구 기자 시뮬레이터입니다.
주어진 선수와 상황에 대해 3~5명의 서로 다른 스타일의 축구 기자들이 X(트위터)에 올릴법한 짧은 트윗(150자 이내)을 작성하세요.
각 기자는 자신의 색깔(이적 전문, 전술 분석, 가십 등)을 살려야 합니다.
한국어로 작성하되 트윗 특유의 자연스러운 어조를 사용하세요.

반드시 다음 JSON 배열 형식으로만 응답하세요:
[
  { "handle": "@FabrizioRomano", "name": "Fabrizio Romano", "text": "..." },
  ...
]`;
  const prompt = `선수 정보:
- 이름: ${context.player.name} (${context.player.nationality}, ${context.player.position})
- 나이: ${context.player.age}세
- 소속: ${context.player.clubName} (${context.player.leagueName})
- OVR: ${context.player.ovr}
- 시즌 평균 평점: ${context.player.avgRating}
- 시즌 골: ${context.player.goals}, 어시스트: ${context.player.assists}

상황: ${context.situation}
${context.recentMatch ? `최근 경기: vs ${context.recentMatch.opp} ${context.recentMatch.myGoals}-${context.recentMatch.oppGoals} (평점 ${context.recentMatch.rating})` : ''}
${context.transferRumor ? `이적설: ${context.transferRumor}` : ''}

위 상황에 대한 기자 트윗 3~5개를 생성하세요.`;

  const text = await callClaude({ system, prompt, maxTokens: 1000 });
  const parsed = extractJson(text);
  if (Array.isArray(parsed)) return parsed;
  return null;
}

/* ---------- 사용자 SNS 게시물에 대한 팬 댓글 생성 ---------- */
export async function generateFanComments(post, context) {
  const system = `당신은 축구 선수 ${context.player.name}의 SNS 팔로워들입니다.
선수가 방금 올린 X(트위터) 게시물에 다양한 팬들이 다는 댓글을 작성하세요.
선수의 최근 활약(${context.player.avgRating}점, ${context.player.goals}골, ${context.player.assists}어시)과 현재 상황(${context.situation})에 따라 댓글 분위기가 달라야 합니다.
좋은 활약 → 호의적, 부진 → 비판/실망, 논란성 게시물 → 격렬한 토론.

8~12개의 다양한 댓글을 한국어와 영어를 섞어 작성하세요.
짧고 자연스러운 SNS 톤(욕설/은어 약하게 가능)으로.

반드시 다음 JSON 배열 형식:
[
  { "handle": "@xxx", "text": "...", "likes": 12 },
  ...
]`;
  const prompt = `선수 정보:
- ${context.player.name} (${context.player.position}, ${context.player.clubName})
- 시즌 평점 ${context.player.avgRating}, ${context.player.goals}골 ${context.player.assists}어시
- 현 상황: ${context.situation}

선수 게시물:
"${post}"

이 게시물에 대한 팬 댓글 8~12개를 생성하세요. 게시물 내용과 선수 활약에 맞게 반응이 달라야 합니다.`;

  const text = await callClaude({ system, prompt, maxTokens: 1200 });
  const parsed = extractJson(text);
  if (Array.isArray(parsed)) return parsed;
  return null;
}

/* ---------- 시즌 종료 뉴스 기사 ---------- */
export async function generateNewsArticle(context) {
  const system = `당신은 축구 전문 매체의 헤드라인 작가입니다.
선수의 시즌 성과를 다룬 뉴스 기사 헤드라인과 짧은 본문(2~3 문장)을 작성하세요.
한국어로 자연스럽게.

반드시 JSON으로:
{ "headline": "...", "body": "...", "outlet": "[매체명]" }`;
  const prompt = `선수: ${context.player.name} (${context.player.clubName})
시즌 성적: ${context.matches}경기 ${context.goals}골 ${context.assists}어시 평균평점 ${context.avgRating}
리그 순위: ${context.rank}위${context.trophies && context.trophies.length > 0 ? ', 트로피: ' + context.trophies.join(', ') : ''}

이 시즌을 다룬 기사 헤드라인을 작성하세요.`;
  const text = await callClaude({ system, prompt, maxTokens: 400 });
  return extractJson(text);
}

/* ================================================================
 *  연애 대화 생성
 * ================================================================ */

export async function generateDatingDialogue(context) {
  const { partner, player, relationshipLevel, userMessage, history } = context;
  const system = `당신은 ${partner.name}이라는 캐릭터를 연기합니다.
프로필: ${partner.occupation}, ${partner.age}세, ${partner.personality}.

축구 선수 ${player.name}(${player.clubName} 소속, ${player.position})와 데이트하는 상황입니다.
관계 친밀도: ${relationshipLevel}/100 (낮으면 어색하고 정중, 높으면 친밀하고 솔직).

자연스러운 한국어로 1~3 문장 답장하세요. 캐릭터의 직업/성격이 드러나야 합니다.
대화체로, 이모지를 적절히 사용해도 됩니다.`;

  const historyText = (history || []).slice(-6).map(h =>
    `${h.from === 'me' ? player.name : partner.name}: ${h.text}`
  ).join('\n');

  const prompt = `이전 대화:
${historyText || '(첫 대화)'}

${player.name}: ${userMessage}

${partner.name}의 답장을 작성하세요.`;

  const text = await callClaude({ system, prompt, maxTokens: 400, temperature: 1.0 });
  return text || null;
}

/* ---------- 데이트 이벤트 (자동 대화 시작) ---------- */
export async function generateDatingOpener(partner, player) {
  const system = `당신은 ${partner.name}(${partner.occupation}, ${partner.personality})입니다.
처음 만난 축구 선수 ${player.name}에게 인스타그램 DM으로 보내는 첫 메시지를 작성하세요.
1~2 문장, 자연스러운 한국어, 캐릭터의 직업/성격이 드러나야 합니다.`;
  const prompt = `${partner.name}가 ${player.name}(${player.clubName} 소속)에게 보내는 첫 인사 DM을 작성하세요.`;
  const text = await callClaude({ system, prompt, maxTokens: 200 });
  return text;
}

/* ================================================================
 *  폴백 — AI 키가 없을 때 템플릿 기반 콘텐츠 생성
 * ================================================================ */

import { JOURNALISTS, FAN_HANDLES } from '../data/extras.js';

const POSITIVE_FAN_TEMPLATES = [
  '와 {name} 미쳤다', '{name} 진짜 폼이 ㄷㄷ', '이게 바로 월드클래스지', '발롱도르 가자!!!',
  '안방에서 {goals}골 ㄷㄷ', '오늘 평점 {rating}점 ㄷㄷㄷ', '이 폼이면 다음 시즌 빅클럽 이적각',
  'GOAT 인정한다', 'My favorite player!!! 💯', '{club} 팬으로서 너무 자랑스럽다',
  '이런 선수가 우리팀이라니 행복', '오늘 movement 진짜 미쳤음', '🐐🐐🐐'
];
const NEGATIVE_FAN_TEMPLATES = [
  '{name} 폼 떨어진 듯', '왜 저렇게 못 뛰지', '이적 보내야 함', '평점 보고 한숨 나옴',
  '연봉값 좀 해라', '예전엔 안 그랬는데...', '경기력 너무 답답하다', '벤치 가자',
  '이제 한물 갔나', '신인 좀 키워라', '😩😩😩', 'Disappointing performance again'
];
const NEUTRAL_FAN_TEMPLATES = [
  '{name} 다음 경기 기대된다', '오늘은 그래도 평타치는 했음', '꾸준한 활약 응원합니다',
  '다음엔 더 잘하길', '경기는 이겼으니 됐다', 'Up and down 시즌이네',
  '컨디션 회복 화이팅', '팀 케미가 좋아 보임', '이번 시즌 끝까지 가보자!'
];

function fillTemplate(t, ctx) {
  return t.replace('{name}', ctx.player.name)
          .replace('{club}', ctx.player.clubName)
          .replace('{goals}', ctx.recentMatch?.goals || 0)
          .replace('{rating}', ctx.recentMatch?.rating || ctx.player.avgRating || 6.5);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function fallbackFanComments(post, context) {
  const avgR = parseFloat(context.player.avgRating) || 6.5;
  let pool;
  if (avgR >= 7.5) pool = POSITIVE_FAN_TEMPLATES;
  else if (avgR < 6.0) pool = NEGATIVE_FAN_TEMPLATES;
  else pool = NEUTRAL_FAN_TEMPLATES;
  const used = new Set();
  const comments = [];
  for (let i = 0; i < 8; i++) {
    let t;
    let attempts = 0;
    do { t = pick(pool); attempts++; } while (used.has(t) && attempts < 10);
    used.add(t);
    comments.push({
      handle: pick(FAN_HANDLES),
      text: fillTemplate(t, context),
      likes: Math.floor(Math.random() * 200)
    });
  }
  return comments;
}

const JOURNALIST_TEMPLATES = {
  transfer: [
    'BREAKING: {name}({club}) — 빅클럽들이 영입 의향을 타진하고 있다는 소식. 본인은 현 시점에서 클럽 잔류를 선호한다고. {handle} 단독.',
    'Understand that {name} ({club})의 에이전트가 여러 클럽과 미팅 중. 다음 시즌 이적 가능성 있음.',
    '{name}의 이적료 평가가 최근 활약으로 €{fee}M 수준까지 올라간 상황. 향후 몇 주가 결정적.'
  ],
  analysis: [
    '{name}의 최근 활약은 {pos} 자리에서 보여주는 압박 강도와 라인 사이 침투가 핵심. 평점 {rating}이 이를 증명.',
    '오늘 {name}의 xG는 평균 이상. 다만 결정력 변동성이 있어 더 지켜봐야 함. (분석)',
    '{club}의 빌드업에서 {name}의 역할이 점점 커지는 중. {age}세 선수치고 결정 속도가 인상적.'
  ],
  gossip: [
    '👀 {name}, 한 럭셔리 호텔에서 모델과 함께 목격됐다는 소식. 클럽 측은 노코멘트.',
    '🔥 클럽 내부에서 {name}의 연봉 재협상 두고 긴장감 감지된다는 후문.',
    '😏 {name} SNS 활동이 급증한 이유는?'
  ],
  kleague: [
    '[K리그] {name}의 활약이 한국 대표팀 차출 기준을 충분히 넘어선 상황. 다음 소집 명단 주목.',
    '{name}, 한국 축구의 새로운 희망. {club}에서 보여주는 모습 인상적.'
  ]
};

export function fallbackJournalistTweets(context) {
  const tweets = [];
  const journos = JOURNALISTS.slice().sort(() => Math.random() - 0.5).slice(0, 4);
  journos.forEach(j => {
    const pool = JOURNALIST_TEMPLATES[j.bias] || JOURNALIST_TEMPLATES.analysis;
    let t = pool[Math.floor(Math.random() * pool.length)];
    t = t.replace('{name}', context.player.name)
         .replace('{club}', context.player.clubName)
         .replace('{handle}', j.handle)
         .replace('{rating}', context.player.avgRating || 6.5)
         .replace('{pos}', context.player.position)
         .replace('{age}', context.player.age)
         .replace('{fee}', Math.round((context.player.ovr || 70) * 1.2));
    tweets.push({ handle: j.handle, name: j.name, text: t });
  });
  return tweets;
}

const DATING_REPLY_TEMPLATES = {
  civilian: [
    '오늘 하루 어땠어요? 저는 일하느라 정신없었어요 😊',
    '경기 잘 보고 있어요! 다음 데이트는 언제쯤?',
    '카페에서 새 디저트 나왔는데 같이 가실래요?'
  ],
  model: [
    '런웨이 끝나고 메시지 봤어요! 너무 보고 싶었어요 ✨',
    '파리 패션위크 가는데 같이 갈래요?',
    '저녁 시간 비워두면 같이 디너 어때요? 💋'
  ],
  influencer: [
    '오늘 콘텐츠 촬영 끝났어요! 우리 사진 같이 찍어도 돼요? 📸',
    '댓글창에서 우리 얘기 엄청 화제예요 ㅋㅋ 어떻게 대처해야 할지...',
    'DM 답장 늦어서 미안해요 😭 너무 바빴어요'
  ],
  athlete: [
    '훈련 끝났어요! 우리 둘 다 시즌 중이라 시간 맞추기 힘드네요.',
    '시합 잘 봤어요. 그 골 진짜 멋졌어요 🔥',
    '같이 운동할래요? 보강 운동 좀 하려고 했는데.'
  ],
  celebrity: [
    '촬영장이라 답장이 늦었어요. 오늘 시사회 끝나면 통화해요 📞',
    '오늘 시상식 다녀왔어요. 같이 갔으면 더 좋았을 텐데.',
    '인터뷰에서 당신 얘기 나왔어요 ㅋㅋ 어떻게 대답해야 할지 몰랐어요'
  ],
  musician: [
    '오늘 작업하다가 당신 떠올라서 가사 한 줄 썼어요 🎵',
    '공연 다음 주에 있어요. 와줄 수 있나요?',
    '새 EP 작업 중인데 듣고 싶어해요?'
  ],
  heiress: [
    '오늘 자선 갈라 다녀왔어요. 같이 갔으면 좋았을 텐데요.',
    '주말에 별장에 같이 갈래요? 좀 쉬어야 할 것 같아서.',
    '아버지가 당신 경기 좋아하시더라구요. 다음에 식사 함께 어떨까요?'
  ]
};

export function fallbackDatingReply(partner) {
  const pool = DATING_REPLY_TEMPLATES[partner.type] || DATING_REPLY_TEMPLATES.civilian;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function fallbackDatingOpener(partner) {
  const openers = {
    civilian: '안녕하세요! 친구가 당신 경기 같이 봤다고 너무 신기해해서 ㅎㅎ DM 보내봐요',
    model: 'Hi! 패션쇼 끝나고 봐서요. 다음에 차 한잔 어때요? ✨',
    influencer: '안녕! 인스타에서 보고 팔로우했어요. 콜라보 한번 어때요? 😊',
    athlete: '안녕하세요. 같은 선수로서 응원하고 있어요. 한번 만날래요?',
    celebrity: '안녕하세요. 시상식에서 짧게 인사드렸던...! 기억나시나요? ☕',
    musician: '안녕하세요. 새 앨범 작업 중인데 영감이 필요해서요. 만날 수 있을까요?',
    heiress: '안녕하세요. 갤러리 오프닝에서 뵙고 인사드리고 싶었어요. 시간 되실 때 식사 어때요?'
  };
  return openers[partner.type] || openers.civilian;
}

/* ============================================================
 *  매치 후 AI 헤드라인 / 감독 평가 / 팬 반응 (선택적)
 * ============================================================ */
export async function generateMatchNarrative(context) {
  const system = `당신은 축구 전문 매체의 한국어 콘텐츠 작가입니다.
방금 끝난 경기를 다음 톤으로 압축적으로 작성하세요:
1) 언론 헤드라인 (1문장 — 자극적이거나 분석적)
2) 감독 한마디 (1문장 — 직설적인 큰따옴표 코멘트)
3) 팬 트윗 3개 (각 1문장 — SNS 톤, 이모지 가능)

반드시 JSON으로:
{
  "headline": "...",
  "coachQuote": "...",
  "fanTweets": ["...", "...", "..."]
}`;
  const prompt = `경기 정보:
- 결과: ${context.myGoals}-${context.oppGoals} (${context.result === 'W' ? '승' : (context.result === 'L' ? '패' : '무')})
- 상대: ${context.oppName}
- 대회: ${context.competition}${context.round ? ' ' + context.round : ''}
- 내 활약: 평점 ${context.rating} · ${context.goals}골 ${context.assists}어시
- 결정적 장면: ${(context.keyMoments || []).map(km => km.narrative).join(' / ') || '없음'}

위 경기에 대한 헤드라인/감독한마디/팬트윗 3개를 작성하세요.`;

  const text = await callClaude({ system, prompt, maxTokens: 600, temperature: 0.95 });
  if (!text) return null;
  try {
    const arrMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(arrMatch ? arrMatch[0] : text);
  } catch (e) { return null; }
}

/* ---------- 시즌 종료 AI 요약 ---------- */
export async function generateSeasonReview(context) {
  const system = `당신은 축구 시즌 결산 칼럼니스트입니다.
선수의 시즌을 짧은 한국어 칼럼 (3~4 문장)으로 작성하세요. 자연스럽고 감정 있게.`;
  const prompt = `선수: ${context.name} (${context.position}, ${context.age}세, ${context.clubName})
시즌 성적: ${context.matches}경기 ${context.goals}골 ${context.assists}어시 평균평점 ${context.avgRating}
리그 순위: ${context.rank}위
트로피: ${(context.trophies || []).map(t => t.name).join(', ') || '없음'}
${context.awards && context.awards.length > 0 ? '개인상: ' + context.awards.map(a => a.name).join(', ') : ''}

이 시즌 결산 칼럼을 작성하세요.`;

  return await callClaude({ system, prompt, maxTokens: 400, temperature: 0.9 });
}
