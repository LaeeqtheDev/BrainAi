import { apiPost, apiGet, apiDelete, apiPut } from './apiService';

export const addJournalEntry = async ({ title, body, emotionTag = null }) => {
  try {
    const data = await apiPost('/api/journal/create', {
      title: (title || 'Untitled').trim(),
      content: (body || '').trim(),
      emotionTag,
    });
    return { success: true, id: data.journalId };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const getJournalEntries = async () => {
  try {
    const data = await apiGet('/api/journal/list');
    return (data || []).map((j) => ({
      id: j.id,
      title: j.title || 'Untitled',
      body: j.content || '',
      emotionTag: j.emotionTag,
      createdAtIso: j.createdAt,
    }));
  } catch (e) {
    return [];
  }
};

export const deleteJournalEntry = async (id) => {
  try { await apiDelete(`/api/journal/${id}`); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
};

export const updateJournalEntry = async (id, { title, body, emotionTag }) => {
  try {
    await apiPut(`/api/journal/${id}`, { title, content: body, emotionTag });
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
};

export const getJournalPrompts = async (emotion = 'neutral') => {
  try {
    const data = await apiGet(`/api/journal/prompts/${emotion}`);
    return data.prompts || [];
  } catch { return []; }
};