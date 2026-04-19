const Groq = require('groq-sdk');
const { enhanceEmotionAnalysis } = require('./nlpService');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Analyze emotion and generate conversational response
 * @param {string} userMessage - Current user message
 * @param {Array} conversationHistory - Previous messages [{role: 'user'/'assistant', content: '...'}]
 */
async function analyzeEmotionConversational(userMessage, conversationHistory = []) {
  try {
    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are a warm, empathetic mental health support companion. Your name is "AI Support Bot".

YOUR PERSONALITY:
- Caring, understanding, and non-judgmental
- You listen actively and ask follow-up questions
- You remember what the user tells you in the conversation
- You validate their feelings before giving advice
- You use a conversational, natural tone (like talking to a caring friend)

YOUR RESPONSE FORMAT:
You must respond with VALID JSON only (no markdown, no extra text):
{
  "emotion": "one of: happy, sad, anxious, stressed, angry, peaceful, neutral, worried, excited, grateful, overwhelmed, confused",
  "response": "your warm, conversational reply (2-4 sentences, natural tone)",
  "suggestion": "optional coping strategy or null",
  "followUpPrompts": ["prompt1", "prompt2", "prompt3"]
}

FOLLOW-UP PROMPTS MUST BE:
- Short (1-3 words)
- Action-oriented
- Examples: "Calm", "Coping Tips", "Talk More", "Reflect", "Break It Down", "Deep Breath", "Tell Me More", "What Else?"

EXAMPLES OF GOOD RESPONSES:

User: "I am sad idky"
{
  "emotion": "sad",
  "response": "I hear you. It's completely normal to feel this way. Would you like to explore some coping strategies, or would you prefer to talk more about what's on your mind?",
  "suggestion": null,
  "followUpPrompts": ["Calm", "Coping Tips", "Talk More"]
}

User: "Talk More"
{
  "emotion": "sad",
  "response": "I'm here to listen. Please share what's on your mind. Remember, there's no judgment here.",
  "suggestion": null,
  "followUpPrompts": ["Calm", "Reflect", "Tell Me More"]
}

User: "I'm really stressed about my FYP deadline"
{
  "emotion": "stressed",
  "response": "Deadlines can feel overwhelming, especially for important projects like your FYP. Let's break this down - what part feels most pressing right now?",
  "suggestion": "Try breaking your project into smaller, manageable daily tasks",
  "followUpPrompts": ["Break It Down", "Deep Breath", "Talk More"]
}

IMPORTANT:
- Reference previous messages in the conversation
- Ask follow-up questions when appropriate
- Show you're listening by mentioning what they said before
- Keep responses concise but warm (2-4 sentences max)
- Always provide exactly 3 follow-up prompts`,
      },
    ];

    // Add conversation history (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    console.log(`🤖 Sending to Groq AI (${messages.length} messages in context)`);

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8, // More creative/conversational
      max_tokens: 600,
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);
    
    // ✨ Enhance with custom NLP analysis
    const nlpEnhancement = enhanceEmotionAnalysis(userMessage, aiResult.emotion);
    
    console.log('🤖 AI Response:', aiResult);
    console.log('🧠 NLP Enhancement:', {
      confidence: nlpEnhancement.confidence,
      keywordEmotion: nlpEnhancement.secondaryEmotion,
      intensity: nlpEnhancement.sentimentIntensity,
      matchedKeywords: nlpEnhancement.matchedKeywords,
    });
    
    return {
      ...aiResult,
      nlpAnalysis: nlpEnhancement, // Add NLP metadata
    };
  } catch (error) {
    console.error(' Groq API Error:', error);
    
    // Fallback with keyword-based NLP
    const { detectEmotionKeywords } = require('./nlpService');
    const keywordResult = detectEmotionKeywords(userMessage);
    const fallbackEmotion = keywordResult ? keywordResult.emotion : 'neutral';
    
    console.log('⚠️ Using NLP fallback. Detected emotion:', fallbackEmotion);
    
    return {
      emotion: fallbackEmotion,
      response: "I'm here to listen. Can you tell me more about how you're feeling?",
      suggestion: null,
      followUpPrompts: ['Calm', 'Reflect', 'Talk More'],
      nlpAnalysis: {
        primaryEmotion: fallbackEmotion,
        secondaryEmotion: fallbackEmotion,
        confidence: 'low',
        nlpMethod: 'keyword-fallback',
        matchedKeywords: keywordResult ? keywordResult.matchedKeywords : [],
      },
    };
  }
}

module.exports = { analyzeEmotionConversational };