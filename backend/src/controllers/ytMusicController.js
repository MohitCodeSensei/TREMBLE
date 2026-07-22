import YTMusic from "ytmusic-api";

const ytmusic = new YTMusic();
let isInitialized = false;

const initApi = async () => {
  if (!isInitialized) {
    await ytmusic.initialize();
    isInitialized = true;
    console.log('✅ YouTube Music API initialized');
  }
};

export const search = async (req, res) => {
  try {
    await initApi();
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query parameter q is required' });
    }
    
    // We can search for songs, videos, artists, albums. Let's just use general search.
    const results = await ytmusic.search(q);
    res.json(results);
  } catch (error) {
    console.error('YTMusic Search Error:', error);
    res.status(500).json({ message: 'Error searching YouTube Music' });
  }
};

export const getSongDetails = async (req, res) => {
  try {
    await initApi();
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' });
    }
    
    // getSong fetches details like lyrics (if available), full artist info, etc.
    const details = await ytmusic.getSong(videoId);
    res.json(details);
  } catch (error) {
    console.error('YTMusic Get Song Error:', error);
    res.status(500).json({ message: 'Error fetching song details' });
  }
};
