'use strict';
// ── Shared constants ──────────────────────────────────────────────
const PANEL_W  = 260;
const LEFT_M   = 135;
const TOP_M    = 42;
const BOT_M    = 56;
const RGN_LBL  = 18;
const BAR_GAP  = 2;
const HARD_MIN = -110000;
const HARD_MAX = 2100;

const REGION_ORDER  = ["Africa","Europe","Middle East","South Asia","East Asia","Americas","Oceania"];
const REGION_COLORS = {
  "Africa":"#c8a060","Europe":"#7088c8","Middle East":"#c8a040",
  "South Asia":"#a0d870","East Asia":"#60c0d8","Americas":"#80c870","Oceania":"#60a8c8"
};
const BRANCH_STYLE  = {
  succession: { color:'#aaaacc', dash:[]    },
  influence:  { color:'#88aa44', dash:[4,3] },
  conquest:   { color:'#cc4444', dash:[]    },
  emergence:  { color:'#44aacc', dash:[5,3] },
  split:      { color:'#aa44cc', dash:[]    },
};

// ── Preprocessing ─────────────────────────────────────────────────
const byRegion = {};
REGION_ORDER.forEach(r => { byRegion[r] = { civs:[], rowCount:0 }; });
CIVS.forEach(c => byRegion[c.r].civs.push(c));
REGION_ORDER.forEach(region => {
  const civs = byRegion[region].civs.slice().sort((a,b) => a.s - b.s);
  const ends = [];
  civs.forEach(civ => {
    let row = ends.findIndex(e => e <= civ.s);
    if (row < 0) { row = ends.length; ends.push(-Infinity); }
    ends[row] = civ.e;
    civ.row = row;
  });
  byRegion[region].rowCount = ends.length;
});
const totalRows  = REGION_ORDER.reduce((s,r) => s + byRegion[r].rowCount, 0);
const civsByName = {};
CIVS.forEach(c => civsByName[c.name] = c);

// ── Canvas & layout ───────────────────────────────────────────────
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d', { alpha: false });
let W, H, tW, tH, rowH;
const rLayout = {};

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  tW = W - LEFT_M - PANEL_W;
  tH = H - TOP_M - BOT_M;
  rowH = Math.max(13, Math.min(26, (tH - REGION_ORDER.length * RGN_LBL) / totalRows));
  let y = TOP_M;
  REGION_ORDER.forEach(region => {
    const h = byRegion[region].rowCount * rowH;
    rLayout[region] = { labelY:y, y:y + RGN_LBL, h };
    y += RGN_LBL + h;
  });
}

// ── View state ────────────────────────────────────────────────────
const LOG_MAX   = Math.log10(2026 - HARD_MIN);
let linLeft     = -5000, linRight = 2025;
let logL        = LOG_MAX, logR = 0;
let transT      = 0;
let isLogMode   = false;
let savedLin    = null;
let modeSwitching = false;

