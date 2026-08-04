export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof process !== 'undefined' && process.env?.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
  "http://localhost:5000";

export const getLyrics = async (videoId, title = '', artist = '') => {
  try {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (artist) params.set('artist', artist);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_URL}/lyrics/${videoId}${qs}`);
    if (!res.ok) return { lyrics: "[00:00.00] Lyrics not available" };
    return await res.json();
  } catch (e) {
    console.warn("getLyrics connection error:", e.message);
    return { lyrics: "[00:00.00] Lyrics not available" };
  }
};

export const getTrending = async (country = "ZZ") => {
  try {
    const res = await fetch(`${API_URL}/trending?country=${country}`);
    if (!res.ok) return { videos: { items: [] } };
    return await res.json();
  } catch (e) {
    console.warn("getTrending connection error:", e.message);
    return { videos: { items: [] } };
  }
};

export const getGenres = async () => {
  try {
    const res = await fetch(`${API_URL}/genres`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn("getGenres connection error:", e.message);
    return [];
  }
};

export const getGenrePlaylists = async (params) => {
  try {
    const res = await fetch(`${API_URL}/genre-playlists?params=${params}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn("getGenrePlaylists connection error:", e.message);
    return [];
  }
};

export const getAlbum = async (id) => {
  try {
    const res = await fetch(`${API_URL}/album/${id}`);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    console.warn("getAlbum connection error:", e.message);
    return {};
  }
};

export const getArtist = async (id) => {
  try {
    const res = await fetch(`${API_URL}/artist/${id}`);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    console.warn("getArtist connection error:", e.message);
    return {};
  }
};

export const getPlaylist = async (id) => {
  try {
    const res = await fetch(`${API_URL}/playlist/${id}`);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    console.warn("getPlaylist connection error:", e.message);
    return {};
  }
};

export const getSuggestions = async (q) => {
  try {
    const res = await fetch(`${API_URL}/suggestions?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn("getSuggestions connection error:", e.message);
    return [];
  }
};

export const getStreamUrl = async (videoId) => {
  try {
    const res = await fetch(`${API_URL}/stream/${videoId}`);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    console.warn("getStreamUrl connection error:", e.message);
    return {};
  }
};

export const getGenreSongs = async (title) => {
  try {
    const res = await fetch(`${API_URL}/genre-songs?title=${encodeURIComponent(title)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn("getGenreSongs connection error:", e.message);
    return [];
  }
};
export const getCountryTopSongs = async (country) => {
  try {
    const res = await fetch(`${API_URL}/country-top?country=${encodeURIComponent(country)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn("getCountryTopSongs connection error:", e.message);
    return [];
  }
};

export const getShortHash = (identifier) => {
  if (!identifier) return '0000';
  let hash = 5381;
  const str = String(identifier);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & 0xFFFFFFFF;
  }
  return Math.abs(hash).toString(16).padStart(4, '0').slice(-4);
};

export const getTremblerUrl = (nameOrId) => {
  if (!nameOrId) return '/';
  const clean = String(nameOrId).trim().toLowerCase().replace(/\s+/g, '+');
  return `/trembler/${clean}`;
};

export const getAlbumUrl = (albumOrId, albumTitle) => {
  if (!albumOrId) return '/';
  const id = typeof albumOrId === 'object' ? (albumOrId.id || albumOrId.browseId || albumOrId.youtube_id || '') : albumOrId;
  const title = typeof albumOrId === 'object' ? (albumOrId.title || albumOrId.name || '') : (albumTitle || '');
  
  const cleanTitle = String(title || 'album')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'album';
    
  const hash = getShortHash(id || cleanTitle);
  return `/album/${cleanTitle}-${hash}`;
};

export const getTremlistUrl = (plOrId, plTitle) => {
  if (!plOrId) return '/';
  const id = typeof plOrId === 'object' ? (plOrId.id || plOrId.playlist_id || plOrId.youtube_id || '') : plOrId;
  const title = typeof plOrId === 'object' ? (plOrId.title || plOrId.name || '') : (plTitle || '');
  
  const cleanTitle = String(title || 'tremlist')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'tremlist';
    
  const hash = getShortHash(id || cleanTitle);
  return `/playlist/${cleanTitle}-${hash}`;
};

export const getUnifiedSearch = async (query) => {
  if (!query || !query.trim()) return { intent: 'song', top_result: null, secondary_featured: null, trembler: null, album: null, songs: [], artists: [], albums: [], playlists: [] };
  try {
    const res = await fetch(`${API_URL}/api/unified-search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return { intent: 'song', top_result: null, secondary_featured: null, trembler: null, album: null, songs: [], artists: [], albums: [], playlists: [] };
    return await res.json();
  } catch (e) {
    console.warn("getUnifiedSearch error:", e.message);
    return { intent: 'song', top_result: null, secondary_featured: null, trembler: null, album: null, songs: [], artists: [], albums: [], playlists: [] };
  }
};

export const getSearchResults = async (query, filter = 'all') => {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&filter=${filter}`);
    if (!res.ok) return filter === 'all' ? { intent: 'song', songs: [] } : [];
    return await res.json();
  } catch (e) {
    console.warn("getSearchResults error:", e.message);
    return filter === 'all' ? { intent: 'song', songs: [] } : [];
  }
};


