// =====================================================================
// AI Ustoz — OpenRouter AI Service
// Key is read ONLY from: import.meta.env.VITE_OPENROUTER_API_KEY
// =====================================================================

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const SITE_URL = 'https://ai-ustoz.uz';
const SITE_NAME = 'AI Ustoz';
const DEFAULT_CHAT_MODEL = 'openai/gpt-4o-mini';
const IMAGE_MODEL = 'black-forest-labs/flux-schnell'; // Fast, high-quality

function getHeaders() {
  return {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': SITE_URL,
    'X-Title': SITE_NAME,
    'Content-Type': 'application/json',
  };
}

function assertKey() {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API kaliti topilmadi. .env faylida VITE_OPENROUTER_API_KEY ni tekshiring.');
  }
}

// ─────────────────────────────────────────────────────────────────────
// TEXT COMPLETION (non-streaming)
// ─────────────────────────────────────────────────────────────────────
export async function generateAICompletion({
  prompt,
  systemPrompt = "Siz O'zbekiston ta'lim tizimi uchun maxsus tayyorlangan AI Ustoz assistentisiz. Har doim aniq, to'liq va o'zbek tilida javob bering. Markdown formatlashdan foydalaning.",
  temperature = 0.7,
  max_tokens = 3000,
  model = DEFAULT_CHAT_MODEL,
}) {
  assertKey();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      temperature,
      max_tokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API xatolik: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Javob olinmadi.';
}

