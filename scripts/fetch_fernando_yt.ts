import { Innertube, UniversalCache } from 'youtubei.js';
import fs from 'fs';

async function main() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  const channel = await yt.resolveURL('https://www.youtube.com/@fernandogcortes');
  
  if (!channel || !channel.payload || !channel.payload.browseId) {
      console.log('Channel not found.');
      return;
  }
  const browseId = channel.payload.browseId;
  console.log('Channel Id:', browseId);

  const ch = await yt.getChannel(browseId);
  console.log('Tabs:', ch.current_tab?.title);
  
  const results = [];
  try {
      const videos = await ch.getVideos();
      console.log('Videos count:', videos.videos.length);
      for (const v of videos.videos) {
          results.push({
              title: v.title.text,
              description: v.description_snippet ? v.description_snippet.text : '',
              url: 'https://youtube.com/watch?v=' + v.id,
              id: v.id,
              type: 'V├¡deo'
          });
      }
  } catch(e) { console.log('No videos tab'); }

  try {
      const shorts = await ch.getShorts();
      console.log('Shorts count:', shorts.videos.length);
      for (const v of shorts.videos) {
          results.push({
              title: v.title?.text || v.title,
              url: 'https://youtube.com/watch?v=' + v.id,
              id: v.id,
              type: 'Curta'
          });
      }
  } catch(e) { console.log('No shorts tab'); }

  try {
      const playlists = await ch.getPlaylists();
      console.log('Playlists:', playlists.playlists.length);
      for (const p of playlists.playlists) {
          const contentId = p.content_id;
          const title = p.metadata?.title?.text || '';
          
          results.push({
              title: title,
              url: 'https://youtube.com/playlist?list=' + contentId,
              id: contentId,
              type: 'Playlist'
          });
      }
  } catch(e) { console.log('No playlists tab', e); }
  
  fs.writeFileSync('fernando-youtube-videos.json', JSON.stringify(results, null, 2));
  console.log('Wrote', results.length, 'videos to fernando-youtube-videos.json');
}
main().catch(console.error);
