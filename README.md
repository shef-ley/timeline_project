# Interactive History Timeline

A browser-based interactive timeline of world history — zoom, pan, log scale, branch lines, and drill-down into individual civilizations.

## Features

- **63 civilizations** across 7 regions, color-coded as horizontal bars
- **Zoom & pan** — scroll wheel zooms, click+drag pans
- **Log Scale toggle** — reveals 100,000 years of prehistory with an animated transition
- **Branch lines** — shows parent→child relationships (succession, influence, conquest, etc.)
- **Drill-down** — hover any bar and click **Explore →** to see a detailed event timeline for that civilization
- **Search & filter** by region or name

## Running locally

Open `index.html` directly in a browser. No server needed.

> **Note:** the "Explore →" drill-down uses `<script>` tag injection to load event files, so it works on `file://` without a local server.

## Adding events for a civilization

1. Find the civilization's slug: lowercase name, spaces/slashes → hyphens.  
   Example: `"United States"` → `united-states`, `"Roman Empire"` → `roman-empire`

2. Copy an existing events file:
   ```
   cp data/events/united-states.js data/events/my-civilization.js
   ```

3. Edit the new file — update `name`, `color`, `wiki`, and the `events` array.

4. The slug must match the civilization's name in `data/civilizations.js`.  
   The `civSlug()` function in `js/timeline.js` generates it automatically.

## File structure

```
index.html                  — app shell
css/style.css               — all styles
js/
  timeline.js               — world view: rendering, zoom/pan, log scale, branches
  drilldown.js              — drill-down view: per-civilization event timeline
data/
  civilizations.js          — CIVS array (63 entries)
  branches.js               — BRANCHES array (34 parent→child links)
  events/
    united-states.js        — US history events (35 events)
    roman-empire.js         — Roman Empire events (22 events)
    (add more here)
```

## Adding a new civilization

Add an entry to `data/civilizations.js`:
```js
{ name:"My Civilization", r:"Region", c:"#hexcolor", s:-500, e:200, w:"Wikipedia_Slug" }
```
- `s` / `e`: start/end year (negative = BCE)
- `r`: must be one of the 7 regions in `REGION_ORDER`
- `w`: Wikipedia article slug (the part after `en.wikipedia.org/wiki/`)

## Roadmap ideas

- [ ] More event files (Maya, Mongol Empire, Ancient Egypt, …)
- [ ] Animated zoom transition when entering drill-down
- [ ] Second-level drill-down (e.g., click a Civil War event → see battles)
- [ ] Import from Histoverse open data
- [ ] GitHub Pages deployment
