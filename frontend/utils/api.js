export const API_URL = "http://localhost:8000";

export const getLyrics = async (videoId) => {
  const res = await fetch(`${API_URL}/lyrics/${videoId}`);
  if (!res.ok) throw new Error('Failed to fetch lyrics');
  return res.json();
};

export const getTrending = async (country = "ZZ") => {
  const res = await fetch(`${API_URL}/trending?country=${country}`);
  if (!res.ok) throw new Error('Failed to fetch trending');
  return res.json();
};

export const getGenres = async () => {
  const res = await fetch(`${API_URL}/genres`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
};

export const getGenrePlaylists = async (params) => {
  const res = await fetch(`${API_URL}/genre-playlists?params=${params}`);
  if (!res.ok) throw new Error('Failed to fetch genre playlists');
  return res.json();
};

export const getAlbum = async (id) => {
  const res = await fetch(`${API_URL}/album/${id}`);
  if (!res.ok) throw new Error('Failed to fetch album');
  return res.json();
};

export const getArtist = async (id) => {
  const res = await fetch(`${API_URL}/artist/${id}`);
  if (!res.ok) throw new Error('Failed to fetch artist');
  return res.json();
};

export const getPlaylist = async (id) => {
  const res = await fetch(`${API_URL}/playlist/${id}`);
  if (!res.ok) throw new Error('Failed to fetch playlist');
  return res.json();
};

export const getSuggestions = async (q) => {
  const res = await fetch(`${API_URL}/suggestions?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to fetch suggestions');
  return res.json();
};

export const getStreamUrl = async (videoId) => {
  const res = await fetch(`${API_URL}/stream/${videoId}`);
  if (!res.ok) throw new Error('Failed to fetch stream url');
  return res.json();
};
