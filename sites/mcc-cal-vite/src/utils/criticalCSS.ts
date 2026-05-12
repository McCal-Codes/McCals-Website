// Critical CSS extraction for above-the-fold content
export const criticalCSS = `
/* Critical CSS for Nation Divided page - above the fold */
.lmgoRoot {
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  overflow-x: clip;
  background: var(--lmgo-bg, #08070a);
  color: var(--lmgo-fg, rgba(245, 242, 238, 0.92));
  --lmgo-accent: #c75a4a;
  --lmgo-accent-soft: rgba(199, 90, 74, 0.35);
  --lmgo-line: rgba(255, 255, 255, 0.08);
  --lmgo-serif: 'Fraunces', Georgia, 'Times New Roman', serif;
  --lmgo-body: 'Inter', system-ui, sans-serif;
  overflow-wrap: break-word;
}

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.heroBackdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image:
    linear-gradient(
      165deg,
      rgba(35, 18, 28, 0.45) 0%,
      rgba(12, 8, 14, 0.82) 42%,
      rgba(6, 4, 9, 0.96) 100%
    ),
    linear-gradient(100deg, rgba(160, 48, 48, 0.12) 0%, transparent 50%);
}

.heroContent {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
  max-width: 800px;
}

.kicker {
  font-family: var(--lmgo-body);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--lmgo-accent);
  margin-bottom: 0.5rem;
}

.title {
  font-family: var(--lmgo-serif);
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  line-height: 0.9;
  margin-bottom: 1rem;
  color: white;
}

.subtitle {
  font-family: var(--lmgo-body);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 400;
  line-height: 1.4;
  color: rgba(245, 242, 238, 0.8);
  margin-bottom: 2rem;
}

/* Skip links for accessibility */
.skipLink {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--lmgo-accent);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  z-index: 9999;
  transition: top 0.3s ease;
}

.skipLink:focus {
  top: 6px;
  outline: 2px solid var(--lmgo-accent);
  outline-offset: 2px;
}

/* Navigation transparency for this page */
:global(.lmgo-active) .mcc-nav,
:global([data-page="one-nation-divided"]) .mcc-nav {
  background: transparent;
  backdrop-filter: none;
}
`;

export function injectCriticalCSS() {
  if (typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.id = 'critical-css';
  style.textContent = criticalCSS;
  document.head.appendChild(style);
  
  // Remove critical CSS after page load to allow full CSS to take over
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 1000);
  });
}
