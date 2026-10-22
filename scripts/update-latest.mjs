// Writes latest.json from YouTube's public RSS feed (Shorts skipped):
//   videos: the newest full-length episodes (the hero player uses the first one)
//   shows:  the newest episode of each show in SHOWS, for the "Recent shows" cards
// Run by .github/workflows/latest.yml every hour. No API key needed.
import fs from "node:fs";

const CHANNEL = "UCzjdJt8Z0W657e_afeyxAxQ"; // youtube.com/@theadsn
const OUT = new URL("../latest.json", import.meta.url);

// Matched against the episode title. A show keeps its last known episode if it isn't in the feed (the feed only has the latest 15 uploads).
const SHOWS = { rundown: /rundown/i, ladies: /ladies who launch/i, thirty: /30 minutes/i };

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
const all = [];
for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
  const link = (entry.match(/<link rel="alternate" href="([^"]+)"/) || [])[1] || "";
  const id = (link.match(/[?&]v=([\w-]{11})/) || [])[1];
  if (!id) continue; // Shorts link to /shorts/<id>
  all.push({
    id,
    title: decode((entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ""),
    published: (entry.match(/<published>([^<]+)<\/published>/) || [])[1] || null,
  });
}
const videos = all.slice(0, 4);
// An empty list would blank the page, so keep the last good file instead.
if (!videos.length) { console.log("No full-length episodes in the feed. Keeping the current list."); process.exit(0); }
let prev = {};
try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")).shows || {}; } catch {}
const shows = {};
for (const [key, re] of Object.entries(SHOWS)) {
  const found = all.find(v => re.test(v.title)); // the feed is newest first
  const old = prev[key];
  shows[key] = found && (!old || !old.published || found.published >= old.published) ? found : old || null;
}
fs.writeFileSync(OUT, JSON.stringify({ videos, shows }, null, 2) + "\n");
console.log("Wrote", videos.length, "episodes. Newest:", videos[0].title);
for (const [k, v] of Object.entries(shows)) console.log("  " + k + ":", v ? v.title : "(none yet)");
