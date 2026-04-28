const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Random angles to vary structure (no specific images!)
const OPENERS = [
  'starts with a verb',
  'starts with the word "today"',
  'starts with the word "sometimes"',
  'starts with a single concrete image',
  'starts with the word "you"',
  'starts with the word "even"',
  'starts with a question',
  'starts with the word "maybe"',
  'starts mid-thought',
];

const FORMS = [
  'a soft permission',
  'a plain observation',
  'a quiet reframe',
  'a gentle noticing',
  'a contradiction that turns out true',
  'a small fact about being human',
  'a quiet instruction',
  'a tender acknowledgment',
];

const BANNED_OPENINGS = [
  'My gentle presence',
  'You are enough',
  'Remember that',
  'Take a deep breath',
  "You've got this",
  'Today is a gift',
  'Believe in yourself',
  'I am',
  'My presence',
];

const BANNED_PHRASES = [
  'gentle presence',
  'inner light',
  'inner peace',
  'deep breath',
  'take a moment',
  'remember that',
  'you are enough',
  "you've got this",
  'rain on the window',
  'kettle still boils',
  'candle still lit',
  'one breath at a time',
  'one day at a time',
  'small steps',
  'baby steps',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const containsBannedPhrase = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_PHRASES.some((p) => lower.includes(p)) ||
         BANNED_OPENINGS.some((b) => lower.startsWith(b.toLowerCase()));
};

async function generateDailyAffirmation(retryCount = 0) {
  const opener = pick(OPENERS);
  const form = pick(FORMS);
  const seed = Math.random().toString(36).slice(2, 10);

  const systemPrompt = `You write one-line wellness lines for a calm app. Each line is fully original — never copied from common wellness content, never reused.

WRITE ONE LINE THAT:
- Is ${form}
- ${opener}
- Is under 16 words, ideally 8-12
- Uses lowercase or sentence case (no all caps)
- Has no emojis in the line itself
- Has no exclamation marks

THINGS YOU MUST AVOID — DO NOT USE ANY OF THESE PHRASES:
${BANNED_PHRASES.map((p) => `- "${p}"`).join('\n')}

DO NOT START WITH:
${BANNED_OPENINGS.map((b) => `- "${b}"`).join('\n')}

VOICE:
- Quiet, specific, slightly literary
- Like a thoughtful friend, not a coach
- Use your own original imagery — never default to weather, candles, kettles, breaths, journeys, stars, oceans
- Surprise the reader. Avoid wellness clichés entirely.

Respond with VALID JSON only:
{
  "affirmation": "the line",
  "category": "softness | rest | trust | enough | small things",
  "emoji": "one emoji that fits"
}

Variation token (do not output): ${seed}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Write the line.' },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 1.15,
      top_p: 0.9,
      frequency_penalty: 0.7,
      presence_penalty: 0.7,
      max_tokens: 80,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Defensive: retry up to twice if the model uses banned phrases
    if (containsBannedPhrase(result.affirmation) && retryCount < 2) {
      console.log(`⚠️ Banned phrase in "${result.affirmation}", retrying...`);
      return generateDailyAffirmation(retryCount + 1);
    }

    console.log('🌿 Affirmation:', result.affirmation);
    return { ...result, generatedAt: new Date().toISOString(), type: 'daily-affirmation' };
  } catch (error) {
    console.error('Daily affirmation error:', error.message);
    throw new Error('Failed to generate affirmation');
  }
}

async function generatePersonalizedQuote(emotion, userName = null, context = null, retryCount = 0) {
  const opener = pick(OPENERS);
  const form = pick(FORMS);
  const seed = Math.random().toString(36).slice(2, 10);

  const systemPrompt = `You write one short wellness line for someone feeling ${emotion}. Make it original — never something already common online.

WRITE ONE LINE THAT:
- Is ${form}
- ${opener}
- Is under 22 words
- Uses lowercase or sentence case
- Has no emojis or exclamation marks

DO NOT USE ANY OF THESE PHRASES:
${BANNED_PHRASES.map((p) => `- "${p}"`).join('\n')}

DO NOT START WITH:
${BANNED_OPENINGS.map((b) => `- "${b}"`).join('\n')}

VOICE: quiet, specific, like a thoughtful friend. Use your own original imagery — never default to weather, candles, kettles, breaths, journeys.

Respond with VALID JSON only:
{ "quote": "the line", "author": "Stillwater", "category": "hope | peace | resilience | strength | softness", "emoji": "one emoji" }

Variation token: ${seed}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Write the line${userName ? ` for ${userName}` : ''}.${context ? ` Context: ${context}.` : ''}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 1.15,
      top_p: 0.9,
      frequency_penalty: 0.7,
      presence_penalty: 0.7,
      max_tokens: 120,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    if (containsBannedPhrase(result.quote) && retryCount < 2) {
      console.log(`⚠️ Banned phrase in "${result.quote}", retrying...`);
      return generatePersonalizedQuote(emotion, userName, context, retryCount + 1);
    }

    console.log('✨ Quote:', result.quote);
    return {
      ...result,
      generatedAt: new Date().toISOString(),
      emotion,
      isPersonalized: true,
      source: 'ai-generated',
    };
  } catch (error) {
    console.error('AI Quote error:', error.message);
    throw new Error('Failed to generate quote');
  }
}

async function generateQuoteBatch(emotion, count = 3) {
  const promises = Array.from({ length: count }, () => generatePersonalizedQuote(emotion));
  return Promise.all(promises);
}

module.exports = {
  generatePersonalizedQuote,
  generateDailyAffirmation,
  generateQuoteBatch,
};