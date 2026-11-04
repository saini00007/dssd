// viewer.html: self-contained frame stepper. Timeline data is embedded inline so it works from file://.
import path from 'node:path';
import { round } from './util.mjs';

export function buildViewerHtml({ label, videoRel, timeline, events, probe, crop, frameImages }) {
  const classCode = { idle: 0, scroll: 1, animate: 2, 'scroll+animate': 3, cut: 4 };
  const data = {
    label, video: videoRel, crop: { x: crop.x, y: crop.y, w: crop.w, h: crop.h },
    fps: { avg: round(probe.stats.avgFps, 2), nominal: round(probe.stats.nominalFps, 2) },
    times: timeline.map((f) => round(f.t, 5)),
    cls: timeline.map((f) => classCode[f.class]),
    scrollPos: timeline.map((f) => round(f.scrollPos, 1)),
    scrollVelocity: timeline.map((f) => round(f.scrollVelocity, 1)),
    dy: timeline.map((f) => round(f.dy, 2)),
    energy: timeline.map((f) => round(f.energy, 2)),
    events: events.map((e) => ({ id: e.id, type: e.type, a: e.startFrame, b: e.endFrame, t0: e.startT, t1: e.endT, dur: e.duration, region: e.region || '', note: e.note || '', strip: e.strip || null })),
    frameImages: frameImages || {},
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${label.replace(/</g, '&lt;')} frame stepper</title>
<style>
:root{--bg:#0f0f10;--panel:#18181a;--line:#2a2a2d;--fg:#ececec;--mut:#9a9aa0;--acc:#4ea1ff;--scroll:#8d8c87;--anim:#eb6834;--pin:#1baf7a;--h:#eda100;--cut:#fff}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
body{padding:12px 16px;max-width:1500px;margin:0 auto}
h1{font-size:16px;margin:0 0 8px;font-weight:600}h1 small{color:var(--mut);font-weight:400}
#stage{background:#000;border:1px solid var(--line);border-radius:6px;position:relative;display:flex;justify-content:center}
video,#fb{width:100%;max-height:68vh;object-fit:contain;display:block;background:#000}#fb{display:none}
#msg{position:absolute;left:8px;bottom:8px;right:8px;background:#000c;color:#ffb454;font-size:12px;padding:6px 8px;border-radius:4px;display:none}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0}
.hud{font:600 15px ui-monospace,Menlo,Consolas,monospace}.hud span{color:var(--acc)}
.pill{background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:3px 10px;font:12px ui-monospace,Menlo,Consolas,monospace;color:var(--mut)}
button{background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:7px 12px;font:inherit;cursor:pointer;min-height:36px}
button:hover{border-color:#555}button.on{background:#20406b;border-color:var(--acc)}
#bar{position:relative;height:74px;background:var(--panel);border:1px solid var(--line);border-radius:6px;cursor:pointer;touch-action:none;overflow:hidden}
#bar canvas{position:absolute;inset:0;width:100%;height:100%}
#ph{position:absolute;top:0;bottom:0;width:2px;background:#fff;pointer-events:none;box-shadow:0 0 0 1px #0008}
#list{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px;margin-top:8px}
.ev{background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--mut);border-radius:6px;padding:6px 9px;cursor:pointer;font-size:12.5px}
.ev:hover{border-color:#666}.ev.cur{outline:2px solid var(--acc)}.ev b{font-family:ui-monospace,Menlo,monospace}.ev .m{color:var(--mut)}.ev a{color:var(--acc);text-decoration:none}
.legend{display:flex;gap:12px;flex-wrap:wrap;color:var(--mut);font-size:12px}.legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:-1px}
kbd{background:#222;border:1px solid #444;border-radius:4px;padding:0 5px;font-size:12px}
@media(max-width:600px){body{padding:8px}.hud{font-size:13px}}
</style></head><body>
<h1>${label.replace(/</g, '&lt;')} <small>frame stepper — true per-frame timestamps (VFR)</small></h1>
<div id="stage"><video id="v" preload="auto" muted playsinline></video><img id="fb" alt="frame"><div id="msg"></div></div>
<div class="row"><div class="hud">frame <span id="fn">0</span> / <span id="fN"></span> &nbsp; t = <span id="ft">0.000</span>s &nbsp; Δt <span id="fdt">0</span>ms</div>
<span class="pill" id="pc">class</span><span class="pill" id="py">dy</span><span class="pill" id="pe">energy</span><span class="pill" id="ps">scroll</span></div>
<div class="row" id="ctrl">
<button id="b-10">⏮ −10</button><button id="b-1">◀ −1</button><button id="bp">▶ Play</button><button id="b1">+1 ▶</button><button id="b10">+10 ⏭</button>
<span style="width:8px"></span><span class="pill">speed</span><span id="rates"></span>
</div>
<div id="bar" role="slider" aria-label="timeline"><canvas id="cv"></canvas><div id="ph"></div></div>
<div class="legend" style="margin-top:6px"><span><i style="background:var(--scroll)"></i>scroll</span><span><i style="background:var(--anim)"></i>animation</span><span><i style="background:var(--pin)"></i>pinned</span><span><i style="background:var(--h)"></i>h-scroll</span><span><i style="background:#fff"></i>cut</span>
<span><kbd>←</kbd><kbd>→</kbd> ±1 frame · <kbd>Shift</kbd>+arrows ±10 · <kbd>Space</kbd> play/pause · <kbd>[</kbd><kbd>]</kbd> prev/next event</span></div>
<div id="list"></div>
<script id="tl" type="application/json">${json}</script>
<script>
(function(){
var D=JSON.parse(document.getElementById('tl').textContent), T=D.times, N=T.length;
var v=document.getElementById('v'), fb=document.getElementById('fb'), msg=document.getElementById('msg');
var cur=0, rate=1, videoOK=true, seekTok=0;
var CLS=['idle','scroll','animate','scroll+animate','cut'];
var COL={scroll:'#8d8c87',animation:'#eb6834','anim-scroll':'#eb6834',pinned:'#1baf7a',hscroll:'#eda100',cut:'#ffffff'};
document.getElementById('fN').textContent=N-1;
v.src=D.video;
function lastLE(x){var lo=0,hi=N-1;if(x<T[0])return 0;while(lo<hi){var m=(lo+hi+1)>>1;if(T[m]<=x)lo=m;else hi=m-1}return lo}
function seekTime(n){var nx=n+1<N?T[n+1]:T[n]+0.02;return T[n]+(nx-T[n])*0.5}
function showFallback(n){var im=D.frameImages[n];if(im){fb.src=im;fb.style.display='block';v.style.display='none';return true}return false}
function go(n,fromVideo){
  n=Math.max(0,Math.min(N-1,n));cur=n;
  if(!fromVideo){v.pause();setPlayLabel();if(videoOK){v.currentTime=seekTime(n);fb.style.display='none';v.style.display='block'}else showFallback(n)}
  hud();
}
function hud(){
  var n=cur;document.getElementById('fn').textContent=n;document.getElementById('ft').textContent=T[n].toFixed(3);
  document.getElementById('fdt').textContent=n?Math.round((T[n]-T[n-1])*1000):0;
  document.getElementById('pc').textContent=CLS[D.cls[n]];document.getElementById('py').textContent='dy '+D.dy[n]+' px';
  document.getElementById('pe').textContent='energy '+D.energy[n];document.getElementById('ps').textContent='scrollPos '+D.scrollPos[n]+' px';
  var x=T[n]/T[N-1]*100;document.getElementById('ph').style.left='calc('+x+'% - 1px)';
  var items=document.querySelectorAll('.ev');var ce=-1;
  D.events.forEach(function(e,i){var on=n>=e.a&&n<=e.b;items[i].classList.toggle('cur',on);if(on&&ce<0)ce=i});
}
function setPlayLabel(){document.getElementById('bp').textContent=v.paused?'▶ Play':'⏸ Pause'}
v.addEventListener('error',function(){videoOK=false;msg.style.display='block';msg.textContent='Video could not be loaded from '+D.video+' (missing file or unsupported codec: H.264 needs Chrome/Edge/Safari/Brave). Showing saved frames where available.';showFallback(cur)});
v.addEventListener('loadedmetadata',function(){go(cur)});
v.addEventListener('seeked',function(){});
function tick(){ if(!v.paused&&videoOK){var n=lastLE(v.currentTime+1e-4);if(n!==cur){cur=n;hud()}} if(!v.paused||true) requestAnimationFrame(tick)}
requestAnimationFrame(tick);
v.addEventListener('pause',setPlayLabel);v.addEventListener('play',setPlayLabel);
function toggle(){if(!videoOK)return;if(v.paused){if(cur>=N-1)go(0);v.play()}else{v.pause();go(lastLE(v.currentTime+1e-4))}}
document.getElementById('bp').onclick=toggle;
[['b-10',-10],['b-1',-1],['b1',1],['b10',10]].forEach(function(p){document.getElementById(p[0]).onclick=function(){go(cur+p[1])}});
var rr=document.getElementById('rates');
[0.1,0.25,0.5,1].forEach(function(r){var b=document.createElement('button');b.textContent=r+'×';b.dataset.r=r;b.onclick=function(){rate=r;v.playbackRate=r;[].forEach.call(rr.children,function(c){c.classList.toggle('on',c===b)})};if(r===1)b.classList.add('on');rr.appendChild(b)});
function jumpEvent(dir){var n=cur,best=null;D.events.forEach(function(e){if(dir>0&&e.a>n&&(best===null||e.a<best))best=e.a;if(dir<0&&e.a<n&&(best===null||e.a>best))best=e.a});if(best!==null)go(best)}
addEventListener('keydown',function(ev){
  var k=ev.key;if(k==='ArrowRight'){go(cur+(ev.shiftKey?10:1));ev.preventDefault()}else if(k==='ArrowLeft'){go(cur-(ev.shiftKey?10:1));ev.preventDefault()}
  else if(k===' '){toggle();ev.preventDefault()}else if(k===']')jumpEvent(1);else if(k==='[')jumpEvent(-1);});
// timeline bar
var bar=document.getElementById('bar'),cv=document.getElementById('cv');
function draw(){var r=bar.getBoundingClientRect(),dpr=window.devicePixelRatio||1,W=r.width,H=r.height;cv.width=W*dpr;cv.height=H*dpr;var c=cv.getContext('2d');c.scale(dpr,dpr);c.clearRect(0,0,W,H);
  var X=function(t){return t/T[N-1]*W};
  var maxp=1;for(var i=0;i<N;i++)if(D.scrollPos[i]>maxp)maxp=D.scrollPos[i];
  c.fillStyle='rgba(255,255,255,.07)';D.events.forEach(function(e){if(e.type==='scroll'){c.fillStyle='rgba(141,140,135,.30)';c.fillRect(X(e.t0),0,Math.max(2,X(e.t1)-X(e.t0)),H*.42)}});
  D.events.forEach(function(e){if(e.type==='cut'||e.type==='scroll')return;c.fillStyle=COL[e.type];c.globalAlpha=.85;c.fillRect(X(e.t0),H*.46,Math.max(2,X(e.t1)-X(e.t0)),H*.2);c.globalAlpha=1});
  c.strokeStyle='#4ea1ff';c.lineWidth=1.5;c.beginPath();var st=false;for(i=0;i<N;i++){if(D.cls[i]===4){st=false;continue}var x=X(T[i]),y=H*.4-(D.scrollPos[i]/maxp)*H*.36;if(!st){c.moveTo(x,y);st=true}else c.lineTo(x,y)}c.stroke();
  D.events.forEach(function(e){if(e.type!=='cut')return;c.fillStyle='#fff';c.fillRect(X(e.t0)-1,0,3,H);});
  c.fillStyle='#9a9aa0';c.font='11px system-ui';c.textBaseline='bottom';var step=T[N-1]>120?20:T[N-1]>50?10:5;for(var t=0;t<=T[N-1];t+=step){c.fillText(t+'s',X(t)+3,H-3);c.fillRect(X(t),H-14,1,14)}
  c.fillStyle='#ececec';c.font='10px ui-monospace,monospace';D.events.forEach(function(e,i){if(e.type==='scroll'||X(e.t1)-X(e.t0)<26&&i%2)return;c.fillText(e.id,X(e.t0)+2,H*.78)});
}
function seekFromX(cx){var r=bar.getBoundingClientRect();var t=Math.max(0,Math.min(1,(cx-r.left)/r.width))*T[N-1];go(lastLE(t))}
var drag=false;bar.addEventListener('pointerdown',function(e){drag=true;bar.setPointerCapture(e.pointerId);seekFromX(e.clientX)});bar.addEventListener('pointermove',function(e){if(drag)seekFromX(e.clientX)});bar.addEventListener('pointerup',function(){drag=false});
addEventListener('resize',draw);
// event list
var list=document.getElementById('list');
D.events.forEach(function(e){var d=document.createElement('div');d.className='ev';d.style.borderLeftColor=COL[e.type]||'#888';
  d.innerHTML='<b>'+e.id+'</b> '+e.type+' <span class="m">· '+e.t0.toFixed(2)+'–'+e.t1.toFixed(2)+'s · '+Math.round(e.dur*1000)+'ms · f#'+e.a+'–'+e.b+(e.region?' · '+e.region:'')+'</span>'+(e.strip?' <a href="'+e.strip+'" target="_blank" onclick="event.stopPropagation()">strip</a>':'');
  d.onclick=function(){go(e.a)};list.appendChild(d)});
draw();hud();
window.__viewer={go:go,cur:function(){return cur},N:N,ok:function(){return videoOK}};
})();
</script></body></html>`;
}
