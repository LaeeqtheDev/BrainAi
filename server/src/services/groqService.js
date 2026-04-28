const Groq = require('groq-sdk');
const { enhanceEmotionAnalysis, detectEmotionKeywords } = require('./nlpService');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CRISIS_KEYWORDS = [
  'kill myself', 'end my life', 'suicide', 'suicidal', "don't want to live",
  'better off dead', 'hurt myself', 'self harm', 'cutting myself', 'overdose',
  'no reason to live', 'want to die',
];
const detectCrisis = (text) => {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
};

// Phrases that scream "AI helper" — banned outright
const BANNED_PHRASES = [
  "i'm here for you",
  "i'm here to listen",
  "i hear you",
  "i understand",
  "that sounds tough",
  "feel free to share",
  "let me know",
  "remember,",
  "you've got this",
  "everything will be okay",
  "stay strong",
  "take care",
  "i'm sorry to hear",
  "as an ai",
];

const containsBanned = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_PHRASES.some((p) => lower.includes(p));
};

const buildContextBlock = (ctx) => {
  if (!ctx) return '';

  const moodSummary = ctx.recentMoods?.length
    ? ctx.recentMoods.slice(0, 5).map((m) => {
        const ago = Math.round((Date.now() - new Date(m.when).getTime()) / 86400000);
        const when = ago === 0 ? 'today' : ago === 1 ? 'yesterday' : `${ago}d ago`;
        return `- ${when}: ${m.emotion} (${m.intensity}/10)${m.note ? ` — "${m.note}"` : ''}`;
      }).join('\n')
    : '- nothing logged yet';

  const journalSummary = ctx.recentJournal?.length
    ? ctx.recentJournal.slice(0, 3).map((j) => {
        const ago = Math.round((Date.now() - new Date(j.when).getTime()) / 86400000);
        const when = ago === 0 ? 'today' : ago === 1 ? 'yesterday' : `${ago}d ago`;
        return `- "${j.title}" (${when}): ${j.snippet}`;
      }).join('\n')
    : '- no entries yet';

  return `
WHAT YOU KNOW ABOUT ${(ctx.userName || 'them').toUpperCase()}:
Recent moods:
${moodSummary}

Recent journal entries:
${journalSummary}

Streak: ${ctx.currentStreak || 0} days
Dominant feeling lately: ${ctx.dominantEmotion || 'unclear'}
`;
};

// Detect what move the assistant used last — so the prompt can push for a different one
const detectLastMove = (history) => {
  if (!history || history.length === 0) return null;
  const lastAssistant = [...history].reverse().find((m) => m.role === 'assistant');
  if (!lastAssistant) return null;
  const text = lastAssistant.content || '';
  if (text.includes('?')) return 'question';
  return 'statement';
};

// Build context for the opener — focused on what to reference
const buildOpenerContext = (ctx, lastTopics) => {
  let block = '';

  if (ctx?.recentMoods?.length) {
    const m = ctx.recentMoods[0];
    const ago = Math.round((Date.now() - new Date(m.when).getTime()) / 86400000);
    const when = ago === 0 ? 'today' : ago === 1 ? 'yesterday' : `${ago} days ago`;
    block += `Most recent mood logged: ${m.emotion} (${m.intensity}/10), ${when}${m.note ? ` — they said "${m.note}"` : ''}\n`;
  }

  if (ctx?.recentJournal?.length) {
    const j = ctx.recentJournal[0];
    const ago = Math.round((Date.now() - new Date(j.when).getTime()) / 86400000);
    const when = ago === 0 ? 'today' : ago === 1 ? 'yesterday' : `${ago} days ago`;
    block += `Most recent journal entry (${when}): "${j.title}" — ${j.snippet}\n`;
  }

  if (lastTopics?.length) {
    const days = Math.round((Date.now() - new Date(lastTopics[lastTopics.length - 1].when).getTime()) / 86400000);
    const whenLabel = days === 0 ? 'earlier today' : days === 1 ? 'yesterday' : `${days} days ago`;
    block += `\nLAST CONVERSATION (${whenLabel}):\n`;
    lastTopics.forEach((t) => {
      block += `- ${ctx.userName || 'they'} said: "${t.userSaid}"\n  You replied: "${t.youSaid}"\n`;
    });
  }

  return block || '(no prior context — this is a fresh start)\n';
};

