'use strict';
// ── Drill-down view ───────────────────────────────────────────────
// Activated when user clicks "Explore →" on a civilization.
// Loads data/events/<slug>.js, then draws an event timeline.

let ddCiv   = null;   // the civilization object being explored
let ddData  = null;   // { name, color, events: [{year, title, wiki}] }
let ddHover = null;   // currently hovered event

const DD_MID_Y = () => TOP_M + tH * 0.5;  // vertical center of event line

// ── Entry point (called from tooltip "Explore →" button) ──────────
window.enterDrilldown = function(slug) {
  hideTip();
  // Find the civ object matching this slug
  ddCiv = CIVS.find(c => civSlug(c.name) === slug) || null;
  if (!ddData || civSlug(ddData.name || '') !== slug) {
    loadEventsFile(slug);
  } else {
    activateDrilldown();
  }
};

function loadEventsFile(slug) {
  // Remove any previously loaded EVENTS to avoid stale data
  delete window.EVENTS;
  const s = document.createElement('script');
  s.src = `data/events/${slug}.js`;
  s.onload = () => {
    if (window.EVENTS) {
      ddData = window.EVENTS;
      delete window.EVENTS;
      activateDrilldown();
    } else {
      showNoDataFallback();
    }
  };
  s.onerror = showNoDataFallback;
  document.head.appendChild(s);
}

function showNoDataFallback() {
  // No events file yet — show the civ on its own with a message
  ddData = {
    name: ddCiv ? ddCiv.name : 'Unknown',
    color: ddCiv ? ddCiv.c : '#888',
    wiki:  ddCiv ? ddCiv.w : '',
    events: []
  };
  activateDrilldown();
}

function activateDrilldown() {
  window.currentView = 'drilldown';

  // Set the view to span the civilization's lifetime + 10% padding
  if (ddCiv) {
    const pad  = (ddCiv.e - ddCiv.s) * 0.08;
    linLeft    = ddCiv.s - pad;
    linRight   = ddCiv.e + pad;
  }

  // Switch UI
  buildDrilldownPanel();
  window.showDrilldownPanel();
  showDrilldownControls();
  draw();
}

// ── Exit drill-down ───────────────────────────────────────────────
window.exitDrilldown = function() {
  window.currentView = 'world';
  ddCiv = ddData = ddHover = null;
  // Restore linear view to sensible range
  linLeft = -5000; linRight = 2025;
  showWorldControls();
  window.showWorldPanel();
  draw();
};

// ── Controls UI swap ──────────────────────────────────────────────
function showDrilldownControls() {
  const ctl = document.getElementById('ctl');
  ctl.innerHTML = `
    <button class="cbtn back" onclick="window.exitDrilldown()">← World</button>
  `;
}
function showWorldControls() {
  const ctl = document.getElementById('ctl');
  ctl.innerHTML = `
    <button id="modeBtn" class="cbtn ${isLogMode ? 'on' : ''}">${isLogMode ? 'Linear Scale' : 'Log Scale'}</button>
    <button id="branchBtn" class="cbtn ${showBranches ? 'on' : ''}">${showBranches ? 'Branches: On' : 'Branches'}</button>
  `;
  // Re-attach handlers
  document.getElementById('modeBtn').onclick = document.getElementById('modeBtn').onclick ||
    (() => {
      if (modeSwitching) return;
      if (!isLogMode) {
        savedLin = { linLeft, linRight };
        startAnim({ transT:1, logL:LOG_MAX, logR:0 }, 900, () => {
          isLogMode = true;
          document.getElementById('modeBtn').classList.add('on');
          document.getElementById('modeBtn').textContent = 'Linear Scale';
        });
      } else {
        if (savedLin) { linLeft = savedLin.linLeft; linRight = savedLin.linRight; }
        startAnim({ transT:0 }, 700, () => {
          isLogMode = false;
          document.getElementById('modeBtn').classList.remove('on');
          document.getElementById('modeBtn').textContent = 'Log Scale';
        });
      }
    });
  const mb = document.getElementById('modeBtn');
  mb.onclick = () => {
    if (modeSwitching) return;
    if (!isLogMode) {
      savedLin = { linLeft, linRight };
      startAnim({ transT:1, logL:LOG_MAX, logR:0 }, 900, () => {
        isLogMode = true; mb.classList.add('on'); mb.textContent = 'Linear Scale';
      });
    } else {
      if (savedLin) { linLeft = savedLin.linLeft; linRight = savedLin.linRight; }
      startAnim({ transT:0 }, 700, () => {
        isLogMode = false; mb.classList.remove('on'); mb.textContent = 'Log Scale';
      });
    }
  };
  const bb = document.getElementById('branchBtn');
  bb.onclick = () => {
    showBranches = !showBranches;
    bb.classList.toggle('on', showBranches);
    bb.textContent = showBranches ? 'Branches: On' : 'Branches';
    document.getElementById('blegend').style.display = showBranches ? 'flex' : 'none';
    draw();
  };
}

