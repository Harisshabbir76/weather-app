// utils/localStorageUtils.js
import API from './api';

export const addFavorite = async (city) => {
  try {
    await API.post('/favorites', { city });
  } catch (err) {
    console.error('Error adding favorite:', err);
  }
};

export const getFavorites = async () => {
  try {
    const res = await API.get('/favorites');
    return res.data; // Should be array of cities
  } catch (err) {
    console.error('Error fetching favorites:', err);
    return [];
  }
};

export const removeFavorite = async (city) => {
  try {
    await API.delete(`/favorites/${encodeURIComponent(city)}`);
  } catch (err) {
    console.error('Error removing favorite:', err);
  }
};