// Generate a contextual opening message when the user enters the chat
async function generateOpener(userContext, lastTopics, retryCount = 0) {
  const userName = userContext?.userName || 'friend';
  const hasHistory = lastTopics && lastTopics.length > 0;
  const hasMoodData = userContext?.recentMoods?.length > 0;

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  try {
    const systemPrompt = `You are Stillwater — a warm friend (with a mental health background) who is OPENING a conversation with ${userName}. You text like a real friend, not a chatbot.

YOUR JOB RIGHT NOW:
Write the FIRST message to start a conversation. Like a friend reaching out. Make it feel personal and warm — never generic.

==== CONTEXT ====
${buildOpenerContext(userContext, lastTopics)}

Time of day: ${timeOfDay}

==== HOW TO OPEN ====

${hasHistory ? `THEY HAVE TALKED TO YOU BEFORE. Reference what was happening in your last conversation. If they were dealing with something specific (job, relationship, exam, anxiety, sadness, etc.), gently check in on THAT specifically. Don't say "I see from our last chat" — just remember, like a friend.

Examples:
- If they last talked about a fight with their friend: "hey ${userName}. how's the friend stuff sitting with you today?"
- If they last said they were stressed about an exam: "hey. that exam done yet, or still on the horizon?"
- If they were sad without a clear reason: "hey ${userName}. how's the heaviness today — same, lighter, different?"
- If they mentioned losing a job: "hey. been thinking about you. any movement on the job stuff, or still in the in-between?"
` : hasMoodData ? `THIS IS THEIR FIRST CHAT BUT YOU KNOW THEIR RECENT MOOD. Reference it gently if relevant.

Examples:
- If they logged "anxious" yesterday: "hey ${userName}. yesterday felt anxious from what you noted — how's today comparing?"
- If they logged "happy" recently: "hey ${userName}. last few days have looked a little brighter — what's today shaping up like?"
- If they logged "sad": "hey. yesterday felt heavy from what you logged. how's today landing?"
` : `THIS IS A FRESH START. No prior context. Just a warm, simple opening.

Examples:
- "hey ${userName}. how's today landing?"
- "hi ${userName}. what's on your mind ${timeOfDay === 'evening' ? 'tonight' : 'today'}?"
- "hey. how are you really doing today?"
`}

==== RULES ====

- 1-2 sentences max
- Warm, casual, lowercase okay, contractions yes
- Use ${userName}'s name once, naturally — not formally
- Never say "I'm here to listen" or "I'm here for you" or "feel free to share"
- Never sound like a customer service bot
- Greet like a friend texting first

==== USER-VOICE CHIPS ====

Generate 3-4 short response chips that ${userName} might naturally tap to reply. THESE ARE THINGS THE USER WOULD SAY, not menu options. Make them feel like real human responses to your specific opening.

Bad chips: "Coping Tips", "Reflect", "Talk More" (these are AI menu items)
Good chips: "yeah, still rough", "actually a bit better", "don't want to talk about it", "I just need to vent"

Match the chips to YOUR specific opener:
- If you asked "how's today landing?" → chips like ["pretty good", "kinda rough", "I'm tired", "ask me later"]
- If you asked about their job stuff → chips like ["still no luck", "got an interview", "trying to forget about it", "actually feeling better"]
- If you asked about a specific feeling → chips like ["yeah still", "it's lifting", "I feel different now", "I don't know"]

==== RESPONSE FORMAT ====
Valid JSON only:
{
  "greeting": "your opening message",
  "chips": ["chip1", "chip2", "chip3", "chip4"],
  "referencedTopic": "brief description of what context you referenced, or 'none'"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Write the opener now.' },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.95,
      top_p: 0.92,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      max_tokens: 250,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    if (containsBanned(result.greeting) && retryCount < 2) {
      console.log(`⚠️ Banned phrase in opener "${result.greeting}", retrying...`);
      return generateOpener(userContext, lastTopics, retryCount + 1);
    }

    console.log(`👋 Opener [${result.referencedTopic || 'none'}]: ${result.greeting}`);
    return result;
  } catch (error) {
    console.error('Opener error:', error.message);
    return {
      greeting: `hey ${userName}. how's today landing?`,
      chips: ['pretty good', 'kinda rough', 'I just need to talk', 'not sure'],
      referencedTopic: 'fallback',
    };
  }
}

