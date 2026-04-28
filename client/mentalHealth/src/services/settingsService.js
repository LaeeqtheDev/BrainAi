import { apiGet, apiPut, apiPost, apiDelete } from './apiService';

// Public
export const getPrivacyPolicy = async () => {
  try { return await apiGet('/api/settings/privacy-policy/content'); }
  catch { return null; }
};
export const getHelpSupport = async () => {
  try { return await apiGet('/api/settings/help-support/info'); }
  catch { return null; }
};

// Auth
export const getMe = async () => {
  try { return await apiGet('/api/settings/me'); }
  catch { return null; }
};

export const updateProfile = async ({ name, bio, profilePicture }) => {
  try {
    await apiPut('/api/settings/me/profile', { name, bio, profilePicture });
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
};

export const updateNotifications = async (prefs) => {
  try { await apiPut('/api/settings/me/notifications', prefs); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
};

export const updateSecurity = async (prefs) => {
  try { await apiPut('/api/settings/me/security', prefs); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
};

export const updatePrivacy = async (prefs) => {
  try { await apiPut('/api/settings/me/privacy', prefs); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
};

export const updateLanguage = async (language) => {
  try { await apiPut('/api/settings/me/language', { language }); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
};

export const exportData = async () => {
  try { return await apiPost('/api/settings/me/export-data', {}); }
  catch { return null; }
};

export const deleteAccount = async () => {
  try { await apiDelete('/api/settings/me/account'); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
};