// ── Animation ─────────────────────────────────────────────────────
let anim = null;
function easeIO(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

function startAnim(targets, dur, onDone) {
  const from = { linLeft, linRight, logL, logR, transT };
  anim = { from, to:{ ...from, ...targets }, dur, t0:null, onDone };
  modeSwitching = true;
  requestAnimationFrame(animStep);
}
function animStep(ts) {
  if (!anim) return;
  if (!anim.t0) anim.t0 = ts;
  const t = Math.min(1, (ts - anim.t0) / anim.dur);
  const e = easeIO(t);
  const { from, to } = anim;
  linLeft  = from.linLeft  + (to.linLeft  - from.linLeft)  * e;
  linRight = from.linRight + (to.linRight - from.linRight) * e;
  logL     = from.logL     + (to.logL     - from.logL)     * e;
  logR     = from.logR     + (to.logR     - from.logR)     * e;
  transT   = from.transT   + (to.transT   - from.transT)   * e;
  draw();
  if (t < 1) { requestAnimationFrame(animStep); }
  else { const done = anim.onDone; anim = null; modeSwitching = false; done?.(); }
}

// ── Coordinates (shared with drilldown.js) ────────────────────────
function logAge(year) { return Math.log10(Math.max(1, 2026 - year)); }
function yearToXLin(year) { return LEFT_M + (year - linLeft) / (linRight - linLeft) * tW; }
function yearToXLog(year) {
  const lc = logAge(year);
  return LEFT_M + (logL - lc) / (logL - logR) * tW;
}
function yearToX(year) {
  if (transT === 0) return yearToXLin(year);
  if (transT === 1) return yearToXLog(year);
  return yearToXLin(year) * (1 - transT) + yearToXLog(year) * transT;
}
function xToYear(x) {
  if (isLogMode) {
    const lc = logL - (x - LEFT_M) / tW * (logL - logR);
    return 2026 - Math.pow(10, Math.max(0, lc));
  }
  return linLeft + (x - LEFT_M) / tW * (linRight - linLeft);
}
function xToYearLin(x) { return linLeft + (x - LEFT_M) / tW * (linRight - linLeft); }
function civRowY(civ)  { return rLayout[civ.r].y + civ.row * rowH; }
function fmtYear(y) {
  const a = Math.abs(Math.round(y));
  if (y < 0) return a.toLocaleString() + ' BCE';
  if (y === 0) return '1 CE';
  return a.toLocaleString() + ' CE';
}

// ── Draw dispatcher ───────────────────────────────────────────────
// currentView is set by drilldown.js ('world' or 'drilldown')
window.currentView = 'world';

function draw() {
  if (window.currentView === 'drilldown') { drawDrilldown(); return; }
  drawWorld();
}

// ── World view drawing ────────────────────────────────────────────
let showBranches = false;
let highlightSet = null;
let hoveredCiv   = null;

function drawWorld() {
  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(0, 0, LEFT_M, H);
  drawRegionBGs();
  ctx.save(); ctx.beginPath(); ctx.rect(LEFT_M, TOP_M, tW, tH); ctx.clip();
  drawGrid();
  if (showBranches) drawBranches();
  ctx.restore();
  drawBars();
  drawAxis();
  drawMinimap();
  drawWorldTitle();
}

function drawRegionBGs() {
  REGION_ORDER.forEach((region, i) => {
    const { labelY, y, h } = rLayout[region];
    ctx.fillStyle = i % 2 === 0 ? '#0f0f20' : '#0d0d1c';
    ctx.fillRect(0, y, W - PANEL_W, h);
    ctx.fillStyle = REGION_COLORS[region];
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left';
    ctx.fillText(region, 6, labelY + 13);
    ctx.strokeStyle = '#181830'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W - PANEL_W, y); ctx.stroke();
  });
}

