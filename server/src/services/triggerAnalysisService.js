const { db } = require('../config/firebase');

/**
 * Analyze patterns to identify triggers
 */
async function identifyTriggers(userId) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await db
      .collection('moodLogs')
      .where('userId', '==', userId)
      .where('timestamp', '>=', thirtyDaysAgo)
      .orderBy('timestamp', 'asc')
      .get();

    if (snapshot.size < 10) {
      return {
        triggers: [],
        message: 'Not enough data yet. Log more moods to identify patterns.',
        analyzed: snapshot.size,
        period: '30 days',
      };
    }

    const moods = snapshot.docs.map(doc => ({
      emotion: doc.data().emotion,
      intensity: doc.data().intensity || 5,
      timestamp: doc.data().timestamp.toDate(),
      note: doc.data().note || '',
    }));

    const triggers = [];

    // 1. Day of Week Pattern
    const dayPattern = {};
    moods.forEach(mood => {
      const day = mood.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayPattern[day]) {
        dayPattern[day] = { stressed: 0, total: 0 };
      }
      dayPattern[day].total++;
      if (['stressed', 'anxious', 'overwhelmed'].includes(mood.emotion)) {
        dayPattern[day].stressed++;
      }
    });

    // Find worst day
    let worstDay = null;
    let highestStressRate = 0;
    Object.keys(dayPattern).forEach(day => {
      const rate = dayPattern[day].stressed / dayPattern[day].total;
      if (rate > highestStressRate && dayPattern[day].total >= 3) {
        highestStressRate = rate;
        worstDay = day;
      }
    });

    if (worstDay && highestStressRate > 0.5) {
      triggers.push({
        type: 'temporal',
        pattern: 'Day of Week',
        trigger: worstDay,
        message: `You feel stressed most often on ${worstDay}s (${Math.round(highestStressRate * 100)}% of the time)`,
        suggestion: `Plan relaxation activities for ${worstDay}s or identify what makes this day challenging.`,
        severity: highestStressRate > 0.7 ? 'high' : 'medium',
      });
    }

    // 2. Time of Day Pattern
    const timePattern = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const timeTotal = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    moods.forEach(mood => {
      const hour = mood.timestamp.getHours();
      let period;
      if (hour >= 5 && hour < 12) period = 'morning';
      else if (hour >= 12 && hour < 17) period = 'afternoon';
      else if (hour >= 17 && hour < 21) period = 'evening';
      else period = 'night';

      timeTotal[period]++;
      if (['stressed', 'anxious', 'overwhelmed'].includes(mood.emotion)) {
        timePattern[period]++;
      }
    });

    let worstTime = null;
    let highestTimeStress = 0;
    Object.keys(timePattern).forEach(period => {
      if (timeTotal[period] >= 3) {
        const rate = timePattern[period] / timeTotal[period];
        if (rate > highestTimeStress) {
          highestTimeStress = rate;
          worstTime = period;
        }
      }
    });

    if (worstTime && highestTimeStress > 0.5) {
      triggers.push({
        type: 'temporal',
        pattern: 'Time of Day',
        trigger: worstTime,
        message: `Stress peaks during the ${worstTime} (${Math.round(highestTimeStress * 100)}% of logs)`,
        suggestion: `Schedule calming activities during ${worstTime} hours, like meditation or a short walk.`,
        severity: highestTimeStress > 0.7 ? 'high' : 'medium',
      });
    }

    // 3. Keyword Analysis from Notes
    const stressWords = {};
    moods.forEach(mood => {
      if (['stressed', 'anxious', 'overwhelmed'].includes(mood.emotion) && mood.note) {
        const words = mood.note.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 4) {
            stressWords[word] = (stressWords[word] || 0) + 1;
          }
        });
      }
    });

    const topKeywords = Object.entries(stressWords)
      .filter(([word, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topKeywords.length > 0) {
      triggers.push({
        type: 'contextual',
        pattern: 'Recurring Themes',
        trigger: topKeywords.map(([word]) => word).join(', '),
        message: `Common stress themes: ${topKeywords.map(([word]) => word).join(', ')}`,
        suggestion: 'Consider addressing these recurring situations with coping strategies or professional support.',
        severity: 'medium',
      });
    }

    // 4. Consecutive Bad Days
    let consecutiveBadDays = 0;
    let maxConsecutive = 0;
    moods.forEach(mood => {
      if (['stressed', 'anxious', 'sad', 'overwhelmed'].includes(mood.emotion)) {
        consecutiveBadDays++;
        if (consecutiveBadDays > maxConsecutive) {
          maxConsecutive = consecutiveBadDays;
        }
      } else {
        consecutiveBadDays = 0;
      }
    });

    if (maxConsecutive >= 3) {
      triggers.push({
        type: 'pattern',
        pattern: 'Prolonged Stress',
        trigger: `${maxConsecutive} consecutive difficult days`,
        message: `You experienced ${maxConsecutive} difficult days in a row recently`,
        suggestion: 'Consider reaching out to a mental health professional for additional support.',
        severity: maxConsecutive >= 5 ? 'high' : 'medium',
      });
    }

    // 5. Intensity Spikes
    const intensityChanges = [];
    for (let i = 1; i < moods.length; i++) {
      const change = Math.abs(moods[i].intensity - moods[i - 1].intensity);
      if (change >= 3) {
        intensityChanges.push({
          from: moods[i - 1].intensity,
          to: moods[i].intensity,
          date: moods[i].timestamp,
        });
      }
    }

    if (intensityChanges.length >= 3) {
      triggers.push({
        type: 'pattern',
        pattern: 'Mood Volatility',
        trigger: `${intensityChanges.length} significant mood swings`,
        message: `Your mood has fluctuated significantly ${intensityChanges.length} times`,
        suggestion: 'Try to identify what causes these sudden changes and develop coping strategies.',
        severity: 'medium',
      });
    }

    return {
      triggers,
      analyzed: moods.length,
      period: '30 days',
      summary: triggers.length > 0 
        ? `Found ${triggers.length} potential trigger(s)` 
        : 'No significant patterns detected. Keep logging to build more insights.',
    };
  } catch (error) {
    console.error(' Trigger analysis error:', error);
    throw error;
  }
}

module.exports = {
  identifyTriggers,
};