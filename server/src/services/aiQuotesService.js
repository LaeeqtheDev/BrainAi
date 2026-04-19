const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate AI-powered motivational quote
 */
async function generatePersonalizedQuote(emotion, userName = null, context = null) {
  try {
    const userContext = userName ? `for ${userName}` : 'for someone';
    const additionalContext = context ? `Context: ${context}.` : '';

    const messages = [
      {
        role: 'system',
        content: `You are a compassionate mental health companion creating personalized motivational quotes.

Generate a SHORT, powerful quote (max 2 sentences) based on the user's emotional state.

Guidelines:
- Warm, empathetic, and encouraging
- Culturally sensitive (suitable for Muslim users)
- Actionable and hopeful
- Natural conversational tone
- NO clichés or generic phrases

Respond ONLY with valid JSON (no markdown):
{
  "quote": "your personalized quote here",
  "author": "AI Companion",
  "category": "hope/peace/resilience/strength/gratitude",
  "emoji": "relevant emoji"
}`,
      },
      {
        role: 'user',
        content: `Generate a personalized quote ${userContext} feeling ${emotion}. ${additionalContext}`,
      },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.9,
      max_tokens: 150,
    });

    let responseText = completion.choices[0].message.content.trim();
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const result = JSON.parse(responseText);

    console.log('✨ AI Quote generated');

    return {
      ...result,
      generatedAt: new Date().toISOString(),
      emotion,
      isPersonalized: true,
      source: 'ai-generated',
    };
  } catch (error) {
    console.error(' AI Quote generation error:', error);
    throw new Error('Failed to generate quote. Please try again.');
  }
}

/**
 * Generate daily affirmation
 */
async function generateDailyAffirmation() {
  try {
    const messages = [
      {
        role: 'system',
        content: `Generate a positive daily affirmation that is:
- Empowering and uplifting
- Short (1 sentence)
- Suitable for anyone
- Culturally inclusive

Respond ONLY with valid JSON (no markdown):
{
  "affirmation": "your affirmation here",
  "category": "self-love/growth/peace/strength/gratitude",
  "emoji": "relevant emoji"
}`,
      },
      {
        role: 'user',
        content: 'Generate today\'s daily affirmation.',
      },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.9,
      max_tokens: 100,
    });

    let responseText = completion.choices[0].message.content.trim();
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const result = JSON.parse(responseText);

    return {
      ...result,
      generatedAt: new Date().toISOString(),
      type: 'daily-affirmation',
    };
  } catch (error) {
    console.error(' Daily affirmation error:', error);
    throw new Error('Failed to generate affirmation.');
  }
}

/**
 * Generate multiple quotes at once
 */
async function generateQuoteBatch(emotion, count = 3) {
  const promises = [];
  
  for (let i = 0; i < count; i++) {
    promises.push(generatePersonalizedQuote(emotion));
  }

  try {
    const quotes = await Promise.all(promises);
    return quotes;
  } catch (error) {
    console.error(' Batch generation error:', error);
    throw error;
  }
}

module.exports = {
  generatePersonalizedQuote,
  generateDailyAffirmation,
  generateQuoteBatch,
};