// ── Side panel for drill-down ─────────────────────────────────────
function buildDrilldownPanel() {
  let dd = document.getElementById('panel-drilldown');
  if (!dd) {
    dd = document.createElement('div');
    dd.id = 'panel-drilldown';
    dd.style.cssText = 'display:flex;flex-direction:column;gap:8px;flex:1;min-height:0;';
    document.getElementById('panel').appendChild(dd);
  }
  const noEvents = !ddData.events || ddData.events.length === 0;
  dd.innerHTML = `
    <div id="dd-header">
      <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1.5px;">Civilization</div>
      <div class="dd-civ-name" style="border-left:3px solid ${ddData.color};padding-left:8px;margin-top:4px;">
        ${ddData.name}
      </div>
      ${ddCiv ? `<div class="dd-dates">${fmtYear(ddCiv.s)} – ${fmtYear(ddCiv.e)}</div>` : ''}
      ${ddData.wiki ? `<a href="https://en.wikipedia.org/wiki/${ddData.wiki}" target="_blank" style="font-size:11px;color:#4af;">Wikipedia ↗</a>` : ''}
    </div>
    ${noEvents
      ? `<p style="color:#555;font-size:12px;padding:8px 0;">No detailed events yet.<br>Add them in <code>data/events/${ddCiv ? civSlug(ddCiv.name) : 'slug'}.js</code></p>`
      : `<div style="font-size:11px;color:#555;">${ddData.events.length} events</div>
         <div id="eventlist"></div>`
    }
  `;
  if (!noEvents) {
    const list = document.getElementById('eventlist');
    ddData.events.forEach(evt => {
      const row = document.createElement('div');
      row.className = 'erow';
      const yr = document.createElement('span'); yr.className = 'eyear'; yr.textContent = fmtYear(evt.year);
      const title = document.createElement('span'); title.className = 'etitle'; title.textContent = evt.title;
      const wl = document.createElement('a'); wl.className = 'wbtn';
      wl.href = 'https://en.wikipedia.org/wiki/' + evt.wiki;
      wl.target = '_blank'; wl.textContent = '↗'; wl.onclick = e => e.stopPropagation();
      row.appendChild(yr); row.appendChild(title); row.appendChild(wl);
      row.onclick = () => {
        // Zoom to event
        const pad = (linRight - linLeft) * 0.3;
        startAnim({ linLeft: evt.year - pad, linRight: evt.year + pad }, 400, null);
      };
      list.appendChild(row);
    });
  }
}

// ── Drilldown canvas rendering ────────────────────────────────────
function drawDrilldown() {
  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(0, 0, LEFT_M, H);

  drawDDAxis();
  drawDDBackground();
  drawDDEvents();
  drawDDMinimap();
  drawDDTitle();
}

function drawDDAxis() {
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(LEFT_M, 0, tW, TOP_M);
  ctx.strokeStyle = '#1e1e38'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(LEFT_M, TOP_M-0.5); ctx.lineTo(LEFT_M+tW, TOP_M-0.5); ctx.stroke();
  // Tick marks & labels using linear scale
  const iv = tickIntervalLin(), start = Math.ceil(xToYearLin(LEFT_M) / iv) * iv;
  ctx.font = '11px system-ui'; ctx.textAlign = 'center';
  for (let yr = start; yearToXLin(yr) <= LEFT_M + tW; yr += iv) {
    const x = Math.round(yearToXLin(yr));
    ctx.fillStyle = '#556'; ctx.fillText(fmtYear(yr), x, TOP_M - 6);
    ctx.strokeStyle = '#282840'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, TOP_M-3); ctx.lineTo(x, TOP_M); ctx.stroke();
  }
}

