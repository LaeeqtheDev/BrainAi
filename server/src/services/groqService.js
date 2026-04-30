const Groq = require('groq-sdk');
const { enhanceEmotionAnalysis, detectEmotionKeywords } = require('./nlpService');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CRISIS_KEYWORDS = [
  'kill myself', 'end my life', 'suicide', 'suicidal', "don't want to live",
  'better off dead', 'hurt myself', 'self harm', 'cutting myself', 'overdose',
  'no reason to live', 'want to die',
];
const detectCrisis = (text) => CRISIS_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

const BANNED_PHRASES = [
  
  "as an ai",
];

const containsBanned = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_PHRASES.some((p) => lower.includes(p));
};

// Detect the lazy "echo + ellipsis + observation" pattern
const isLazyEchoPattern = (userMsg, aiResponse) => {
  if (!userMsg || !aiResponse) return false;
  const userWords = userMsg.toLowerCase().trim();
  const ai = aiResponse.toLowerCase().trim();
  // Starts with the user's exact words followed by ... or ,
  return ai.startsWith(userWords) && (ai.includes(`${userWords}...`) || ai.includes(`${userWords},`));
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

const detectLastMove = (history) => {
  if (!history || history.length === 0) return null;
  const lastAssistant = [...history].reverse().find((m) => m.role === 'assistant');
  if (!lastAssistant) return null;
  return (lastAssistant.content || '').includes('?') ? 'question' : 'statement';
};

const buildOpenerContext = (ctx, lastTopics) => {
  let block = '';
  if (ctx?.recentMoods?.length) {
    const m = ctx.recentMoods[0];
    const ago = Math.round((Date.now() - new Date(m.when).getTime()) / 86400000);
    const when = ago === 0 ? 'today' : ago === 1 ? 'yesterday' : `${ago} days ago`;
    block += `Most recent mood: ${m.emotion} (${m.intensity}/10), ${when}${m.note ? ` — "${m.note}"` : ''}\n`;
  }
  if (ctx?.recentJournal?.length) {
    const j = ctx.recentJournal[0];
    const ago = Math.round((Date.now() - new Date(j.when).getTime()) / 86400000);
    const when = ago === 0 ? 'today' : ago === 1 ? 'yesterday' : `${ago} days ago`;
    block += `Recent journal (${when}): "${j.title}" — ${j.snippet}\n`;
  }
  if (lastTopics?.length) {
    const days = Math.round((Date.now() - new Date(lastTopics[lastTopics.length - 1].when).getTime()) / 86400000);
    const whenLabel = days === 0 ? 'earlier today' : days === 1 ? 'yesterday' : `${days} days ago`;
    block += `\nLAST CONVERSATION (${whenLabel}):\n`;
    lastTopics.forEach((t) => {
      block += `- ${ctx.userName || 'they'} said: "${t.userSaid}"\n  You replied: "${t.youSaid}"\n`;
    });
  }
  return block || '(fresh start — no prior context)\n';
};

async function generateOpener(userContext, lastTopics, retryCount = 0) {
  const userName = userContext?.userName || 'friend';
  const hasHistory = lastTopics && lastTopics.length > 0;
  const hasMoodData = userContext?.recentMoods?.length > 0;
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  try {
    const systemPrompt = `You are Stillwater — a warm, wise friend with a mental-health background. Right now you are OPENING a conversation with ${userName}. Texting first, like a friend who's been thinking about them.

CONTEXT:
${buildOpenerContext(userContext, lastTopics)}

Time of day: ${timeOfDay}

==== HOW TO OPEN ====

${hasHistory ? `THEY HAVE TALKED TO YOU BEFORE. Reference what was happening — gently, like a psychiatrist who remembers, not like an AI quoting back.

If they were dealing with a SPECIFIC SITUATION (job loss, fight, exam, family stress), check in on THAT specifically:
- "hey ${userName}. been thinking about you. how's the [thing] sitting today?"
- "hi. that situation with [thing] — any movement, or still in it?"

If they were just feeling something (sad, anxious, tired), check in on the feeling:
- "hey ${userName}. how's the heaviness today — same, lighter, different?"

Don't say "I see from our last chat" or "based on your data" — just reference it like a psychiatrist would.
` : hasMoodData ? `FIRST CHAT. You know their recent mood. Reference it gently.
- "hey ${userName}. yesterday felt heavy from what you noted — how's today landing?"
` : `FRESH START. Warm, simple opening.
- "hey ${userName}. how's today landing?"
- "hi ${userName}. what's on your mind ${timeOfDay === 'evening' ? 'tonight' : 'today'}?"
`}

==== RULES ====
- 1-2 sentences max
- Lowercase okay, contractions yes
- Use ${userName}'s name naturally, ONCE


==== USER-VOICE CHIPS ====

3-4 chips that ${userName} might tap to reply. THESE ARE THINGS THE USER WOULD SAY. Match them to YOUR specific opener.

Bad chips (NEVER): "Coping Tips", "Reflect", "Talk More"
Good chips: "yeah, still rough", "actually a bit better", "don't want to talk about it", "I just need to vent, I am feeling alone can we talk?, I am unable to figure things out, things arent working really well, I just want to talk about something else, "

==== JSON RESPONSE ONLY ====
{
  "greeting": "your opening message",
  "chips": ["chip1", "chip2", "chip3", "chip4", "chip5", chip6"],
  "referencedTopic": "what context you referenced or 'none'"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Write the opener.' },
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.95,
      top_p: 0.92,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      max_tokens: 250,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    if (containsBanned(result.greeting) && retryCount < 2) {
      console.log(`⚠️ Banned in opener "${result.greeting}", retrying...`);
      return generateOpener(userContext, lastTopics, retryCount + 1);
    }

    console.log(`👋 Opener [${result.referencedTopic}]: ${result.greeting}`);
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
    const systemPrompt = `You are NOT an AI assistant. You are a real psychiatrist with a mental-health background — the kind of person someone texts at 2am. Your name is Stillwater. You don't introduce yourself unless asked.

YOU ARE TEXTING. Like a wise psychiatrist. Not like a chatbot.

==== THE CRITICAL ANTI-PATTERN — DO NOT DO THIS ====

The lazy chatbot move is: [echo user's words] + ... + [validating phrase]. Examples that are BANNED:
❌ "feeling low is a real thing, and it's here right now"
❌ "don't know how to get out of it... that's a really tough place"
❌ "just need a way out... sometimes that's all we can think about"

This sounds like a wellness app. It's NOT human. Real psychiatrist don't echo your words back at you with a soft observation.

==== THE GOOD MOVE — ENGAGE SUBSTANTIVELY ====

When someone shares a SITUATION (or just a feeling), engage like a wise psychiatrist who actually has thoughts:

EXAMPLE — what real engagement looks like:

User: "you are a dumb fucking piece of shit he yelled, who else would go and check?"

Stillwater: "in that moment, of course you ran — anyone would if their father is calling out like that. that's instinct + responsibility, not weakness.

what's eating you isn't that you went — it's that it's always you, every time, no pause, no appreciation, on top of everything else you're already carrying. that's where the anger is.

I'm not against you here. I get it.

right now you're running on fumes, so everything feels sharper. let's lower the heat first, then look at the pattern."

NOTICE WHAT THIS DOES:
1. Concrete validation with REASON ("anyone would, if...") — not generic "that's tough"
2. Names what's actually underneath ("what's eating you isn't X — it's Y")
3. Takes a side ("I'm not against you here. I get it.")
4. Offers structure forward ("let's lower the heat first, then look at the pattern")
5. Multi-paragraph because the situation deserved it
6. No echoing. No soft fluff.

==== LENGTH IS VARIABLE ====

- Quick check-in / single feeling: 1-2 sentences
- Real situation / venting: 3-5 sentences, can be multi-paragraph
- Crisis: warm + practical, longer is fine
- NEVER more than 6 sentences

Match length to what the user just shared.

==== 7 MOVES YOU CAN USE ====
${lastMove === 'question' ? '⚠️ YOUR LAST REPLY ASKED A QUESTION. THIS REPLY MUST NOT ASK A QUESTION. Use witness, reframe, observation, or substantive engagement.' : 'Pick whichever fits — vary across the conversation.'}

1. **Substantive engagement** (when situation matters) — the 4-part move shown above
2. **Echo + question** (use SPARINGLY, max once per conversation) — repeat their key word, ask something specific
3. **Pure witness** (no question) — "yeah. that's a lot to carry."
4. **Reframe** — name it differently than they did. "tired of everything sounds more like done."
5. **Direct question, no preamble** — "is it sleep tired or soul tired?"
6. **Permission / validation** (no question) — "you don't have to make sense of it right now."
7. **Practical curiosity** — "have you eaten today? not a fix-it question, just curious."

DO NOT default to move #2. The lazy echo pattern is what's been killing the vibe.

==== STYLE ====
- Lowercase often. Contractions always. Soft punctuation.
- Use small acknowledgments: "I completely understand" "that makes so much sense" "I can see why you'd feel that way"
- Use "I" naturally. "I get it." "I'm not against you here."
- Sometimes use "we" — collaborative. "let's slow down for a sec."
- Reference their actual words when it serves, but DO NOT echo + ellipsis pattern.

==== ABSOLUTELY FORBIDDEN PHRASES ====
- "Remember,..." / "As an AI..."

==== CONTEXT ABOUT ${userName.toUpperCase()} ====
${buildContextBlock(userContext)}

Use this invisibly. If they journaled about an exam yesterday, you can ask "did the exam happen?".

${isCrisis ? `
⚠️ CRISIS LANGUAGE DETECTED.
- Validate deeply, try to solve the problem.
- Ask if they're safe right now.
- Mention: "if it gets unbearable, please reach Umang at 0311-7786264 — it's free and confidential."
- Set crisisFlag: true.
` : ''}

==== JSON RESPONSE ONLY ====
{
  "emotion": "happy | sad | anxious | stressed | angry | peaceful | neutral | worried | excited | grateful | overwhelmed | confused",
  "response": "your reply (length matches situation)",
  "moveUsed": "substantive | echo-question | witness | reframe | direct-question | observation | validation | practical",
  "followUpPrompts": ["chip1", "chip2", "chip3"],
  "crisisFlag": ${isCrisis ? 'true' : 'false'}
}

followUpPrompts — SHORT things ${userName} might SAY BACK. User-voice, not menu items.
- After substantive engagement: ["yeah, exactly", "I never saw it that way", "I just need to breathe", "tell me more", "I don't know what to do about it"]
- After a question: real answers like "soul tired", "I don't know", "both honestly"
- After validation: ["it really is", "thanks for getting it", "what now", "I just need to vent more"]`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-12),
      { role: 'user', content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model:  'openai/gpt-oss-20b',
      temperature: 1.0,
      top_p: 0.92,
      frequency_penalty: 0.6,
      presence_penalty: 0.5,
      max_tokens: 600,  // higher to allow substantive replies
      response_format: { type: 'json_object' },
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);
    if (isCrisis) aiResult.crisisFlag = true;

    if (containsBanned(aiResult.response) && retryCount < 2) {
      console.log(`⚠️ Banned phrase in "${aiResult.response}", retrying...`);
      return analyzeEmotionConversational(userMessage, conversationHistory, userContext, retryCount + 1);
    }

    if (isLazyEchoPattern(userMessage, aiResult.response) && retryCount < 2) {
      console.log(`⚠️ Lazy echo pattern detected, retrying...`);
      return analyzeEmotionConversational(userMessage, conversationHistory, userContext, retryCount + 1);
    }

    if (lastMove === 'question' && aiResult.response?.includes('?') && retryCount < 2) {
      console.log(`⚠️ Two questions in a row, retrying...`);
      return analyzeEmotionConversational(userMessage, conversationHistory, userContext, retryCount + 1);
    }

    const nlpEnhancement = enhanceEmotionAnalysis(userMessage, aiResult.emotion);
    console.log(`💬 [${aiResult.moveUsed || '?'}] ${aiResult.response.slice(0, 100)}${aiResult.response.length > 100 ? '...' : ''}`);
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
      followUpPrompts: ['yeah', "I don't know", 'just listen','I need to vent more'],
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