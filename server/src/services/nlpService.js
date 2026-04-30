const EMOTION_KEYWORDS = {
  happy: {
    keywords: ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'awesome', 'grateful', 'blessed', 'thrilled', 'delighted', 'cheerful', 'glad', 'pleased'],
    intensity: 'positive',
  },
  sad: {
    keywords: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'heartbroken', 'devastated', 'crying', 'tears', 'empty', 'hopeless', 'blue', 'gloomy', 'melancholy'],
    intensity: 'negative',
  },
  anxious: {
    keywords: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'fearful', 'panic', 'scared', 'frightened', 'restless', 'edgy', 'overwhelmed by worry'],
    intensity: 'negative',
  },
  angry: {
    keywords: ['angry', 'furious', 'mad', 'rage', 'frustrated', 'annoyed', 'irritated', 'pissed', 'livid', 'enraged', 'bitter', 'resentful', 'hostile'],
    intensity: 'negative',
  },
  stressed: {
    keywords: ['stressed', 'overwhelmed', 'pressure', 'burden', 'exhausted', 'drained', 'burnt out', 'swamped', 'too much', 'can\'t handle', 'breaking point'],
    intensity: 'negative',
  },
  peaceful: {
    keywords: ['peaceful', 'calm', 'relaxed', 'serene', 'tranquil', 'content', 'at ease', 'comfortable', 'settled', 'balanced', 'centered'],
    intensity: 'positive',
  },
  grateful: {
    keywords: ['grateful', 'thankful', 'blessed', 'appreciate', 'fortunate', 'lucky', 'humbled', 'grace'],
    intensity: 'positive',
  },
  confused: {
    keywords: ['confused', 'lost', 'uncertain', 'unclear', 'don\'t know', 'mixed up', 'bewildered', 'puzzled', 'disoriented', 'conflicted'],
    intensity: 'neutral',
  },
  lonely: {
    keywords: ['lonely', 'alone', 'isolated', 'abandoned', 'disconnected', 'empty', 'nobody cares', 'no one understands'],
    intensity: 'negative',
  },
  worried: {
    keywords: ['worried', 'concern', 'anxious about', 'what if', 'afraid that', 'keep thinking', 'can\'t stop thinking'],
    intensity: 'negative',
  },
};

const INTENSITY_AMPLIFIERS = ['very', 'extremely', 'really', 'so', 'incredibly', 'absolutely', 'completely', 'totally'];
const INTENSITY_REDUCERS = ['a bit', 'somewhat', 'kind of', 'sort of', 'slightly', 'a little'];

const detectEmotionKeywords = (text) => {
  const lowerText = text.toLowerCase();
  const matchedEmotions = {};

  for (const [emotion, { keywords }] of Object.entries(EMOTION_KEYWORDS)) {
    const matches = keywords.filter((kw) => lowerText.includes(kw));
    if (matches.length > 0) {
      matchedEmotions[emotion] = matches.length;
    }
  }

  if (Object.keys(matchedEmotions).length === 0) {
    return null;
  }

  const primaryEmotion = Object.keys(matchedEmotions).sort(
    (a, b) => matchedEmotions[b] - matchedEmotions[a]
  )[0];

  return {
    emotion: primaryEmotion,
    matchedKeywords: EMOTION_KEYWORDS[primaryEmotion].keywords.filter((kw) => lowerText.includes(kw)),
    confidence: matchedEmotions[primaryEmotion] > 2 ? 'high' : 'medium',
  };
};

const analyzeSentimentIntensity = (text) => {
  const lowerText = text.toLowerCase();

  const hasAmplifier = INTENSITY_AMPLIFIERS.some((amp) => lowerText.includes(amp));
  const hasReducer = INTENSITY_REDUCERS.some((red) => lowerText.includes(red));

  if (hasAmplifier) return 'high';
  if (hasReducer) return 'low';
  return 'medium';
};

const enhanceEmotionAnalysis = (text, aiEmotion) => {
  const keywordResult = detectEmotionKeywords(text);
  const sentimentIntensity = analyzeSentimentIntensity(text);

  return {
    primaryEmotion: aiEmotion || (keywordResult ? keywordResult.emotion : 'neutral'),
    confidence: keywordResult ? keywordResult.confidence : 'low',
    sentimentIntensity,
    matchedKeywords: keywordResult ? keywordResult.matchedKeywords : [],
    nlpMethod: keywordResult ? 'keyword-based' : 'ai-only',
  };
};

module.exports = {
  detectEmotionKeywords,
  enhanceEmotionAnalysis,
  analyzeSentimentIntensity,
};