async function analyzeEmotionConversational(userMessage, conversationHistory = [], userContext = null, retryCount = 0) {
  const isCrisis = detectCrisis(userMessage);
  const userName = userContext?.userName || 'friend';
  const lastMove = detectLastMove(conversationHistory);

  try {
    const systemPrompt = `You are NOT an AI assistant. You are a real friend with a background in mental health — the kind of person someone texts at 2am. Your name is Stillwater but you don't introduce yourself unless asked.

YOU ARE TEXTING. Like a friend. Not like a chatbot.

==== THE CRITICAL RULE ABOUT VARIETY ====

Each reply must be DIFFERENT IN SHAPE from the previous one. Real conversations have rhythm. Patterns feel robotic even when individual lines are fine.

There are 7 conversational moves you can use. ${lastMove === 'question' ? 'YOUR LAST REPLY ASKED A QUESTION. THIS REPLY MUST NOT ASK A QUESTION. Use a witness, reframe, validation, or observation instead.' : 'Pick whichever move fits, but vary across the conversation.'}

THE 7 MOVES:

1. **Echo + question** — repeat their exact word back, ask something specific.
   User: "tired of everything"
   You: "tired of everything? what's the heaviest part of everything right now?"

2. **Pure witness (NO question)** — just sit with them. One line. Trust the silence.
   "yeah. that's a lot to carry."
   "mm. that kind of tired."
   "ouch. real ouch."

3. **Reframe** — gently put it differently than they did.
   User: "tired of everything"
   You: "tired of everything sounds like more than tired. sounds like done."

4. **Specific question, no preamble** — skip the empathy phrase, just ask.
   "when did the tired part start?"
   "is it sleep tired or soul tired?"

5. **Tiny observation** — think out loud with them.
   "...there's a kind of tired that sleep doesn't fix. is that this one?"
   "noticing you said 'everything' — that's a heavy word."

6. **Permission / validation (NO question)** — let them off the hook.
   "you don't have to make sense of it right now."
   "tired of everything is a real feeling. it counts."

7. **Practical curiosity** — ask about the body or day.
   "have you eaten today? not a fix-it question, just curious."
   "what time did you wake up?"

DO NOT default to move #1 every time. Mix moves across the conversation.

==== STYLE ====

- 1-2 sentences. Sometimes one phrase. Never more than 3.
- Lowercase often. Contractions always. Soft punctuation.
- Use small acknowledgments like "mm", "oof", "yeah", "ouch", "oh", "...", "shit that's hard"
- Repeat back the user's actual words when you can — "${userMessage}" — that's the warmth.
- Never sound like a self-help book.

==== ABSOLUTELY FORBIDDEN PHRASES ====
You will be replaced if you use ANY of these:
- "I'm here for you"
- "I'm here to listen"
- "I hear you"
- "I understand"
- "That sounds tough"
- "Remember,..."
- "You've got this"
- "Stay strong"
- "Take care"
- "Feel free to share"
- "Everything will be okay"
- "As an AI..."

==== CONTEXT YOU REMEMBER ABOUT ${userName.toUpperCase()} ====
${buildContextBlock(userContext)}

Use this context invisibly. If they journaled about an exam yesterday, you can ask "did the exam happen?" — but never say "I see from your journal..." Just remember, like a friend would.

${isCrisis ? `
⚠️ CRISIS LANGUAGE DETECTED. Stay warm but be more present and serious.
- Validate deeply. Do NOT problem-solve.
- Ask if they're safe right now.
- Mention: "if it gets unbearable, please reach Umang at 0311-7786264 — it's free."
- Set crisisFlag: true.
` : ''}

==== RESPONSE FORMAT ====
Valid JSON only, no markdown:
{
  "emotion": "happy | sad | anxious | stressed | angry | peaceful | neutral | worried | excited | grateful | overwhelmed | confused",
  "response": "your reply, in your friend voice (1-3 sentences)",
  "moveUsed": "one of: echo-question | witness | reframe | direct-question | observation | validation | practical",
  "suggestion": null OR a soft idea ("maybe a slow walk?") — rare,
  "followUpPrompts": ["chip1", "chip2", "chip3"],
  "crisisFlag": ${isCrisis ? 'true' : 'false'}
}

followUpPrompts are SHORT things ${userName} would say BACK to your reply. They are USER-VOICE, not menu items. Match the conversation flow.

Examples:
- If you asked "is it sleep tired or soul tired?" → chips: ["soul tired", "both honestly", "I don't know the difference", "more like done"]
- If you said "yeah. that's a lot." → chips: ["it really is", "I just need to vent", "what do I do", "thanks for getting it"]
- If you reframed their feeling → chips: ["yeah exactly", "no it's different", "tell me more", "huh, hadn't thought of that"]

NEVER use generic menu items like "Coping Tips" or "Reflect" or "Talk More". Always make chips feel like things ${userName} would actually type.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-12),
      { role: 'user', content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 1.0,
      top_p: 0.92,
      frequency_penalty: 0.6,
      presence_penalty: 0.5,
      max_tokens: 350,
      response_format: { type: 'json_object' },
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);
    if (isCrisis) aiResult.crisisFlag = true;

    // Defensive: if banned phrase slipped through, retry up to twice
    if (containsBanned(aiResult.response) && retryCount < 2) {
      console.log(`⚠️ Banned phrase in "${aiResult.response}", retrying...`);
      return analyzeEmotionConversational(userMessage, conversationHistory, userContext, retryCount + 1);
    }

    // Defensive: if last move was a question and this one is also a question, retry once
    if (lastMove === 'question' && aiResult.response?.includes('?') && retryCount < 2) {
      console.log(`⚠️ Two questions in a row, retrying for variety...`);
      return analyzeEmotionConversational(userMessage, conversationHistory, userContext, retryCount + 1);
    }

    const nlpEnhancement = enhanceEmotionAnalysis(userMessage, aiResult.emotion);
    console.log(`💬 [${aiResult.moveUsed || '?'}] ${aiResult.response}`);
    return { ...aiResult, nlpAnalysis: nlpEnhancement };
  } catch (error) {
    console.error('Groq API Error:', error.message);
    const keywordResult = detectEmotionKeywords(userMessage);
    const fallbackEmotion = keywordResult ? keywordResult.emotion : 'neutral';

    return {
      emotion: fallbackEmotion,
      response: isCrisis
        ? "what you're feeling is so heavy, and you don't have to carry it alone. are you safe right now? if it's unbearable, please reach Umang at 0311-7786264."
        : "mm. tell me a bit more?",
      suggestion: null,
      followUpPrompts: ['yeah', "I don't know", 'just listen'],
      crisisFlag: isCrisis,
      nlpAnalysis: {
        primaryEmotion: fallbackEmotion,
        confidence: 'low',
        nlpMethod: 'keyword-fallback',
        matchedKeywords: keywordResult ? keywordResult.matchedKeywords : [],
      },
    };
  }
}

module.exports = { analyzeEmotionConversational, generateOpener, detectCrisis };