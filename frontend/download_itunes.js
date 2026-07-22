const fs = require('fs');
const path = require('path');

const albums = [
  { name: 'starboy.jpg', query: 'The Weeknd Starboy' },
  { name: 'currents.jpg', query: 'Tame Impala Currents' },
  { name: 'planet_her.jpg', query: 'Doja Cat Planet Her' },
  { name: 'scorpion.jpg', query: 'Drake Scorpion' },
  { name: 'graduation.jpg', query: 'Kanye West Graduation' },
  { name: 'astroworld.jpg', query: 'Travis Scott Astroworld' },
  { name: 'damn.jpg', query: 'Kendrick Lamar DAMN' },
  { name: 'igor.jpg', query: 'Tyler The Creator IGOR' },
  { name: 'after_hours.jpg', query: 'The Weeknd After Hours' },
  { name: 'slow_rush.jpg', query: 'Tame Impala The Slow Rush' },
  { name: 'hot_pink.jpg', query: 'Doja Cat Hot Pink' }
];

const dir = path.join(__dirname, 'public', 'images', 'albums');

async function searchAndDownload(album) {
  try {
    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(album.query)}&entity=album&limit=1`;
    const res = await fetch(searchUrl);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      // Get highest res image by replacing 100x100bb with 600x600bb
      const imgUrl = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
      const imgRes = await fetch(imgUrl);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(path.join(dir, album.name), buffer);
      console.log(`Successfully downloaded ${album.name}`);
    } else {
      console.log(`No results for ${album.query}`);
    }
  } catch (e) {
    console.error(`Error on ${album.name}: ${e.message}`);
  }
}

async function run() {
  for (const album of albums) {
    await searchAndDownload(album);
    // 500ms delay to prevent rate limits
    await new Promise(r => setTimeout(r, 500));
  }
}

run();