function drawGrid() {
  if (transT < 0.5) drawGridLin(1 - transT * 2);
  if (transT > 0.5) drawGridLog((transT - 0.5) * 2);
  const tx = yearToX(2025);
  if (tx > LEFT_M && tx < LEFT_M + tW) {
    ctx.save(); ctx.strokeStyle = 'rgba(255,80,80,0.22)';
    ctx.setLineDash([3,3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx, TOP_M); ctx.lineTo(tx, TOP_M + tH); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
  }
}
function drawGridLin(alpha) {
  const iv = tickIntervalLin(), start = Math.ceil(xToYearLin(LEFT_M) / iv) * iv;
  ctx.strokeStyle = `rgba(24,24,48,${alpha})`; ctx.lineWidth = 1;
  for (let yr = start; yearToXLin(yr) <= LEFT_M + tW; yr += iv) {
    const x = Math.round(yearToXLin(yr)) + 0.5;
    ctx.beginPath(); ctx.moveTo(x, TOP_M); ctx.lineTo(x, TOP_M + tH); ctx.stroke();
  }
}
function drawGridLog(alpha) {
  logTickYears().forEach(yr => {
    const x = Math.round(yearToXLog(yr)) + 0.5;
    if (x < LEFT_M || x > LEFT_M + tW) return;
    ctx.strokeStyle = `rgba(24,24,48,${alpha})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, TOP_M); ctx.lineTo(x, TOP_M + tH); ctx.stroke();
  });
}

function drawAxis() {
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(LEFT_M, 0, tW, TOP_M);
  ctx.strokeStyle = '#1e1e38'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(LEFT_M, TOP_M-0.5); ctx.lineTo(LEFT_M+tW, TOP_M-0.5); ctx.stroke();
  if (transT < 0.5) drawAxisLin(1 - transT * 2);
  if (transT > 0.5) drawAxisLog((transT - 0.5) * 2);
  const tx = yearToX(2025);
  if (tx > LEFT_M && tx < LEFT_M + tW) {
    ctx.fillStyle = 'rgba(255,80,80,0.55)';
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Today', tx, TOP_M - 6);
  }
}
function drawAxisLin(alpha) {
  const iv = tickIntervalLin(), start = Math.ceil(xToYearLin(LEFT_M) / iv) * iv;
  ctx.font = '11px system-ui'; ctx.textAlign = 'center';
  for (let yr = start; yearToXLin(yr) <= LEFT_M + tW; yr += iv) {
    const x = Math.round(yearToXLin(yr));
    ctx.fillStyle = `rgba(85,85,100,${alpha})`;
    ctx.fillText(fmtYear(yr), x, TOP_M - 6);
    ctx.strokeStyle = `rgba(40,40,64,${alpha})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, TOP_M-3); ctx.lineTo(x, TOP_M); ctx.stroke();
  }
}
function drawAxisLog(alpha) {
  let lastX = -999; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
  logTickYears().forEach(yr => {
    const x = Math.round(yearToXLog(yr));
    if (x < LEFT_M || x > LEFT_M + tW || x - lastX < 52) return;
    lastX = x;
    ctx.fillStyle = `rgba(85,85,100,${alpha})`;
    ctx.fillText(fmtYear(yr), x, TOP_M - 6);
    ctx.strokeStyle = `rgba(40,40,64,${alpha})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, TOP_M-3); ctx.lineTo(x, TOP_M); ctx.stroke();
  });
}

function drawBranches() {
  BRANCHES.forEach(({ f, t, type }) => {
    const fc = civsByName[f], tc = civsByName[t];
    if (!fc || !tc) return;
    const x1 = yearToX(fc.e), y1 = civRowY(fc) + rowH * 0.5;
    const x2 = yearToX(tc.s), y2 = civRowY(tc) + rowH * 0.5;
    if ((x1 < LEFT_M && x2 < LEFT_M) || (x1 > LEFT_M+tW && x2 > LEFT_M+tW)) return;
    const style = BRANCH_STYLE[type];
    const dx = x2 - x1;
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, fc.c + '99'); grad.addColorStop(1, tc.c + '99');
    ctx.setLineDash(style.dash); ctx.strokeStyle = grad; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1 + dx*0.45, y1, x2 - dx*0.45, y2, x2, y2);
    ctx.stroke(); ctx.setLineDash([]);
    if (x2 >= LEFT_M && x2 <= LEFT_M + tW) {
      const ang = Math.atan2(y2-y1, x2-x1);
      ctx.fillStyle = tc.c + 'bb'; ctx.beginPath();
      ctx.moveTo(x2,y2);
      ctx.lineTo(x2-7*Math.cos(ang-0.4), y2-7*Math.sin(ang-0.4));
      ctx.lineTo(x2-7*Math.cos(ang+0.4), y2-7*Math.sin(ang+0.4));
      ctx.closePath(); ctx.fill();
    }
  });
}

function drawBars() {
  ctx.save(); ctx.beginPath(); ctx.rect(LEFT_M, TOP_M, tW, tH); ctx.clip();
  CIVS.forEach(civ => {
    const x1 = yearToX(civ.s), x2 = yearToX(civ.e);
    if (x2 < LEFT_M || x1 > LEFT_M + tW) return;
    const cx1 = Math.max(LEFT_M, x1), cx2 = Math.min(LEFT_M+tW, x2);
    const bw  = Math.max(3, cx2 - cx1);
    const by  = civRowY(civ) + BAR_GAP;
    const bh  = rowH - BAR_GAP * 2;
    const dim = highlightSet && !highlightSet.has(civ);
    ctx.globalAlpha = dim ? 0.15 : 1;
    ctx.fillStyle   = civ === hoveredCiv ? lighten(civ.c, 0.25) : civ.c;
    rrect(cx1, by, bw, bh, 3);
    if (bw > 28 && !dim) {
      const fs = Math.min(11, rowH - 5);
      ctx.font = `${fs}px system-ui`; ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.textAlign = 'left';
      ctx.save(); ctx.beginPath(); ctx.rect(cx1, by, bw, bh); ctx.clip();
      ctx.fillText(civ.name, Math.max(cx1+3, LEFT_M+3), by + bh/2 + fs*0.35);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });
  ctx.restore();
}

function drawMinimap() {
  const mx = LEFT_M, my = H - BOT_M + 8, mw = tW, mh = BOT_M - 14;
  const SPAN = HARD_MAX - HARD_MIN;
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(mx, H - BOT_M, mw, BOT_M);
  ctx.strokeStyle = '#1a1a32'; ctx.lineWidth = 1; ctx.strokeRect(mx, my, mw, mh);
  CIVS.forEach(civ => {
    const bx = mx + ((civ.s - HARD_MIN) / SPAN) * mw;
    const bw = Math.max(1, ((civ.e - civ.s) / SPAN) * mw);
    ctx.fillStyle = civ.c + '50'; ctx.fillRect(bx, my+1, bw, mh-2);
  });
  const vl = isLogMode ? 2026 - Math.pow(10, logL) : linLeft;
  const vr = isLogMode ? 2026 - Math.pow(10, logR) : linRight;
  const wx = mx + ((vl - HARD_MIN) / SPAN) * mw;
  const ww = Math.max(2, ((vr - vl) / SPAN) * mw);
  ctx.fillStyle = 'rgba(100,160,255,0.12)'; ctx.strokeStyle = 'rgba(100,160,255,0.45)'; ctx.lineWidth = 1;
  ctx.fillRect(wx, my, ww, mh); ctx.strokeRect(wx, my, ww, mh);
  [-50000,-10000,-5000,-1000,1,500,1000,1500,2000].forEach(yr => {
    const x = mx + ((yr - HARD_MIN) / SPAN) * mw;
    ctx.fillStyle = '#2a2a40'; ctx.font = '9px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(fmtYear(yr), x, my + mh - 2);
  });
}

function drawWorldTitle() {
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(0, 0, LEFT_M, TOP_M);
  ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#444'; ctx.textAlign = 'left';
  ctx.fillText('REGION', 6, 26);
  ctx.font = '10px system-ui';
  ctx.fillStyle = transT > 0.5 ? '#4af' : '#333';
  ctx.fillText(transT > 0.5 ? 'LOG SCALE' : 'LINEAR', 6, 38);
}

// ── Helpers ───────────────────────────────────────────────────────
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath(); ctx.fill();
}
function lighten(hex, a) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgb(${Math.min(255,r+Math.round(255*a))},${Math.min(255,g+Math.round(255*a))},${Math.min(255,b+Math.round(255*a))})`;
}
function tickIntervalLin() {
  const vis = linRight - linLeft, raw = vis / 8;
  const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(raw)||1)));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag;
}
function logTickYears() {
  return [-100000,-50000,-20000,-10000,-5000,-3000,-2000,-1000,-500,-200,-100,
          1,100,300,500,1000,1500,1800,1900,1950,2000,2010,2020,2025];
}
function civAtPoint(x, y) {
  if (x < LEFT_M || x > LEFT_M+tW || y < TOP_M || y > TOP_M+tH) return null;
  for (const civ of CIVS) {
    const cx1 = Math.max(LEFT_M, yearToX(civ.s));
    const cx2 = Math.min(LEFT_M+tW, yearToX(civ.e));
    const by  = civRowY(civ) + BAR_GAP;
    if (x >= cx1 && x <= cx2 && y >= by && y <= by + rowH - BAR_GAP*2) return civ;
  }
  return null;
}
function clampLin() {
  const span = linRight - linLeft;
  if (span < 20) { linRight = linLeft + 20; }
  if (linRight > HARD_MAX) { linRight = HARD_MAX; linLeft = HARD_MAX - span; }
  if (linLeft  < HARD_MIN) { linLeft  = HARD_MIN; linRight = HARD_MIN + span; }
}
function clampLog() {
  // Enforce span limits (min zoom / max zoom-out)
  if (logL - logR < 0.05)    logL = logR + 0.05;
  if (logL - logR > LOG_MAX) logR = logL - LOG_MAX;
  // Slide window when hitting temporal boundaries (mirrors clampLin behaviour)
  if (logL > LOG_MAX) { logR += LOG_MAX - logL; logL = LOG_MAX; }
  if (logR < 0)       { logL -= logR;            logR = 0;      }
  // Hard clamps as safety net
  logL = Math.min(LOG_MAX, logL);
  logR = Math.max(0, logR);
}

