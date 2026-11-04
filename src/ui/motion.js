export function createMotion() {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return () => {};
  const pending = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
      pending.delete(entry.target);
    }
  }, { threshold: 0.08 });
  document.documentElement.classList.add('motion-ready');
  const reveal = root => {
    for (const element of pending) if (!element.isConnected) { observer.unobserve(element); pending.delete(element); }
    if (preference.matches) return;
    root.querySelectorAll('.te-map-form,.te-map-frame,.proof-item,.platform-card,.guide-card,.regional,.te-feature-heading,.listing,.section-heading,.approach,.approach h2,.principles p,.faq,.contact-heading,.contact-panel').forEach((element,index) => {
    if (element.classList.contains('reveal')) return;
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay',`${Math.min(index%3,2)*85}ms`);
    observer.observe(element);
    pending.add(element);
    });
  };
  document.addEventListener('focusin', event => event.target.closest('.reveal')?.classList.add('is-visible'));
  preference.addEventListener('change', event => {
    if (event.matches) { observer.disconnect(); pending.clear(); document.documentElement.classList.remove('motion-ready'); }
  });
  reveal(document);
  return reveal;
}
