// Shared by every page: Lenis + GSAP wiring, custom cursor, page-transition wipe.
gsap.registerPlugin(ScrollTrigger);

window.lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, orientation: 'vertical' });
window.lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => window.lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

// --- custom cursor: follows the pointer with a short lag, grows over links
const cursor = document.querySelector('.cursor');
if (cursor && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const qx = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3.out' });
  const qy = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3.out' });
  window.addEventListener('mousemove', (e) => {
    cursor.classList.add('is-visible');
    qx(e.clientX);
    qy(e.clientY);
  });
  document.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-grow'));
  });
}

// --- page transition: colour wipe covers the page, then navigates (full reload)
const wipe = document.querySelector('.wipe');
gsap.set(wipe, { yPercent: 100 });
if (sessionStorage.getItem('wipe-in')) {
  // Arriving through a transition: the wipe still covers the page, then lifts away.
  sessionStorage.removeItem('wipe-in');
  gsap.fromTo(wipe, { yPercent: 0 }, { yPercent: -100, duration: 0.8, ease: 'expo.inOut', delay: 0.1 });
}
document.querySelectorAll('a[data-transition]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const href = a.href;
    sessionStorage.setItem('wipe-in', '1');
    gsap.fromTo(wipe, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut', onComplete: () => { location.href = href; } });
  });
});