// ── Tooltip ───────────────────────────────────────────────────────
const tip = document.getElementById('tip');
let tipCiv = null;
function showTip(civ, x, y) {
  tipCiv = civ;
  // Check if this civ has drill-down events available
  const slug = civSlug(civ.name);
  tip.innerHTML = `<b>${civ.name}</b><span>${civ.r} · ${fmtYear(civ.s)} – ${fmtYear(civ.e)}</span>
    <div class="tip-actions">
      <a href="https://en.wikipedia.org/wiki/${civ.w}" target="_blank">Wikipedia ↗</a>
      <button onclick="window.enterDrilldown('${slug}')">Explore →</button>
    </div>`;
  tip.style.display = 'block';
  tip.style.left = Math.min(x+14, window.innerWidth-250)+'px';
  tip.style.top  = (y-8)+'px';
}
function hideTip() { tip.style.display = 'none'; tipCiv = null; }
function civSlug(name) {
  return name.toLowerCase()
    .replace(/[\s/\(+]+/g, '-')   // spaces, /, (, + all become hyphens
    .replace(/[^a-z0-9-]/g, '')   // strip remaining special chars
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Interactions ──────────────────────────────────────────────────
let dragging = false, dragX0 = 0, dragLL0 = 0, dragLR0 = 0, dragLogL0 = 0, dragLogR0 = 0;

canvas.addEventListener('mousedown', e => {
  if (window.currentView !== 'world' || modeSwitching) return;
  dragging = true; dragX0 = e.clientX;
  dragLL0 = linLeft; dragLR0 = linRight; dragLogL0 = logL; dragLogR0 = logR;
  canvas.classList.add('grabbing');
});
window.addEventListener('mousemove', e => {
  if (window.currentView !== 'world') return;
  if (dragging) {
    const dx = e.clientX - dragX0;
    if (isLogMode) {
      const dLC = -dx / tW * (logL - logR);
      logL = dragLogL0 + dLC; logR = dragLogR0 + dLC; clampLog();
    } else {
      const dYr = -dx / tW * (linRight - linLeft);
      linLeft = dragLL0 + dYr; linRight = dragLR0 + dYr; clampLin();
    }
    draw(); return;
  }
  const hov = civAtPoint(e.clientX, e.clientY);
  if (hov !== hoveredCiv) {
    hoveredCiv = hov;
    canvas.style.cursor = hov ? 'pointer' : 'grab';
    if (hov) showTip(hov, e.clientX, e.clientY); else hideTip();
    draw();
  }
});
window.addEventListener('mouseup', () => { if(dragging){ dragging=false; canvas.classList.remove('grabbing'); } });

canvas.addEventListener('click', e => {
  if (window.currentView !== 'world' || Math.abs(e.clientX - dragX0) > 4) return;
  // Minimap click
  const my = H - BOT_M + 8, mh = BOT_M - 14;
  if (e.clientY >= my && e.clientY <= my + mh && e.clientX >= LEFT_M && e.clientX <= LEFT_M + tW) {
    const yr = HARD_MIN + ((e.clientX - LEFT_M) / tW) * (HARD_MAX - HARD_MIN);
    if (isLogMode) {
      const span = logL - logR;
      logL = Math.min(LOG_MAX, logAge(yr) + span/2);
      logR = Math.max(0, logL - span);
    } else {
      const span = linRight - linLeft;
      linLeft = yr - span/2; linRight = yr + span/2; clampLin();
    }
    draw();
  }
});

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  if (window.currentView !== 'world' || modeSwitching) return;
  const factor = e.deltaY < 0 ? 0.87 : 1/0.87;
  if (isLogMode) {
    const pivot = logL - (e.clientX - LEFT_M) / tW * (logL - logR);
    logL = pivot + (logL - pivot) * factor;
    logR = pivot + (logR - pivot) * factor;
    clampLog();
  } else {
    const pivYr = xToYearLin(e.clientX), span = (linRight - linLeft) * factor;
    const frac  = (e.clientX - LEFT_M) / tW;
    linLeft = pivYr - frac * span; linRight = pivYr + (1-frac) * span; clampLin();
  }
  draw();
}, { passive: false });

