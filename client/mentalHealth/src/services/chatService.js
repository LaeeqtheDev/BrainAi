import { apiPost, apiGet, apiDelete } from './apiService';

export const sendChatMessage = async (message) => {
  try {
    const data = await apiPost('/api/chat/message', { message });
    return {
      success: true,
      reply: data.response,
      suggestions: data.followUpPrompts || ['Tell me more', 'I need calm', 'Just listen'],
      emotion: data.emotion,
      suggestion: data.suggestion,
      crisisFlag: !!data.crisisFlag,
      crisisResources: data.crisisResources || null,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const getChatHistory = async (max = 50) => {
  try {
    const data = await apiGet(`/api/chat/history?limit=${max}`);
    // Backend returns desc; flatten to chronological array of bubbles
    const out = [];
    (data || []).slice().reverse().forEach((c) => {
      out.push({ id: `u-${c.id}`, role: 'user',      text: c.userMessage });
      out.push({ id: `a-${c.id}`, role: 'assistant', text: c.aiResponse });
    });
    return out;
  } catch { return []; }
};

export const clearChatHistory = async () => {
  try { await apiDelete('/api/chat/clear'); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
};