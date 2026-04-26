import { apiGet } from './apiService';

export const getHotlines = async () => {
  try { return await apiGet('/api/crisis/hotlines'); }
  catch { return null; }
};

export const getCrisisResources = async () => {
  try { return await apiGet('/api/crisis/resources'); }
  catch { return null; }
};