function drawDDBackground() {
  if (!ddCiv) return;
  const midY = DD_MID_Y();
  // Faint civilization span bar
  const x1 = yearToXLin(ddCiv.s), x2 = yearToXLin(ddCiv.e);
  ctx.fillStyle = ddCiv.c + '20';
  ctx.fillRect(Math.max(LEFT_M, x1), TOP_M, Math.min(x2, LEFT_M+tW) - Math.max(LEFT_M, x1), tH);
  // Center axis line
  ctx.strokeStyle = ddCiv.c + '40'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(LEFT_M, midY); ctx.lineTo(LEFT_M+tW, midY); ctx.stroke();
  // Grid lines
  const iv = tickIntervalLin(), start = Math.ceil(xToYearLin(LEFT_M) / iv) * iv;
  ctx.strokeStyle = '#181830'; ctx.lineWidth = 1;
  for (let yr = start; yearToXLin(yr) <= LEFT_M + tW; yr += iv) {
    const x = Math.round(yearToXLin(yr)) + 0.5;
    ctx.beginPath(); ctx.moveTo(x, TOP_M); ctx.lineTo(x, TOP_M+tH); ctx.stroke();
  }
}

function drawDDEvents() {
  if (!ddData || !ddData.events.length) {
    // No events — show placeholder text
    ctx.fillStyle = '#333'; ctx.font = '14px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('No events data yet. Add events in data/events/', LEFT_M + tW/2, H/2);
    ctx.font = '12px system-ui'; ctx.fillStyle = '#444';
    ctx.fillText(`${civSlug(ddData.name)}.js`, LEFT_M + tW/2, H/2 + 22);
    return;
  }
  const midY  = DD_MID_Y();
  const ABOVE = tH * 0.28;   // how far above center for "above" labels
  const BELOW = tH * 0.28;   // how far below center for "below" labels
  const TICK  = 10;

  ddData.events.forEach((evt, i) => {
    const x = yearToXLin(evt.year);
    if (x < LEFT_M || x > LEFT_M + tW) return;

    const above  = i % 2 === 0;
    const labelY = above ? midY - ABOVE : midY + BELOW;
    const tickY1 = above ? midY - TICK  : midY;
    const tickY2 = above ? midY         : midY + TICK;
    const isHov  = evt === ddHover;
    const col    = isHov ? '#fff' : (ddCiv ? ddCiv.c : '#aaa');

    // Vertical tick line from center to label
    ctx.strokeStyle = col + (isHov ? 'ff' : '88'); ctx.lineWidth = isHov ? 1.5 : 1;
    ctx.beginPath(); ctx.moveTo(x, tickY1); ctx.lineTo(x, labelY); ctx.stroke();

    // Tick mark on axis
    ctx.strokeStyle = col + 'cc'; ctx.lineWidth = isHov ? 2 : 1.5;
    ctx.beginPath(); ctx.moveTo(x, tickY1); ctx.lineTo(x, tickY2); ctx.stroke();

    // Dot at axis
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, midY, isHov ? 4 : 2.5, 0, Math.PI*2); ctx.fill();

    // Year label
    ctx.fillStyle = col + (isHov ? 'ff' : 'aa');
    ctx.font = `${isHov ? 'bold ' : ''}10px system-ui`; ctx.textAlign = 'center';
    ctx.fillText(fmtYear(evt.year), x, above ? labelY - 16 : labelY + 24);

    // Event title (wrapping if needed)
    ctx.fillStyle = isHov ? '#fff' : '#ccc';
    ctx.font = `${isHov ? 'bold ' : ''}11px system-ui`;
    const maxW = 110;
    const words = evt.title.split(' ');
    let line = '', lineY = above ? labelY - 4 : labelY + 38;
    const lineH = 14, dir = above ? -1 : 1;
    words.forEach((word, wi) => {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, lineY);
        line = word; lineY += dir * lineH;
      } else { line = test; }
    });
    if (line) ctx.fillText(line, x, lineY);
  });
}