// ── Mode toggle ───────────────────────────────────────────────────
const modeBtn = document.getElementById('modeBtn');
modeBtn.onclick = () => {
  if (modeSwitching) return;
  if (!isLogMode) {
    savedLin = { linLeft, linRight };
    startAnim({ transT:1, logL:LOG_MAX, logR:0 }, 900, () => {
      isLogMode = true; modeBtn.classList.add('on'); modeBtn.textContent = 'Linear Scale';
    });
  } else {
    if (savedLin) { linLeft = savedLin.linLeft; linRight = savedLin.linRight; }
    startAnim({ transT:0 }, 700, () => {
      isLogMode = false; modeBtn.classList.remove('on'); modeBtn.textContent = 'Log Scale';
    });
  }
};

// ── Branch toggle ─────────────────────────────────────────────────
const branchBtn = document.getElementById('branchBtn');
branchBtn.onclick = () => {
  showBranches = !showBranches;
  branchBtn.classList.toggle('on', showBranches);
  branchBtn.textContent = showBranches ? 'Branches: On' : 'Branches';
  document.getElementById('blegend').style.display = showBranches ? 'flex' : 'none';
  draw();
};

// ── Side panel ────────────────────────────────────────────────────
let filterRegion = 'All', searchQ = '', activePanelCiv = null;

