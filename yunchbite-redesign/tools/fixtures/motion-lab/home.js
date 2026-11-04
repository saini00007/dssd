gsap.registerPlugin(SplitText);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// ---- preloader: counter + curtain, then everything else starts
window.lenis.stop();
const counter = { v: 0 };
const countEl = $('.preloader__count');
const intro = gsap.timeline({ onComplete: () => window.lenis.start() });
intro
  .to(counter, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { countEl.textContent = Math.round(counter.v); } })
  .to('.preloader__label', { opacity: 0, duration: 0.3 }, '-=0.3')
  .to('.preloader', { yPercent: -100, duration: 1, ease: 'expo.inOut' })
  .add(heroReveal, '-=0.6');

// ---- hero: SplitText char reveal, then fades for the rest of the hero
function heroReveal() {
  const split = SplitText.create('#hero-title', { type: 'chars', charsClass: 'char' });
  gsap.from(split.chars, { yPercent: 120, opacity: 0, rotate: 8, duration: 1.2, ease: 'power4.out', stagger: 0.035 });
  gsap.from('.hero__sub', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.5 });
  gsap.from('.layer', { scale: 0, duration: 1.4, ease: 'elastic.out(1, 0.6)', stagger: 0.12, delay: 0.3 });
}

// ---- mouse-move parallax (hero layers)
window.addEventListener('mousemove', (e) => {
  const nx = e.clientX / innerWidth - 0.5;
  const ny = e.clientY / innerHeight - 0.5;
  $$('.layer').forEach((l) => {
    const d = Number(l.dataset.depth);
    gsap.to(l, { x: nx * d, y: ny * d, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
  });
});

// ---- WAAPI animation (shows up in document.getAnimations() next to CSS ones)
$('.badge').animate(
  [{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(180deg) scale(1.08)' }, { transform: 'rotate(360deg) scale(1)' }],
  { duration: 8000, iterations: Infinity, easing: 'linear' }
);

// ---- pinned horizontal carousel, scrubbed
const track = $('#track');
const distance = () => track.scrollWidth - innerWidth;
gsap.to(track, {
  x: () => -distance(),
  ease: 'none',
  scrollTrigger: { trigger: '#products', start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 1, invalidateOnRefresh: true },
});
gsap.to('#progress', {
  scaleX: 1, ease: 'none',
  scrollTrigger: { trigger: '#products', start: 'top top', end: () => '+=' + distance(), scrub: true },
});

// ---- background colour driven by the section in view
$$('[data-bg]').forEach((sec) => {
  ScrollTrigger.create({
    trigger: sec, start: 'top 55%', end: 'bottom 55%',
    onToggle: (self) => {
      if (!self.isActive) return;
      gsap.to('body', { backgroundColor: sec.dataset.bg, color: sec.dataset.fg || '#14110f', duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
    },
  });
});

// ---- counters animate on enter
$$('.stat__num').forEach((el) => {
  const o = { v: 0 };
  gsap.to(o, {
    v: Number(el.dataset.count), duration: 2, ease: 'power1.out',
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-IN'); },
  });
});

// ---- batch stagger reveal for cards
gsap.set('.card', { y: 70, opacity: 0 });
ScrollTrigger.batch('.card', {
  start: 'top 88%', once: true,
  onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12, overwrite: true }),
});

// ---- section titles slide in
$$('.section__title').forEach((t) => {
  gsap.from(t, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 85%', toggleActions: 'play none none reverse' } });
});

// ---- WebGL: spinning gradient through raw WebGL
(function gl() {
  const canvas = $('#gl');
  const g = canvas.getContext('webgl');
  if (!g) return;
  const vs = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  const fs = 'precision mediump float; uniform float t; uniform vec2 r; void main(){ vec2 u = gl_FragCoord.xy / r - 0.5; float a = atan(u.y, u.x) + t; float d = length(u); gl_FragColor = vec4(0.5 + 0.5 * sin(a * 3.0 + d * 8.0), 0.35 + 0.3 * cos(t + d * 6.0), 0.6 + 0.4 * sin(t * 0.7 + a), 1.0); }';
  const sh = (type, src) => { const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); return s; };
  const prog = g.createProgram();
  g.attachShader(prog, sh(g.VERTEX_SHADER, vs));
  g.attachShader(prog, sh(g.FRAGMENT_SHADER, fs));
  g.linkProgram(prog);
  g.useProgram(prog);
  g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(prog, 'p');
  g.enableVertexAttribArray(loc);
  g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
  const ut = g.getUniformLocation(prog, 't');
  g.uniform2f(g.getUniformLocation(prog, 'r'), canvas.width, canvas.height);
  (function frame(ms) { g.uniform1f(ut, ms / 1000); g.drawArrays(g.TRIANGLE_STRIP, 0, 4); requestAnimationFrame(frame); })(0);
})();

// ---- magnetic button: starts moving as the pointer approaches, before hovering it
const magnet = $('#magnet');
window.addEventListener('mousemove', (e) => {
  const r = magnet.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  const near = Math.hypot(dx, dy) < 220;
  gsap.to(magnet, { x: near ? dx * 0.35 : 0, y: near ? dy * 0.35 : 0, duration: near ? 0.4 : 0.8, ease: near ? 'power3.out' : 'elastic.out(1, 0.4)', overwrite: 'auto' });
});