function drawDDMinimap() {
  if (!ddCiv) return;
  const mx = LEFT_M, my = H - BOT_M + 8, mw = tW, mh = BOT_M - 14;
  const span = ddCiv.e - ddCiv.s;
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(mx, H - BOT_M, mw, BOT_M);
  ctx.strokeStyle = '#1a1a32'; ctx.lineWidth = 1; ctx.strokeRect(mx, my, mw, mh);
  // Civ background bar in minimap
  ctx.fillStyle = ddCiv.c + '30';
  ctx.fillRect(mx, my+1, mw, mh-2);
  // Events as ticks in minimap
  if (ddData && ddData.events) {
    ddData.events.forEach(evt => {
      const ex = mx + ((evt.year - ddCiv.s) / span) * mw;
      ctx.fillStyle = ddCiv.c + 'cc';
      ctx.fillRect(ex - 0.5, my + 2, 1, mh - 4);
    });
  }
  // View window
  const wx = mx + ((linLeft  - ddCiv.s) / span) * mw;
  const ww = Math.max(2, ((linRight - linLeft) / span) * mw);
  ctx.fillStyle = 'rgba(100,160,255,0.12)'; ctx.strokeStyle = 'rgba(100,160,255,0.45)';
  ctx.fillRect(wx, my, ww, mh); ctx.strokeRect(wx, my, ww, mh);
}

function drawDDTitle() {
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(0, 0, LEFT_M, TOP_M);
  ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left';
  ctx.fillStyle = ddCiv ? ddCiv.c : '#888';
  const name = ddData ? ddData.name : '';
  // Truncate if too long
  const max = 16;
  ctx.fillText(name.length > max ? name.slice(0, max)+'…' : name, 6, 20);
  ctx.font = '10px system-ui'; ctx.fillStyle = '#444';
  ctx.fillText('DETAIL VIEW', 6, 34);
}

// ── Drilldown interactions ────────────────────────────────────────
let ddDragging = false, ddDragX0 = 0, ddDragLL0 = 0, ddDragLR0 = 0;

canvas.addEventListener('mousedown', e => {
  if (window.currentView !== 'drilldown') return;
  ddDragging = true; ddDragX0 = e.clientX; ddDragLL0 = linLeft; ddDragLR0 = linRight;
  canvas.classList.add('grabbing');
});
window.addEventListener('mousemove', e => {
  if (window.currentView !== 'drilldown') return;
  if (ddDragging) {
    const dYr = -(e.clientX - ddDragX0) / tW * (linRight - linLeft);
    linLeft  = ddDragLL0 + dYr; linRight = ddDragLR0 + dYr;
    draw(); return;
  }
  // Hover detection for events
  if (!ddData || !ddData.events) return;
  const midY = DD_MID_Y();
  let found = null;
  ddData.events.forEach(evt => {
    const x = yearToXLin(evt.year);
    if (Math.abs(e.clientX - x) < 12 && Math.abs(e.clientY - midY) < tH * 0.35) found = evt;
  });
  if (found !== ddHover) {
    ddHover = found;
    canvas.style.cursor = found ? 'pointer' : 'grab';
    if (found) {
      tip.innerHTML = `<b>${found.title}</b><span>${fmtYear(found.year)}</span>
        <div class="tip-actions"><a href="https://en.wikipedia.org/wiki/${found.wiki}" target="_blank">Wikipedia ↗</a></div>`;
      tip.style.display = 'block';
      tip.style.left = Math.min(e.clientX+14, window.innerWidth-240)+'px';
      tip.style.top  = (e.clientY-8)+'px';
    } else { hideTip(); }
    draw();
  }
});
window.addEventListener('mouseup', () => { if(ddDragging){ ddDragging=false; canvas.classList.remove('grabbing'); } });

canvas.addEventListener('click', e => {
  if (window.currentView !== 'drilldown' || Math.abs(e.clientX - ddDragX0) > 4) return;
  if (ddHover) window.open('https://en.wikipedia.org/wiki/' + ddHover.wiki, '_blank');
  // Minimap click
  if (!ddCiv) return;
  const my = H - BOT_M + 8, mh = BOT_M - 14;
  if (e.clientY >= my && e.clientY <= my+mh && e.clientX >= LEFT_M && e.clientX <= LEFT_M+tW) {
    const yr  = ddCiv.s + ((e.clientX - LEFT_M) / tW) * (ddCiv.e - ddCiv.s);
    const span = linRight - linLeft;
    linLeft = yr - span/2; linRight = yr + span/2; draw();
  }
});

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  if (window.currentView !== 'drilldown') return;
  const factor = e.deltaY < 0 ? 0.87 : 1/0.87;
  const pivYr = xToYearLin(e.clientX), span = (linRight - linLeft) * factor;
  const frac  = (e.clientX - LEFT_M) / tW;
  linLeft = pivYr - frac * span; linRight = pivYr + (1-frac) * span;
  draw();
}, { passive: false });
