/**
 * Custom NLP Emotion Classifier
 * Uses keyword analysis + sentiment analysis for emotion detection
 */

// Emotion keyword dictionary (simple NLP technique)
const emotionKeywords = {
    happy: ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'good', 'fantastic', 'thrilled', 'delighted', 'cheerful', 'blessed', 'grateful', 'awesome', 'excellent', 'love', 'loved', 'enjoying'],
    sad: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'heartbroken', 'lonely', 'empty', 'hopeless', 'crying', 'tears', 'hurt', 'pain', 'sorrow', 'grief', 'disappointed'],
    anxious: ['anxious', 'nervous', 'worried', 'panic', 'fear', 'scared', 'terrified', 'restless', 'uneasy', 'tension', 'afraid', 'frightened', 'paranoid', 'alarmed'],
    stressed: ['stressed', 'overwhelmed', 'pressure', 'burden', 'exhausted', 'tired', 'burnout', 'overworked', 'deadline', 'swamped', 'drowning', 'can\'t cope', 'too much'],
    angry: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage', 'upset', 'hate', 'pissed', 'enraged', 'outraged', 'livid'],
    peaceful: ['calm', 'peace', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content', 'balanced', 'centered', 'composed', 'still', 'quiet'],
    grateful: ['grateful', 'thankful', 'blessed', 'appreciate', 'fortunate', 'lucky', 'appreciative', 'indebted'],
    worried: ['worried', 'concerned', 'uncertain', 'doubtful', 'troubled', 'bothered', 'apprehensive', 'fearful'],
    excited: ['excited', 'thrilled', 'eager', 'enthusiastic', 'pumped', 'looking forward', 'can\'t wait', 'hyped', 'psyched'],
    overwhelmed: ['overwhelmed', 'too much', 'can\'t handle', 'drowning', 'swamped', 'buried', 'overloaded'],
    confused: ['confused', 'lost', 'unclear', 'puzzled', 'bewildered', 'perplexed', 'don\'t understand', 'mixed up'],
    neutral: ['okay', 'fine', 'alright', 'normal', 'average', 'nothing special', 'meh'],
  };
  
  /**
   * Analyze text for emotion keywords (simple NLP)
   */
  function detectEmotionKeywords(text) {
    const lowerText = text.toLowerCase();
    const detectedEmotions = {};
  
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => lowerText.includes(keyword));
      if (matches.length > 0) {
        detectedEmotions[emotion] = {
          count: matches.length,
          keywords: matches,
        };
      }
    }
  
    if (Object.keys(detectedEmotions).length === 0) {
      return null;
    }
  
    const topEmotion = Object.keys(detectedEmotions).reduce((a, b) =>
      detectedEmotions[a].count > detectedEmotions[b].count ? a : b
    );
  
    return {
      emotion: topEmotion,
      matchedKeywords: detectedEmotions[topEmotion].keywords,
      allDetected: detectedEmotions,
    };
  }
  
  /**
   * Analyze sentiment intensity (basic NLP technique)
   */
  function analyzeSentimentIntensity(text) {
    const intensifiers = ['very', 'extremely', 'really', 'so', 'absolutely', 'completely', 'totally', 'super', 'incredibly', 'utterly', 'highly', 'deeply'];
    const negations = ['not', 'no', 'never', 'don\'t', 'can\'t', 'won\'t', 'couldn\'t', 'wouldn\'t', 'shouldn\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t'];
  
    const lowerText = text.toLowerCase();
    
    const foundIntensifiers = intensifiers.filter(word => lowerText.includes(word));
    const foundNegations = negations.filter(word => lowerText.includes(word));
  
    return {
      intensity: foundIntensifiers.length > 0 ? 'high' : 'normal',
      negated: foundNegations.length > 0,
      intensifiers: foundIntensifiers,
      negations: foundNegations,
    };
  }
  
  /**
   * Extract key phrases from text (basic NLP)
   */
  function extractKeyPhrases(text) {
    const stopWords = ['i', 'am', 'is', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'my', 'me', 'it', 'this', 'that', 'be', 'have', 'has'];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
  
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
  
    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([word, freq]) => ({ word, frequency: freq }));
  
    return sortedWords.slice(0, 5);
  }
  
  /**
   * Analyze message length and complexity
   */
  function analyzeMessageComplexity(text) {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? words / sentences : words;
  
    return {
      wordCount: words,
      sentenceCount: sentences,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      complexity: avgWordsPerSentence > 15 ? 'complex' : avgWordsPerSentence > 8 ? 'moderate' : 'simple',
    };
  }
  
  /**
   * Enhanced emotion analysis combining keyword matching + AI
   */
  function enhanceEmotionAnalysis(userMessage, aiDetectedEmotion) {
    const keywordAnalysis = detectEmotionKeywords(userMessage);
    const sentiment = analyzeSentimentIntensity(userMessage);
    const keyPhrases = extractKeyPhrases(userMessage);
    const complexity = analyzeMessageComplexity(userMessage);
  
    const keywordEmotion = keywordAnalysis ? keywordAnalysis.emotion : null;
  
    let confidence = 'low';
    if (keywordEmotion === aiDetectedEmotion) {
      confidence = 'high';
    } else if (keywordEmotion && aiDetectedEmotion) {
      confidence = 'medium';
    } else if (aiDetectedEmotion) {
      confidence = 'medium';
    }
  
    return {
      primaryEmotion: aiDetectedEmotion,
      secondaryEmotion: keywordEmotion,
      matchedKeywords: keywordAnalysis ? keywordAnalysis.matchedKeywords : [],
      allDetectedEmotions: keywordAnalysis ? Object.keys(keywordAnalysis.allDetected) : [],
      sentimentIntensity: sentiment.intensity,
      isNegated: sentiment.negated,
      intensifiers: sentiment.intensifiers,
      negations: sentiment.negations,
      keyPhrases,
      messageComplexity: complexity,
      confidence,
      nlpMethod: 'hybrid',
    };
  }
  
  module.exports = {
    detectEmotionKeywords,
    analyzeSentimentIntensity,
    extractKeyPhrases,
    analyzeMessageComplexity,
    enhanceEmotionAnalysis,
  };