const rfiltersEl = document.getElementById('rfilters');
['All', ...REGION_ORDER].forEach(r => {
  const b = document.createElement('button');
  b.className = 'rfbtn' + (r === 'All' ? ' on' : '');
  if (r !== 'All' && REGION_COLORS[r]) {
    const dot = document.createElement('span');
    dot.className = 'rfbtn-dot';
    dot.style.background = REGION_COLORS[r];
    b.appendChild(dot);
    b.appendChild(document.createTextNode(r));
  } else {
    b.textContent = r;
  }
  b.onclick = () => {
    filterRegion = r;
    document.querySelectorAll('.rfbtn').forEach(x => { x.classList.remove('on'); x.style.borderColor = ''; });
    b.classList.add('on');
    if (r !== 'All') b.style.borderColor = REGION_COLORS[r] + '99';
    rebuildList();
  };
  rfiltersEl.appendChild(b);
});
document.getElementById('search').addEventListener('input', e => {
  searchQ = e.target.value.toLowerCase(); rebuildList();
});

function rebuildList() {
  const filtered = CIVS.filter(c =>
    (filterRegion === 'All' || c.r === filterRegion) &&
    (!searchQ || c.name.toLowerCase().includes(searchQ) || c.r.toLowerCase().includes(searchQ))
  );
  highlightSet = (searchQ || filterRegion !== 'All') ? new Set(filtered) : null;
  const list = document.getElementById('civlist');
  list.innerHTML = '';
  filtered.forEach(civ => {
    const row = document.createElement('div');
    row.className = 'crow' + (civ === activePanelCiv ? ' hi' : '');
    const dot = document.createElement('div');
    dot.className = 'cdot'; dot.style.background = civ.c;
    const name = document.createElement('span');
    name.className = 'cname'; name.textContent = civ.name;
    const wl = document.createElement('a');
    wl.className = 'wbtn'; wl.href = 'https://en.wikipedia.org/wiki/'+civ.w;
    wl.target = '_blank'; wl.textContent = 'Wiki'; wl.onclick = e => e.stopPropagation();
    const expBtn = document.createElement('button');
    expBtn.className = 'exp-btn';
    expBtn.textContent = '→';
    expBtn.title = 'Explore events';
    expBtn.onclick = e => { e.stopPropagation(); window.enterDrilldown(civSlug(civ.name)); };
    row.appendChild(dot); row.appendChild(name); row.appendChild(expBtn); row.appendChild(wl);
    row.onclick = () => {
      activePanelCiv = civ;
      const mid = (civ.s + civ.e) / 2, span = Math.max(civ.e - civ.s, 200) * 2.5;
      if (isLogMode) {
        const cl = logAge(mid), hs = Math.max(logAge(civ.s) - logAge(civ.e), 0.3) * 1.8;
        startAnim({ logL:cl+hs, logR:Math.max(0,cl-hs) }, 500, null);
      } else {
        startAnim({ linLeft:mid-span/2, linRight:mid+span/2 }, 500, null);
      }
      rebuildList();
    };
    list.appendChild(row);
  });
  draw();
}

