// utils/localStorageUtils.js

const FAVORITES_KEY = 'favoriteCities';

export const getFavorites = () => {
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
};

export const addFavorite = (city) => {
  const favorites = getFavorites();
  if (!favorites.includes(city)) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites, city]));
  }
};

export const removeFavorite = (city) => {
  const favorites = getFavorites();
  const updated = favorites.filter(c => c !== city);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
};