// ─────────────────────────────────────────────────────────────────────
// STREAMING CHAT
// ─────────────────────────────────────────────────────────────────────
export async function streamAIChat({
  messages,
  systemPrompt = "Siz O'zbekiston ta'lim tizimi uchun maxsus tayyorlangan AI Ustoz assistentisiz. Markdown formatlashdan foydalaning: sarlavhalar, ro'yxatlar, kod bloklari.",
  onChunk,
  signal,
  model = DEFAULT_CHAT_MODEL,
}) {
  assertKey();

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
      .filter(m => m.text && m.text.trim())
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text || m.content || '',
      })),
  ];

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: getHeaders(),
    signal,
    body: JSON.stringify({
      model,
      stream: true,
      messages: formattedMessages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Streaming xatosi (${res.status}): ${errText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (trimmed === 'data: [DONE]') return;
      if (trimmed.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const chunk = json.choices?.[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch {
          // partial chunk — ignore
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────
// IMAGE GENERATION  (black-forest-labs/flux-schnell via OpenRouter + Pollinations Fallback)
// Returns: { imageUrl: string }
// ─────────────────────────────────────────────────────────────────────
export async function generateImage({
  prompt,
  aspectRatio = '1:1', // '1:1' | '16:9' | '9:16'
  style = 'realistic',  // 'realistic' | 'anime' | 'illustration' | '3d'
}) {
  const dimensions = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1024, height: 576 },
    '9:16': { width: 576, height: 1024 },
  };
  const { width, height } = dimensions[aspectRatio] || dimensions['1:1'];

  // Try OpenRouter first if key is available
  if (OPENROUTER_API_KEY) {
    try {
      const styleModifiers = {
        realistic: 'photorealistic, ultra high quality, sharp details, 8k photography',
        anime: 'anime art style, vibrant colors, detailed anime illustration',
        illustration: 'digital illustration, colorful, professional artwork style',
        '3d': '3D render, CGI, Blender style, high detail, studio lighting',
      };

      const styleHint = styleModifiers[style] || styleModifiers.realistic;
      const enhancedPrompt = `${prompt}. ${styleHint}`;

      const res = await fetch('https://openrouter.ai/api/v1/images', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          model: IMAGE_MODEL,
          prompt: enhancedPrompt,
          n: 1,
          aspect_ratio: aspectRatio
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data?.[0]?.url) return { imageUrl: data.data[0].url };
      }
    } catch (err) {
      console.warn("OpenRouter image generation failed, using fallback:", err);
    }
  }

  // Fallback / Default: Pollinations AI (free, reliable, fast, no auth required)
  const styleModifiers = {
    realistic: 'photorealistic portrait photography, ultra realistic 4k, hyper-detailed, sharp focus',
    anime: 'beautiful colorful detailed anime key visual artwork, masterpiece',
    illustration: 'vector digital illustration art, modern clean graphic design',
    '3d': 'high quality 3d cgi render, octane render style, trending on artstation'
  };

  const styleHint = styleModifiers[style] || '';
  const fullPrompt = encodeURIComponent(`${prompt}. ${styleHint}`);
  const imageUrl = `https://image.pollinations.ai/prompt/${fullPrompt}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

  return { imageUrl };
}

// ─────────────────────────────────────────────────────────────────────
// INTENT DETECTION — Detects what the user wants from their message
// ─────────────────────────────────────────────────────────────────────
export function detectIntent(text) {
  const lower = text.toLowerCase();

  const imageKeywords = [
    'rasm', 'surat', 'chiz', 'ko\'rsat', 'vizual', 'generate image',
    'rasm yarat', 'surat yarat', 'tasvirla', 'ko\'rgazma', 'banner',
    'poster', 'infografik', 'illust',
  ];
  if (imageKeywords.some(k => lower.includes(k))) return 'image';

  const lessonKeywords = ['dars rejasi', 'lesson plan', 'darsni rejalashtir', 'dars plan'];
  if (lessonKeywords.some(k => lower.includes(k))) return 'lesson';

  const quizKeywords = ['test yaratib', 'test tuz', 'quiz', 'savollar yaratib', 'savol tuz'];
  if (quizKeywords.some(k => lower.includes(k))) return 'quiz';

  const translateKeywords = ['tarjima qil', 'translate', "o'zbek tiliga", 'ingliz tiliga'];
  if (translateKeywords.some(k => lower.includes(k))) return 'translate';

  return 'chat'; // default — stream as normal chat
}

// ─────────────────────────────────────────────────────────────────────
// SPECIALIST GENERATORS
// ─────────────────────────────────────────────────────────────────────
export async function generateLessonPlan({ subject, grade, topic, duration = '45 daqiqa', goals = '' }) {
  const prompt = `Dars Rejasi Yaratish:
- Fan: ${subject}
- Sinf: ${grade}-sinf
- Mavzu: ${topic}
- Davomiyligi: ${duration}
- Qo'shimcha maqsadlar: ${goals}

Quyidagi to'liq va professional tuzilishda yarating:
## 🎯 Darsning Maqsadi
### Ta'limiy maqsad:
### Tarbiyaviy maqsad:
### Rivojlantiruvchi maqsad:

## 🧰 Kerakli Jihozlar
## ⏱️ Dars Bosqichlari
| Bosqich | Vaqt | Faoliyat | Metodlar |
|---------|------|----------|---------|
| Tashkiliy qism | 3-5 daq | ... | ... |
| Takrorlash | 7-10 daq | ... | ... |
| Yangi mavzu | 15-20 daq | ... | ... |
| Mustahkamlash | 8-10 daq | ... | ... |
| Uyga vazifa | 3-5 daq | ... | ... |

## 💡 Interaktiv Metodlar
## 📝 O'qituvchi uchun Tavsiyalar`;

  return generateAICompletion({ prompt });
}

export async function generateQuiz({ subject, grade, topic, questionCount = 10, difficulty = 'orta' }) {
  const prompt = `Fan: ${subject}, ${grade}-sinf, Mavzu: "${topic}"
${questionCount} ta ${difficulty} darajali ko'p tanlovli (A,B,C,D) test savoli yarating.
Oxirida: **Javoblar Kaliti** jadvalini qo'shing.
Markdown formatida chiroyli qilib bering.`;
  return generateAICompletion({ prompt });
}

export async function generateHomework({ subject, grade, topic, type = 'amaliy' }) {
  const prompt = `${subject} fanidan ${grade}-sinf uchun "${topic}" mavzusida ${type} uy vazifasi yarating.
3 darajada (⭐ Oson, ⭐⭐ O'rta, ⭐⭐⭐ Murakkab) tayyorlab, baholash mezonini ham qo'shing.`;
  return generateAICompletion({ prompt });
}

export async function generatePresentationOutline({ topic, slideCount = 7, audience = "O'quvchilar" }) {
  const prompt = `"${topic}" mavzusida ${audience} uchun ${slideCount} ta slaydli prezentatsiya rejasini yarating.
Har slayd uchun: sarlavha, asosiy fikrlar (bullet-point), vizual tavsiya va speaker notes.`;
  return generateAICompletion({ prompt });
}

export async function generateStudentFeedback({ studentName, grade, performance, strengths, weaknesses }) {
  const prompt = `O'quvchi ${studentName} (${grade}-sinf) uchun professional ota-onaga mo'ljallangan ta'rifnoma yozing.
Ko'rsatkichlar: ${performance}. Kuchli tomonlari: ${strengths}. Rivojlantirish: ${weaknesses}.
Rag'batlantiruvchi va konstruktiv uslubda yozing.`;
  return generateAICompletion({ prompt });
}

export async function generateRubric({ taskTitle, criteriaList }) {
  const prompt = `"${taskTitle}" topshirig'i uchun baholash rubrikasini yarating.
Mezonlar: ${criteriaList}
4 daraja (A'lo [5], Yaxshi [4], Qoniqarli [3], Qoniqarsiz [2]) bo'yicha jadval shaklida chiqaring.`;
  return generateAICompletion({ prompt });
}

export async function fixGrammarAndImproveText({ text, action = 'improve' }) {
  const prompts = {
    grammar: `Ushbu matndagi grammatik va imlo xatolarni to'g'rilab bering, keyin tuzatilgan matnni bering:\n\n"${text}"`,
    translate: `Ushbu matnni aniq va adabiy o'zbek tiliga tarjima qiling:\n\n"${text}"`,
    improve: `Ushbu matnni professional, akademik ta'limiy uslubda yaxshilab, boyitib bering:\n\n"${text}"`,
    summarize: `Ushbu matnni qisqacha xulosa (3-5 asosiy fikr) ko'rinishida bering:\n\n"${text}"`,
    explain: `Ushbu tushunchani o'quvchilarga tushunarli, oddiy va namunalar bilan tushuntiring:\n\n"${text}"`,
  };
  return generateAICompletion({ prompt: prompts[action] || prompts.improve });
}