// ── World view panel show/hide ────────────────────────────────────
window.showWorldPanel = function() {
  document.getElementById('panel-world').style.display = 'flex';
  document.getElementById('panel-world').style.flexDirection = 'column';
  document.getElementById('panel-world').style.gap = '8px';
  document.getElementById('panel-world').style.flex = '1';
  document.getElementById('panel-world').style.minHeight = '0';
  const dd = document.getElementById('panel-drilldown');
  if (dd) dd.style.display = 'none';
};
window.showDrilldownPanel = function() {
  document.getElementById('panel-world').style.display = 'none';
  const dd = document.getElementById('panel-drilldown');
  if (dd) dd.style.display = 'flex';
};

// ── Touch support (pan + pinch-zoom for both views) ───────────────
let touchState = null;

function getTouchMidX(t) {
  return t.length > 1 ? (t[0].clientX + t[1].clientX) / 2 : t[0].clientX;
}
function getTouchDist(t) {
  const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (modeSwitching) return;
  const t = e.touches;
  touchState = {
    x0: getTouchMidX(t), ll0: linLeft, lr0: linRight,
    logL0: logL, logR0: logR,
    dist0: t.length > 1 ? getTouchDist(t) : null,
    pivYr: t.length > 1 ? xToYearLin(getTouchMidX(t)) : null,
  };
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!touchState || modeSwitching) return;
  const t = e.touches;
  const midX = getTouchMidX(t);

  if (t.length > 1 && touchState.dist0 !== null) {
    // Pinch-to-zoom — scale from initial state relative to initial pinch midpoint
    const factor = getTouchDist(t) / touchState.dist0;
    if (window.currentView === 'drilldown' || !isLogMode) {
      const span = (touchState.lr0 - touchState.ll0) / factor;
      const frac = (touchState.x0 - LEFT_M) / tW;
      linLeft  = touchState.pivYr - frac * span;
      linRight = touchState.pivYr + (1 - frac) * span;
      clampLin();
    } else {
      const pivLog = touchState.logL0 - (touchState.x0 - LEFT_M) / tW * (touchState.logL0 - touchState.logR0);
      logL = pivLog + (touchState.logL0 - pivLog) / factor;
      logR = pivLog + (touchState.logR0 - pivLog) / factor;
      clampLog();
    }
  } else {
    // Single-finger pan
    const dx = midX - touchState.x0;
    if (window.currentView === 'drilldown' || !isLogMode) {
      const dYr = -dx / tW * (touchState.lr0 - touchState.ll0);
      linLeft  = touchState.ll0 + dYr; linRight = touchState.lr0 + dYr; clampLin();
    } else {
      const dLC = -dx / tW * (touchState.logL0 - touchState.logR0);
      logL = touchState.logL0 + dLC; logR = touchState.logR0 + dLC; clampLog();
    }
  }
  draw();
}, { passive: false });

canvas.addEventListener('touchend', e => {
  if (e.touches.length === 0) { touchState = null; return; }
  // One finger lifted mid-pinch — reset to single-finger pan from current position
  touchState = { x0: e.touches[0].clientX, ll0: linLeft, lr0: linRight,
                 logL0: logL, logR0: logR, dist0: null, pivYr: null };
}, { passive: false });
canvas.addEventListener('touchcancel', () => { touchState = null; }, { passive: false });

// ── Init ──────────────────────────────────────────────────────────
window.addEventListener('resize', () => { resize(); draw(); });
resize();
rebuildList();
