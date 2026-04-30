import { apiPost, apiGet, apiDelete } from './apiService';

export const getOpener = async () => {
  try {
    // apiService already unwraps body.data, so res IS the data
    const data = await apiGet('/api/chat/opener');
    console.log('✅ Opener response:', data);
    
    return {
      greeting: data?.greeting || "hey. how's today landing?",
      chips: data?.chips || ['pretty good', 'kinda rough', 'just need to talk', 'not sure'],
    };
  } catch (e) {
    console.error('❌ Opener error:', e.message);
    return {
      greeting: "hey. how's today landing?",
      chips: ['pretty good', 'kinda rough', 'just need to talk', 'not sure'],
    };
  }
};

export const sendChatMessage = async (message) => {
  try {
    // apiService already unwraps body.data, so data IS the actual data
    const data = await apiPost('/api/chat/message', { message });
    console.log('✅ Chat response:', data);

    return {
      success: true,
      reply: data?.response || "I'm here with you.",
      suggestions: data?.followUpPrompts || ['talk more', 'stay with me', 'I need a moment'],
      emotion: data?.emotion || 'neutral',
      crisisFlag: !!data?.crisisFlag,
      crisisResources: data?.crisisResources || null,
    };
  } catch (e) {
    console.error('❌ Chat message error:', e);
    return { 
      success: false, 
      error: e.message,
      reply: "couldn't reach the server. check your connection?",
    };
  }
};

export const getChatHistory = async (max = 50) => {
  try {
    // apiService already unwraps body.data, so data IS the array
    const data = await apiGet(`/api/chat/history?limit=${max}`);
    console.log('✅ History response:', Array.isArray(data) ? `${data.length} messages` : data);

    if (!Array.isArray(data)) {
      console.warn('⚠️ History is not an array:', data);
      return [];
    }

    return data
      .slice()
      .reverse()
      .flatMap((c) => ([
        {
          id: `u-${c.id}`,
          role: 'user',
          text: c.userMessage || '',
        },
        {
          id: `a-${c.id}`,
          role: 'assistant',
          text: c.aiResponse || '',
        }
      ]));
  } catch (e) {
    console.error('❌ Chat history error:', e.message);
    return [];
  }
};

export const clearChatHistory = async () => {
  try {
    await apiDelete('/api/chat/clear');
    return { success: true };
  } catch (e) {
    console.error('❌ Clear history error:', e.message);
    return { success: false, error: e.message };
  }
};