import { apiGet, apiPut, apiDelete, apiPost } from './apiService';

export const getSettings = async () => {
  try { return await apiGet(`/api/settings/me`); }
  catch { return null; }
};

export const updateNotifications = async (prefs) => {
  try { await apiPut(`/api/settings/me/notifications`, prefs); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
};

export const updateAppLock = async (prefs) => {
  try { await apiPut(`/api/settings/me/app-lock`, prefs); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
};

export const exportData = async () => {
  try { return await apiPost(`/api/settings/me/export-data`, {}); }
  catch (e) { return null; }
};

export const deleteAccount = async () => {
  try { await apiDelete(`/api/settings/me/account`); return { success: true }; }
  catch (e) { return { success: false, error: e.message }; }
};