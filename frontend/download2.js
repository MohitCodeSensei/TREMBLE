const fs = require('fs');
const path = require('path');

const albums = [
  { name: 'starboy.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png' },
  { name: 'currents.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png' },
  { name: 'planet_her.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/3/34/Doja_Cat_-_Planet_Her.png' },
  { name: 'scorpion.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/9/90/Scorpion_by_Drake.jpg' },
  { name: 'graduation.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg' },
  { name: 'astroworld.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/0/0b/Astroworld_by_Travis_Scott.jpg' },
  { name: 'damn.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Damn.png' },
  { name: 'igor.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/5/51/Igor_-_Tyler%2C_the_Creator.jpg' },
  { name: 'after_hours.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png' },
  { name: 'slow_rush.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/b/b7/Tame_Impala_-_The_Slow_Rush.png' },
  { name: 'hot_pink.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/9/9d/Doja_Cat_-_Hot_Pink.png' }
];

const dir = path.join(__dirname, 'public', 'images', 'albums');

async function downloadAll() {
  for (const album of albums) {
    try {
      const response = await fetch(album.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(path.join(dir, album.name), buffer);
      console.log(`Downloaded ${album.name}`);
    } catch (e) {
      console.error(`Failed ${album.name}: ${e.message}`);
    }
  }
}

downloadAll();
