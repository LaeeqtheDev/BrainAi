import { apiPost, apiGet, apiDelete } from './apiService';

export const sendChatMessage = async (message) => {
  try {
    const res = await apiPost('/api/chat/message', { message });

    const data = res?.data || res;

    return {
      success: true,
      reply: data?.response || "I'm here with you.",
      suggestions: data?.followUpPrompts || ['Talk', 'Stay', 'Breathe'],
      emotion: data?.emotion || 'neutral',
      crisisFlag: !!data?.crisisFlag,
      crisisResources: data?.crisisResources || null,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const getChatHistory = async (max = 50) => {
  try {
    const res = await apiGet(`/api/chat/history?limit=${max}`);

    // IMPORTANT FIX: backend returns { data: [] }
    const data = res?.data?.data || res?.data || [];

    if (!Array.isArray(data)) return [];

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
    console.log('chat history error:', e.message);
    return [];
  }
};

export const clearChatHistory = async () => {
  try {
    await apiDelete('/api/chat/clear');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};