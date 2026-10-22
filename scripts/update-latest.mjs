// Writes latest.json: the newest full-length ADSN episodes from YouTube's public RSS feed (Shorts skipped).
// Run by .github/workflows/latest.yml every hour. No API key needed.
import fs from "node:fs";

const CHANNEL = "UCzjdJt8Z0W657e_afeyxAxQ"; // youtube.com/@theadsn
const OUT = new URL("../latest.json", import.meta.url);

const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// The feed often answers 404 for a moment, so try up to 12 times.
let xml = null, last = "";
for (let i = 0; i < 12 && xml === null; i++) {
  if (i) await new Promise(res => setTimeout(res, 4000));
  try {
    const r = await fetch("https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL, { signal: AbortSignal.timeout(15000) });
    if (r.ok) xml = await r.text(); else last = "status " + r.status;
  } catch (e) { last = e.message; }
}
// Keep the last good file and try again next hour, rather than failing the run (which emails an error).
if (xml === null) { console.log("YouTube feed unavailable (" + last + "). Keeping the current list."); process.exit(0); }
const videos = [];
for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
  const link = (entry.match(/<link rel="alternate" href="([^"]+)"/) || [])[1] || "";
  const id = (link.match(/[?&]v=([\w-]{11})/) || [])[1];
  if (!id) continue; // Shorts link to /shorts/<id>
  videos.push({
    id,
    title: decode((entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ""),
    published: (entry.match(/<published>([^<]+)<\/published>/) || [])[1] || null,
  });
  if (videos.length === 4) break;
}
// An empty list would blank the page, so keep the last good file instead.
if (!videos.length) { console.log("No full-length episodes in the feed. Keeping the current list."); process.exit(0); }
fs.writeFileSync(OUT, JSON.stringify({ videos }, null, 2) + "\n");
console.log("Wrote", videos.length, "episodes. Newest:", videos[0].title);
