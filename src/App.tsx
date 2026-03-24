import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from "@/components/ui/button"
import './App.css'
import { Assignments } from './Assignments'

export function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const [dpBlastPhoto, setDpBlastPhoto] = useState<string | null>(null);
  const [dpBlastScale, setDpBlastScale] = useState(1);
  const [dpBlastOffsetX, setDpBlastOffsetX] = useState(0);
  const [dpBlastOffsetY, setDpBlastOffsetY] = useState(0);
  const toastTimeoutRef = useRef<number | null>(null);
  const dpBlastStageRef = useRef<HTMLDivElement | null>(null);
  const partnerLogos = [
    { src: '/city-iloilo-logo.png', alt: 'City of Iloilo logo', label: 'Iloilo City' },
    { src: '/pasuc-logo.png', alt: 'PASUC logo', label: 'PASUC' },
    { src: '/wvsu-logo.png', alt: 'West Visayas State University logo', label: 'WVSU' },
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealItems = gsap.utils.toArray<HTMLElement>('.reveal');
    let revealContext: gsap.Context | null = null;

    if (!prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add('reveal-ready'));

      revealContext = gsap.context(() => {
        revealItems.forEach((item, index) => {
          gsap.set(item, { autoAlpha: 0, y: 24 });

          gsap.to(item, {
            autoAlpha: 1,
            y: 0,
            duration: 0.82,
            ease: 'power3.out',
            delay: Math.min(index * 0.03, 0.18),
            scrollTrigger: {
              trigger: item,
              start: 'top 86%',
              once: true,
            },
          });
        });
      });
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      if (isScrollingRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, {
      threshold: 0.35,
      rootMargin: '-10% 0px -45% 0px'
    });

    const sections = document.querySelectorAll('main section[id], header[id]');
    sections.forEach((section) => sectionObserver.observe(section));

    return () => {
      revealItems.forEach((item) => item.classList.remove('reveal-ready'));
      revealContext?.revert();
      sectionObserver.disconnect();
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 1800);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${text} copied`);
    } catch (error) {
      showToast('Clipboard unavailable');
      console.error('Unable to copy color token.', error);
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();

    isScrollingRef.current = true;
    setActiveSection(id === 'top' ? 'overview' : id);

    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);

    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        // Negative 30px offset so the header doesn't cover the title
        const y = element.getBoundingClientRect().top + window.scrollY - 30;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    setIsNavOpen(false);
  };

  const handleDpBlastUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDpBlastPhoto(reader.result);
        showToast('DP photo loaded');
      }
    };
    reader.readAsDataURL(file);
  };

  const resetDpBlast = () => {
    setDpBlastScale(1);
    setDpBlastOffsetX(0);
    setDpBlastOffsetY(0);
  };

  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

  const downloadDpBlast = async () => {
    if (!dpBlastPhoto) {
      showToast('Upload a photo first');
      return;
    }

    try {
      const [userImage, frameImage] = await Promise.all([
        loadImage(dpBlastPhoto),
        loadImage('/dp-blast-facebook.png'),
      ]);

      const canvas = document.createElement('canvas');
      const outputWidth = frameImage.naturalWidth;
      const outputHeight = frameImage.naturalHeight;
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showToast('Unable to create download');
        return;
      }

      const stageWidth = dpBlastStageRef.current?.clientWidth ?? outputWidth;
      const stageHeight = dpBlastStageRef.current?.clientHeight ?? outputHeight;
      const ratioX = outputWidth / stageWidth;
      const ratioY = outputHeight / stageHeight;
      const adjustedOffsetX = dpBlastOffsetX * ratioX;
      const adjustedOffsetY = dpBlastOffsetY * ratioY;

      const baseScale = Math.max(outputWidth / userImage.naturalWidth, outputHeight / userImage.naturalHeight);
      const drawWidth = userImage.naturalWidth * baseScale;
      const drawHeight = userImage.naturalHeight * baseScale;
      const drawX = (outputWidth - drawWidth) / 2;
      const drawY = (outputHeight - drawHeight) / 2;

      ctx.save();
      ctx.translate((outputWidth / 2) + adjustedOffsetX, (outputHeight / 2) + adjustedOffsetY);
      ctx.scale(dpBlastScale, dpBlastScale);
      ctx.drawImage(userImage, drawX - (outputWidth / 2), drawY - (outputHeight / 2), drawWidth, drawHeight);
      ctx.restore();

      ctx.drawImage(frameImage, 0, 0, outputWidth, outputHeight);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'ncaf-dp-blast.png';
      link.click();

      showToast('DP blast downloaded');
    } catch (error) {
      showToast('Unable to download DP blast');
      console.error('DP blast download failed.', error);
    }
  };

  return (
    <div className="page-shell">
      <header className="hero" id="top">
        <div className="hero-backdrop" aria-hidden="true">
          <span className="hero-orb orb-green"></span>
          <span className="hero-orb orb-orange"></span>
          <span className="hero-orb orb-purple"></span>
        </div>

        <div className="container hero-grid">
          <div className="hero-copy reveal">
            <p className="eyebrow">2026 National Culture and Arts Festival</p>
            <h1>Celebrating the Riches of Our Roots, retold as a cultural brand system.</h1>
            <p className="hero-lead">
              This guide turns the NCAF identity into an immersive, modern, and deeply rooted visual language.
              It blends heritage, celebration, and contemporary editorial design so every touchpoint feels
              proudly Filipino, premium, and alive.
            </p>

            <div className="hero-actions">
              <Button className="btn-primary py-6" asChild>
                <a href="#brand-assets" onClick={(e) => scrollToSection(e, 'brand-assets')}>Explore asset examples</a>
              </Button>
              <Button variant="outline" className="btn-secondary py-6" asChild>
                <a href="#colors" onClick={(e) => scrollToSection(e, 'colors')}>Review the palette</a>
              </Button>
            </div>

            <div className="hero-highlights">
              <article className="highlight-card">
                <span className="highlight-number">4</span>
                <p>Core brand tones grounded in heritage and celebration.</p>
              </article>
              <article className="highlight-card">
                <span className="highlight-number">5</span>
                <p>Ready-to-reference social and pubmat mockups for rollout.</p>
              </article>
              <article className="highlight-card">
                <span className="highlight-number">1</span>
                <p>Editorial direction tying motion, typography, and culture together.</p>
              </article>
            </div>
          </div>

          <div className="hero-panel reveal">
            <div className="hero-logo-card glass-panel">
              <img src="/brand-logo.png" alt="NCAF 2026 logo" className="logo" />
              <div className="panel-copy">
                <p className="panel-label">Creative North Star</p>
                <h2>The Cultural Tapestry</h2>
                <p>Organic layers, floating movement, and ceremonial warmth inspired by festival banners, woven textiles, and stage lighting.</p>
              </div>
            </div>

            <div className="hero-moodboard">
              <article className="mood-tile weave">
                <span className="tile-label">Texture</span>
                <strong>Woven rhythm</strong>
              </article>
              <article className="mood-tile chant">
                <span className="tile-label">Motion</span>
                <strong>Processional flow</strong>
              </article>
              <article className="mood-tile archive">
                <span className="tile-label">Tone</span>
                <strong>Warm royal culture</strong>
              </article>
            </div>
          </div>
        </div>
      </header>

      <nav className="site-nav">
        <div className="container nav-inner">
          <a href="#top" className="nav-brand" onClick={(e) => scrollToSection(e, 'top')}>NCAF 2026</a>

          <div className="page-switcher hidden md:flex">
            <button aria-current={activeSection !== 'assignments' ? 'page' : undefined} className={activeSection !== 'assignments' ? 'active' : ''} onClick={(e) => scrollToSection(e, 'top')}>Brand System</button>
            <button aria-current={activeSection === 'assignments' ? 'page' : undefined} className={activeSection === 'assignments' ? 'active' : ''} onClick={(e) => scrollToSection(e, 'assignments')}>Assignments</button>
          </div>

          <button
            className={`nav-toggle ${isNavOpen ? 'is-open' : ''}`}
            type="button"
            aria-expanded={isNavOpen}
            aria-controls="primary-nav"
            aria-label={isNavOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <span className="nav-toggle-icon"></span>
            <span className="nav-toggle-icon"></span>
            <span className="nav-toggle-icon"></span>
          </button>

          <ul className={`nav-links ${isNavOpen ? 'is-open' : ''} mobile-only`} id="primary-nav">
            <li>
              <a href="#top" onClick={(e) => { scrollToSection(e, 'top'); setIsNavOpen(false); }} className={activeSection !== 'assignments' ? 'is-active' : ''}>Brand System</a>
            </li>
            <li>
              <a href="#assignments" onClick={(e) => { scrollToSection(e, 'assignments'); setIsNavOpen(false); }} className={activeSection === 'assignments' ? 'is-active' : ''}>Assignments</a>
            </li>
            <li className="nav-divider"></li>
            <li><a href="#overview" className={activeSection === 'overview' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'overview')}>Story</a></li>
            <li><a href="#logo" className={activeSection === 'logo' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'logo')}>Logo</a></li>
            <li><a href="#colors" className={activeSection === 'colors' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'colors')}>Palette</a></li>
            <li><a href="#patterns" className={activeSection === 'patterns' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'patterns')}>Patterns</a></li>
            <li><a href="#typography" className={activeSection === 'typography' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'typography')}>Type</a></li>
            <li><a href="#voice" className={activeSection === 'voice' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'voice')}>Voice</a></li>
            <li><a href="#photography" className={activeSection === 'photography' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'photography')}>Photo</a></li>
            <li><a href="#grid" className={activeSection === 'grid' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'grid')}>Grid</a></li>
            <li><a href="#motion" className={activeSection === 'motion' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'motion')}>Motion</a></li>
            <li><a href="#experience" className={activeSection === 'experience' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'experience')}>Layers</a></li>
            <li><a href="#accessibility" className={activeSection === 'accessibility' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'accessibility')}>A11y</a></li>
            <li><a href="#brand-assets" className={activeSection === 'brand-assets' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'brand-assets')}>Assets</a></li>
            <li><a href="#dos-donts" className={activeSection === 'dos-donts' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'dos-donts')}>Rules</a></li>
          </ul>
        </div>

        <div className={`container sub-nav-inner hidden md:flex transition-opacity duration-300 ${activeSection === 'assignments' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <ul className="sub-nav-links">
            <li><a href="#overview" className={activeSection === 'overview' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'overview')}>Story</a></li>
            <li><a href="#logo" className={activeSection === 'logo' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'logo')}>Logo</a></li>
            <li><a href="#colors" className={activeSection === 'colors' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'colors')}>Palette</a></li>
            <li><a href="#patterns" className={activeSection === 'patterns' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'patterns')}>Patterns</a></li>
            <li><a href="#typography" className={activeSection === 'typography' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'typography')}>Type</a></li>
            <li><a href="#voice" className={activeSection === 'voice' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'voice')}>Voice</a></li>
            <li><a href="#photography" className={activeSection === 'photography' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'photography')}>Photo</a></li>
            <li><a href="#grid" className={activeSection === 'grid' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'grid')}>Grid</a></li>
            <li><a href="#motion" className={activeSection === 'motion' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'motion')}>Motion</a></li>
            <li><a href="#experience" className={activeSection === 'experience' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'experience')}>Layers</a></li>
            <li><a href="#accessibility" className={activeSection === 'accessibility' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'accessibility')}>A11y</a></li>
            <li><a href="#brand-assets" className={activeSection === 'brand-assets' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'brand-assets')}>Assets</a></li>
            <li><a href="#dos-donts" className={activeSection === 'dos-donts' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'dos-donts')}>Rules</a></li>
          </ul>
        </div>
      </nav>

      <main>
        {/* ── BRAND NARRATIVE ───────────────────────────────────────────── */}
        <section id="overview" className="section section-story reveal">
          <div className="container section-grid">
            <div className="section-intro">
              <p className="section-kicker">Brand narrative</p>
              <h2>Designing a festival that feels ceremonial, contemporary, and communal.</h2>
            </div>

            <div className="story-layout">
              <article className="story-card">
                <h3>What this identity should evoke</h3>
                <p>
                  NCAF should feel like a living exhibition: textured, warm, and celebratory. The interface must
                  move beyond generic event branding and instead mirror the rhythm of processions, woven craft,
                  stage curtains, and oral storytelling.
                </p>
              </article>

              <article className="story-card feature-list">
                <h3>Design pillars</h3>
                <ul>
                  <li><strong>Dynamic asymmetry:</strong> layered compositions that feel curated, not boxed in.</li>
                  <li><strong>Cultural warmth:</strong> cream surfaces, jewel tones, and handcrafted textures.</li>
                  <li><strong>Editorial clarity:</strong> generous spacing and readable information flow.</li>
                  <li><strong>Ceremonial motion:</strong> gentle upward reveals and elegant transitions.</li>
                </ul>
              </article>

              <aside className="story-aside glass-panel">
                <p className="panel-label">Use this site for</p>
                <ul className="usage-list">
                  <li>Building campaign decks and presentations</li>
                  <li>Guiding social media creatives and caption cards</li>
                  <li>Creating event banners, countdowns, and announcements</li>
                  <li>Aligning digital teams on a shared visual voice</li>
                </ul>
              </aside>
            </div>
          </div>
        </section>

        {/* ── LOGO SYSTEM ───────────────────────────────────────────────── */}
        <section id="logo" className="section section-logo reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Logo system</p>
              <h2>Give the cultural swoosh room to breathe.</h2>
              <p className="section-lead">
                The NCAF logo carries the full weight of the festival's identity. Consistent, respectful use preserves its ceremonial presence across every touchpoint.
              </p>
            </div>

            <div className="logo-rules-grid">
              <article className="logo-rule-card clearspace-card">
                <h3>Clear Space</h3>
                <p>Maintain a minimum clear space equal to half the logo's height on all four sides. No text, other marks, or graphic elements may enter this zone.</p>
                <div className="clearspace-demo">
                  <div className="clearspace-outer">
                    <img src="/brand-logo.png" alt="NCAF logo clear space demonstration" className="clearspace-logo" />
                  </div>
                  <p className="clearspace-caption">½ logo height on all sides</p>
                </div>
              </article>

              <article className="logo-rule-card">
                <h3>Approved Surfaces</h3>
                <p>The logo may appear on these backgrounds. Always verify sufficient contrast before placing on photographic or textured surfaces.</p>
                <div className="logo-bg-grid">
                  {[
                    { bg: '#FEFCF1', label: 'Woven Bone', dark: true },
                    { bg: '#406E51', label: 'Heritage Green', dark: false },
                    { bg: '#383831', label: 'On-Surface', dark: false },
                    { bg: '#F7F2E7', label: 'Surface Low', dark: true },
                  ].map(surf => (
                    <div key={surf.bg} className={`logo-bg-swatch ${surf.dark ? 'swatch-dark-label' : 'swatch-light-label'}`} style={{ background: surf.bg }}>
                      <img src={surf.dark ? '/brand-logo.png' : '/logo-white-mono.svg'} alt="" className={`bg-swatch-logo ${surf.dark ? '' : 'invert-logo'}`} />
                      <span className="bg-label">{surf.label}</span>
                      <span className="bg-approved-tag" aria-label="approved">✓</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="logo-rule-card prohibitions-card">
                <h3>Never Do This</h3>
                <ul className="prohibition-list">
                  <li><span className="prohibition-x" aria-hidden="true">✕</span><span><strong>Stretch or distort</strong> the logo's proportions in any direction.</span></li>
                  <li><span className="prohibition-x" aria-hidden="true">✕</span><span><strong>Recolor</strong> using off-brand or unapproved palette colors.</span></li>
                  <li><span className="prohibition-x" aria-hidden="true">✕</span><span><strong>Apply effects</strong> — no drop shadows, glows, bevels, or outlines.</span></li>
                  <li><span className="prohibition-x" aria-hidden="true">✕</span><span><strong>Rotate</strong> the logo at any angle.</span></li>
                  <li><span className="prohibition-x" aria-hidden="true">✕</span><span><strong>Place on busy</strong> photographic or densely patterned backgrounds.</span></li>
                  <li><span className="prohibition-x" aria-hidden="true">✕</span><span><strong>Use below minimum size:</strong> 48px digital · 15mm print.</span></li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ── COLOR PALETTE ─────────────────────────────────────────────── */}
        <section id="colors" className="section section-palette reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Color philosophy</p>
              <h2>A palette with memory, prestige, and celebration built into every tone.</h2>
            </div>

            <p className="section-lead">
              The brand utilizes a refined core of four legacy tones, balanced against neutral surface layers to maintain accessibility.
            </p>

            <div className="color-palette">
              {[
                {
                  name: 'Heritage Green',
                  hex: '#406E51',
                  label: 'Primary',
                  meaning: 'Represents rooted identity, stewardship, and the living continuity of tradition.'
                },
                {
                  name: 'Pagsaulog Orange',
                  hex: '#9C5000',
                  label: 'Secondary',
                  meaning: 'Carries festive warmth, collective joy, and the energy of community celebration.'
                },
                {
                  name: 'Royal Culture',
                  hex: '#834AAE',
                  label: 'Tertiary',
                  meaning: 'Signals cultural prestige, creative depth, and the ceremonial spirit of the festival.'
                },
                {
                  name: 'Woven Bone',
                  hex: '#FEFCF1',
                  label: 'Surface',
                  light: true,
                  meaning: 'Provides a calm, archival backdrop inspired by woven fibers, paper, and heritage crafts.'
                },
              ].map((color) => (
                <article className="color-card" key={color.hex}>
                  <div className={`color-swatch ${color.light ? 'light-swatch' : ''}`} style={{ backgroundColor: color.hex }}></div>
                  <div className="color-details">
                    <span className="asset-type">{color.label}</span>
                    <p className="color-name">{color.name}</p>
                    <button
                      className="color-token"
                      data-copy={color.hex}
                      onClick={() => copyToClipboard(color.hex)}
                    >
                      <span className="color-token-icon" aria-hidden="true">⧉</span>
                      <span>{color.hex}</span>
                    </button>
                    <p className="color-meaning">{color.meaning}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="guideline-grid">
              <article className="guideline-card">
                <h3>The "No-Line" Rule</h3>
                <p>Boundaries are defined by tonal shifts and organic curves, never by 1px solid borders.</p>
              </article>
              <article className="guideline-card">
                <h3>Textural Depth</h3>
                <p>Use glassmorphism and subtle gradients to mimic the tactile finish of silk and woven textiles.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ── PATTERN LANGUAGE ──────────────────────────────────────────── */}
        <section id="patterns" className="section section-patterns reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Pattern language</p>
              <h2>Cultural repeating patterns for social cards, posters, and stage mockups.</h2>
              <p className="section-lead">
                Use these motifs as overlays, section fills, or corner accents. The expanded set includes references to Filipino dream weaving rhythms for deeper cultural texture.
              </p>
            </div>

            <div className="pattern-grid">
              <article className="pattern-card">
                <div className="pattern-preview pattern-banig"></div>
                <div className="pattern-meta">
                  <p className="asset-type">Banig Weave</p>
                  <h3>Woven Rhythm</h3>
                  <p className="asset-note">Cross-thread geometry inspired by handwoven mats. Best for hero backgrounds and presentation covers.</p>
                  <div className="pattern-download-group">
                    <a className="pattern-download" href="/patterns/banig-weave.svg" download>SVG Pattern</a>
                    <a className="pattern-download pattern-download-overlay" href="/patterns/banig-weave-overlay.svg" download>SVG Overlay</a>
                  </div>
                </div>
              </article>

              <article className="pattern-card">
                <div className="pattern-preview pattern-kulintang"></div>
                <div className="pattern-meta">
                  <p className="asset-type">Kulintang Echo</p>
                  <h3>Festival Pulse</h3>
                  <p className="asset-note">Repeating arcs that mimic percussion resonance. Ideal for countdown cards and story templates.</p>
                  <div className="pattern-download-group">
                    <a className="pattern-download" href="/patterns/kulintang-echo.svg" download>SVG Pattern</a>
                    <a className="pattern-download pattern-download-overlay" href="/patterns/kulintang-echo-overlay.svg" download>SVG Overlay</a>
                  </div>
                </div>
              </article>

              <article className="pattern-card">
                <div className="pattern-preview pattern-vinta"></div>
                <div className="pattern-meta">
                  <p className="asset-type">Vinta Sails</p>
                  <h3>Processional Stripes</h3>
                  <p className="asset-note">Layered directional bands suggesting movement and celebration. Works well in banner and tarp mockups.</p>
                  <div className="pattern-download-group">
                    <a className="pattern-download" href="/patterns/vinta-sails.svg" download>SVG Pattern</a>
                    <a className="pattern-download pattern-download-overlay" href="/patterns/vinta-sails-overlay.svg" download>SVG Overlay</a>
                  </div>
                </div>
              </article>

              <article className="pattern-card">
                <div className="pattern-preview pattern-tnalak"></div>
                <div className="pattern-meta">
                  <p className="asset-type">T'nalak Tribute</p>
                  <h3>T'nalak Memory</h3>
                  <p className="asset-note">Interlocking diagonals inspired by sacred cloth rhythm. Use for hero overlays and ceremonial title cards.</p>
                  <div className="pattern-download-group">
                    <a className="pattern-download" href="/patterns/tnalak-memory.svg" download>SVG Pattern</a>
                    <a className="pattern-download pattern-download-overlay" href="/patterns/tnalak-memory-overlay.svg" download>SVG Overlay</a>
                  </div>
                </div>
              </article>

              <article className="pattern-card">
                <div className="pattern-preview pattern-loom"></div>
                <div className="pattern-meta">
                  <p className="asset-type">Loom Heritage</p>
                  <h3>Loom Pathways</h3>
                  <p className="asset-note">Layered stripe pathways echoing hand-guided loom movement. Great for section dividers and carousel backgrounds.</p>
                  <div className="pattern-download-group">
                    <a className="pattern-download" href="/patterns/loom-pathways.svg" download>SVG Pattern</a>
                    <a className="pattern-download pattern-download-overlay" href="/patterns/loom-pathways-overlay.svg" download>SVG Overlay</a>
                  </div>
                </div>
              </article>

              <article className="pattern-card">
                <div className="pattern-preview pattern-sikad"></div>
                <div className="pattern-meta">
                  <p className="asset-type">Ancestral Motif</p>
                  <h3>Dream Step Motif</h3>
                  <p className="asset-note">Stepped geometric repetition with soft color cadence. Ideal for poster borders and lower-third accents.</p>
                  <div className="pattern-download-group">
                    <a className="pattern-download" href="/patterns/dream-step-motif.svg" download>SVG Pattern</a>
                    <a className="pattern-download pattern-download-overlay" href="/patterns/dream-step-motif-overlay.svg" download>SVG Overlay</a>
                  </div>
                </div>
              </article>
            </div>

            <div className="pattern-guidelines">
              <article className="guideline-card">
                <h3>Usage ratio</h3>
                <p>Keep motifs between 8% and 18% opacity in content-heavy layouts to preserve readability.</p>
              </article>
              <article className="guideline-card">
                <h3>Layering rule</h3>
                <p>Place patterns behind cards or fade them into corners. Avoid placing dense motifs directly beneath body text.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ── TYPOGRAPHY ────────────────────────────────────────────────── */}
        <section id="typography" className="section section-typography reveal">
          <div className="container section-grid two-up">
            <div className="section-intro">
              <p className="section-kicker">Typography</p>
              <h2>A dialogue between tradition and clarity.</h2>
              <p className="section-lead">
                We pair a bold, celebratory serif for headlines with a clean, functional sans-serif for body copy.
              </p>
              <div className="usage-tips">
                <div className="chip">Display: Noto Serif</div>
                <div className="chip">Body: Jakarta Sans</div>
              </div>
            </div>

            <div className="type-showcase">
              <article className="type-card serif-card">
                <p className="type-label">Headlines & Display</p>
                <h3 className="display-sample">Pagsaulog 2026</h3>
                <p>Noto Serif Bold. Use for ceremonial moments and major section titles.</p>
              </article>
              <article className="type-card sans-card">
                <p className="type-label">Body & Functional</p>
                <p className="body-sample">
                  The quick brown fox jumps over the lazy dog. Plus Jakarta Sans provides a modern counterpoint to the prestigious serif.
                </p>
                <p>Plus Jakarta Sans. Use for readability and metadata.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ── VOICE & TONE ──────────────────────────────────────────────── */}
        <section id="voice" className="section section-voice reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Voice & tone</p>
              <h2>The festival speaks with pride, warmth, and cultural conviction.</h2>
              <p className="section-lead">
                Visual and verbal identity are inseparable. Every caption, headline, and announcement — from inter-university competition calls to cultural showcase invitations — should feel as carefully crafted as the design it accompanies.
              </p>
            </div>

            <div className="voice-grid">
              <article className="voice-personality-card story-card">
                <h3>Brand Personality</h3>
                <p>When the brand speaks, it should feel like all of these traits at once:</p>
                <div className="personality-chips">
                  {['Ceremonial', 'Communal', 'Proud', 'Warm', 'Inviting', 'Living Heritage', 'Editorial', 'Contemporary'].map(word => (
                    <span key={word} className="personality-chip">{word}</span>
                  ))}
                </div>
              </article>

              <article className="tone-spectrum-card story-card">
                <h3>Tone by Context</h3>
                <div className="tone-rows">
                  {[
                    { context: 'Official announcements', position: 85, desc: 'Formal, ceremonial' },
                    { context: 'Social captions', position: 40, desc: 'Warm, conversational' },
                    { context: 'Event programs', position: 70, desc: 'Editorial, precise' },
                    { context: 'Countdown teasers', position: 25, desc: 'Energetic, celebratory' },
                  ].map(row => (
                    <div key={row.context} className="tone-row">
                      <span className="tone-context">{row.context}</span>
                      <div className="tone-track">
                        <div className="tone-handle" style={{ left: `${row.position}%` }}></div>
                      </div>
                      <span className="tone-desc">{row.desc}</span>
                    </div>
                  ))}
                  <div className="tone-axis">
                    <span>Playful</span>
                    <span>Formal</span>
                  </div>
                </div>
              </article>

              <div className="copy-examples-grid">
                <article className="copy-example copy-do">
                  <span className="copy-label copy-label-do">Write like this</span>
                  <p className="copy-sample">"Witness the finest student artists from universities across the Philippines converge in Iloilo — weaving, performing, and competing in a celebration of living Filipino culture."</p>
                </article>
                <article className="copy-example copy-dont">
                  <span className="copy-label copy-label-dont">Not like this</span>
                  <p className="copy-sample">"NCAF 2026 is a competition where universities will compete in different events. Students will perform in front of the judges in Iloilo."</p>
                </article>
              </div>

              <article className="language-card glass-panel">
                <h3>Language Integration</h3>
                <p>NCAF touchpoints may use Filipino, Hiligaynon, or English. Follow these three principles:</p>
                <ul className="usage-list">
                  <li><strong>Lead in the local tongue</strong> for community-facing content; follow with an English translation where needed.</li>
                  <li><strong>Never mix languages within a single headline.</strong> Keep it all-Filipino or all-English.</li>
                  <li><strong>Use culturally resonant words</strong> — pagsaulog, katutubong sining, kultura — rather than generic English translations.</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ── PHOTOGRAPHY ───────────────────────────────────────────────── */}
        <section id="photography" className="section section-photography reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Photography direction</p>
              <h2>Images that carry the weight of heritage and the energy of celebration.</h2>
              <p className="section-lead">
                Photography is where the brand meets reality. Every image chosen or commissioned for NCAF should carry the same warmth, depth, and ceremony as the visual identity.
              </p>
            </div>

            <div className="photo-guide-grid">
              <article className="photo-style-card">
                <div className="photo-style-preview photo-cultural-moments"></div>
                <div className="photo-style-meta">
                  <span className="asset-type">Style 01</span>
                  <h3>Cultural Moments</h3>
                  <p className="asset-note">Wide ceremonial compositions and crowd energy in festive dress. Favor warm-shifted grading that echoes Heritage Green and Pagsaulog Orange in the shadows.</p>
                </div>
              </article>
              <article className="photo-style-card">
                <div className="photo-style-preview photo-craft-detail"></div>
                <div className="photo-style-meta">
                  <span className="asset-type">Style 02</span>
                  <h3>Craft & Texture Detail</h3>
                  <p className="asset-note">Tight, shallow-depth shots of weaving, pottery, and traditional garments. Texture should feel tangible. Prefer natural and warm artificial light sources.</p>
                </div>
              </article>
              <article className="photo-style-card">
                <div className="photo-style-preview photo-stage-energy"></div>
                <div className="photo-style-meta">
                  <span className="asset-type">Style 03</span>
                  <h3>Stage Energy</h3>
                  <p className="asset-note">High-contrast performance shots where stage lighting echoes the brand palette — deep greens, ceremonial oranges, and royal purples define the shadows.</p>
                </div>
              </article>
            </div>

            <div className="photo-avoid-section">
              <h3 className="photo-avoid-heading">Avoid</h3>
              <div className="photo-avoid-grid">
                {[
                  'Cold, desaturated, or blue-shifted color grading.',
                  'Generic stock photography that lacks cultural specificity.',
                  'Flat, overexposed images with no tonal depth or shadow.',
                  'Modern, unrelated settings that dilute the festive context.',
                ].map(text => (
                  <div key={text} className="photo-avoid-item">
                    <span className="prohibition-x" aria-hidden="true">✕</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── GRID & SPACING ────────────────────────────────────────────── */}
        <section id="grid" className="section section-grid-spacing reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Grid & spacing</p>
              <h2>Structure that breathes.</h2>
              <p className="section-lead">
                The brand's "generous spacing" principle requires a concrete scale. All layout decisions — digital and print — draw from these named values.
              </p>
            </div>

            <div className="spacing-scale">
              {[
                { name: 'XS', px: 4, use: 'Icon gap, chip padding' },
                { name: 'S', px: 8, use: 'Tight element grouping' },
                { name: 'M', px: 16, use: 'Component padding, form fields' },
                { name: 'L', px: 24, use: 'Card inner padding, item gaps' },
                { name: 'XL', px: 48, use: 'Between sections on mobile' },
                { name: '2XL', px: 80, use: 'Vertical section rhythm on desktop' },
                { name: '3XL', px: 128, use: 'Hero section vertical padding' },
              ].map(step => (
                <div key={step.name} className="spacing-row">
                  <span className="spacing-name">{step.name}</span>
                  <div className="spacing-bar-track">
                    <div className="spacing-bar" style={{ width: `${Math.min(step.px * 1.8, 100)}%` }}></div>
                  </div>
                  <span className="spacing-value">{step.px}px</span>
                  <span className="spacing-use">{step.use}</span>
                </div>
              ))}
            </div>

            <div className="grid-specs">
              <article className="grid-spec-card story-card">
                <h3>Digital Grid</h3>
                <ul className="usage-list">
                  <li><strong>Desktop:</strong> 12-column · 80px gutters · max-width 78rem</li>
                  <li><strong>Tablet:</strong> 8-column · 40px gutters · breakpoint ≤ 1080px</li>
                  <li><strong>Mobile:</strong> 4-column · 16px gutters · breakpoint ≤ 760px</li>
                </ul>
              </article>
              <article className="grid-spec-card story-card">
                <h3>Print Grid</h3>
                <ul className="usage-list">
                  <li><strong>A3 Poster:</strong> 6-column · 8mm gutters · 15mm margins</li>
                  <li><strong>Banner / Tarpaulin:</strong> Logo zone left 25% · content zone right 75%</li>
                  <li><strong>Stage backdrop:</strong> Center-safe zone 60% · bleed on all sides 10%</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ── MOTION SYSTEM ─────────────────────────────────────────────── */}
        <section id="motion" className="section section-motion reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Motion system</p>
              <h2>Gentle, intentional, ceremonial.</h2>
              <p className="section-lead">
                Animation should feel like a cultural procession — purposeful and graceful, never abrupt or gratuitous. Hover each tier below to feel the difference in pace.
              </p>
            </div>

            <div className="motion-grid">
              {[
                { name: 'Micro', value: '200ms', ease: 'ease', color: 'var(--primary)', use: 'Hover states, tooltip reveals, icon transitions' },
                { name: 'Standard', value: '350ms', ease: 'cubic-bezier(0.4, 0, 0.2, 1)', color: 'var(--secondary)', use: 'Navigation, card state changes, colour transitions' },
                { name: 'Hero', value: '700ms', ease: 'cubic-bezier(0.4, 0, 0.2, 1)', color: 'var(--tertiary)', use: 'Page entry reveals, section transitions, hero elements' },
                { name: 'Ceremonial', value: '1200ms', ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)', color: 'var(--primary)', use: 'Logo entrance, celebration moments, countdown reveals' },
              ].map(tier => (
                <article key={tier.name} className={`motion-card motion-card-${tier.name.toLowerCase()}`}>
                  <div className="motion-demo-wrap" aria-hidden="true">
                    <div className="motion-demo-track">
                      <div className="motion-demo-dot" style={{ background: tier.color }}></div>
                    </div>
                  </div>
                  <div className="motion-meta">
                    <span className="asset-type">{tier.name}</span>
                    <p className="motion-value">{tier.value}</p>
                    <p className="motion-ease"><code>{tier.ease}</code></p>
                    <p className="motion-use">{tier.use}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="guideline-grid">
              <article className="guideline-card">
                <h3>What should move</h3>
                <p>Entry reveals, hover lifts, active states, toast notifications, navigation transitions, and logo appearance animations.</p>
              </article>
              <article className="guideline-card">
                <h3>What stays still</h3>
                <p>Body text blocks, data tables, color swatches, and utility elements. Motion is a reward, not a default.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ── INTERACTIVE LAYERS ────────────────────────────────────────── */}
        <section id="experience" className="section section-experience reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Interactive experience</p>
              <h2>Layers that feel alive.</h2>
            </div>

            <div className="experience-grid">
              <div className="layer-demo">
                <div className="layer-card layer-base">
                  <p className="asset-tag">Layer 01</p>
                  <strong>Foundation</strong>
                </div>
                <div className="layer-card layer-mid">
                  <p className="asset-tag">Layer 02</p>
                  <strong>Content</strong>
                </div>
                <div className="layer-card layer-top">
                  <p className="asset-tag">Layer 03</p>
                  <strong>Celebration</strong>
                </div>
              </div>

              <article className="experience-copy">
                <h3>Stacking depth</h3>
                <p>We avoid standard shadows. Depth is achieved by stacking three tiers of surface tones:</p>
                <ul>
                  <li><strong>Lowest:</strong> Warm base for the main page shell.</li>
                  <li><strong>Low:</strong> Secondary containers and grouped items.</li>
                  <li><strong>Highest:</strong> Highlights and interactive cards.</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ── ACCESSIBILITY ─────────────────────────────────────────────── */}
        <section id="accessibility" className="section section-accessibility reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Accessibility</p>
              <h2>Inclusive design is non-negotiable.</h2>
              <p className="section-lead">
                All NCAF digital touchpoints must meet WCAG 2.1 AA as a minimum. The color pairs below have been verified — only these combinations are approved for body text and UI labels.
              </p>
            </div>

            <div className="contrast-grid">
              {[
                { fg: '#383831', bg: '#FEFCF1', fgName: 'On-Surface', bgName: 'Woven Bone', ratio: '11.4:1', level: 'AAA' },
                { fg: '#406E51', bg: '#FEFCF1', fgName: 'Heritage Green', bgName: 'Woven Bone', ratio: '5.9:1', level: 'AA' },
                { fg: '#9C5000', bg: '#FEFCF1', fgName: 'Pagsaulog Orange', bgName: 'Woven Bone', ratio: '5.8:1', level: 'AA' },
                { fg: '#834AAE', bg: '#FEFCF1', fgName: 'Royal Culture', bgName: 'Woven Bone', ratio: '5.9:1', level: 'AA' },
                { fg: '#FFFFFF', bg: '#406E51', fgName: 'White', bgName: 'Heritage Green', ratio: '6.0:1', level: 'AA' },
                { fg: '#FFFFFF', bg: '#9C5000', fgName: 'White', bgName: 'Pagsaulog Orange', ratio: '5.9:1', level: 'AA' },
                { fg: '#FFFFFF', bg: '#834AAE', fgName: 'White', bgName: 'Royal Culture', ratio: '5.9:1', level: 'AA' },
                { fg: '#FFFFFF', bg: '#383831', fgName: 'White', bgName: 'On-Surface', ratio: '12.6:1', level: 'AAA' },
              ].map(pair => (
                <article key={`${pair.fg}-${pair.bg}`} className="contrast-card" style={{ background: pair.bg }}>
                  <p className="contrast-sample" style={{ color: pair.fg }}>Aa</p>
                  <p className="contrast-pair-name" style={{ color: pair.fg }}>{pair.fgName}<br />on {pair.bgName}</p>
                  <div className="contrast-badge-row">
                    <span className="contrast-badge" style={{ color: pair.fg, borderColor: pair.fg }}>{pair.level}</span>
                    <span className="contrast-ratio" style={{ color: pair.fg }}>{pair.ratio}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="guideline-grid">
              <article className="guideline-card">
                <h3>Focus States</h3>
                <p>All interactive elements must have a visible focus ring. Use Royal Culture (#834AAE) at 2px solid with 2px offset — never remove the browser default without a branded replacement.</p>
              </article>
              <article className="guideline-card">
                <h3>Reduced Motion</h3>
                <p>All reveal animations respect <code>prefers-reduced-motion</code>. When the system preference is set, elements appear instantly without transitions. Never gate content behind animation.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ── BRAND ASSETS ──────────────────────────────────────────────── */}
        <section id="brand-assets" className="section section-assets reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Brand assets</p>
              <h2>Rollout mockups &amp; usage examples.</h2>
              <p className="section-lead">
                Each mockup demonstrates how the brand system translates into real-world formats — from social headers and countdown teasers to print posters and stage banners.
              </p>
            </div>

            <div className="asset-grid">
              {/* 0. Facebook Cover Photo*/}
              <article className="asset-card fb-cover-photo-card reveal" style={{ animationDelay: '0.05s' }}>
                <div className="fb-cover-photo-canvas">
                  <img src="/facebook-cover-photo.png" alt="Facebook cover photo mockup" className="fb-cover-photo-img" />
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-social">Social</span>
                  <h3>Facebook Cover Photo</h3>
                  <p className="asset-note">Official Facebook cover photo at 1200 × 628 px.</p>
                </div>

                <a className="asset-canva-link" href="https://www.canva.com/design/DAHExgaFXo8/dVSILVk1AOB7m7p3mfjHmQ/edit?utm_content=DAHExgaFXo8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank" rel="noopener noreferrer">Open in Canva</a>
              </article>

              {/* 1. Logo Card */}
              <article className="asset-card logo-asset-card reveal" style={{ animationDelay: '0.08s' }}>
                <div className="asset-canvas landscape presentation-bg">
                  <div className="asset-texture"></div>
                  <div style={{ position: 'relative', zIndex: 10, display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/brand-logo.png" alt="NCAF 2026 Logo Lockup" style={{ width: 'auto', height: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                  </div>
                  <span className="asset-format-tag tag-dark">Logo</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-presentation">Identity</span>
                  <h3>Primary Logo Card</h3>
                  <p className="asset-note">The official NCAF 2026 logo lockup on Woven Bone base. Clean, breathable space highlighting the cultural swoosh and typography.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAHE0V1ehYc/ZulHKmQoRF65TQeMfFug8g/edit?utm_content=DAHE0V1ehYc&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>


              {/* 1. Facebook */}
              <article className="asset-card cover-photo reveal" style={{ animationDelay: '0.05s' }}>
                <div className="asset-canvas landscape cover-photo-bg">
                  <div className="asset-texture"></div>
                  <div className="cv-banig-overlay" aria-hidden="true"></div>
                  <div className="cv-layout">
                    <div className="cv-left">
                      <img src="/logo-white-mono.svg" alt="" className="cv-logo" />
                      <div className="cv-text">
                        <p className="cv-eyebrow">2026 · Iloilo City</p>
                        <h4 className="cv-headline">National Culture<br />&amp; Arts Festival</h4>
                        <p className="cv-tagline">Celebrating the Riches of Our Roots</p>
                      </div>
                    </div>
                    <div className="cv-right" aria-hidden="true">
                      <div className="cv-orb"><div className="cv-orb-inner"></div></div>
                      <span className="cv-floatmark">✦</span>
                    </div>
                  </div>
                  <div className="cv-footer-bar">
                    <span>April 2026</span>
                    <span className="cv-dot">·</span>
                    <div className="partner-lockup partner-lockup-light partner-lockup-labels cv-partner-lockup" aria-label="Event partners">
                      {partnerLogos.map((partner) => (
                        <div key={`cover-${partner.label}`} className="partner-lockup-item">
                          <img src={partner.src} alt={partner.alt} className="partner-lockup-logo" />
                          <span>{partner.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="asset-format-tag" aria-label="1200 by 628 pixels">1200 × 628</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-social">Social</span>
                  <h3>Facebook</h3>
                  <p className="asset-note">Heritage Green base with Banig weave overlay. Left-anchored layout maintains brand clarity at all thumbnail sizes.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAHE0WYmif8/zZ5u1JstKO4VaksuXkj6vA/edit?utm_content=DAHE0WYmif8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>

              {/* 2. Instagram Story Countdown */}
              <article className="asset-card countdown-card reveal" style={{ animationDelay: '0.12s' }}>
                <div className="asset-canvas portrait countdown-bg">
                  <div className="asset-texture"></div>
                  <div className="cdown-rings" aria-hidden="true">
                    <div className="cdown-ring r1"></div>
                    <div className="cdown-ring r2"></div>
                    <div className="cdown-ring r3"></div>
                  </div>
                  <div className="canvas-inset-layout cdown-layout">
                    <div className="cdown-top">
                      <img src="/logo-white-mono.svg" alt="" className="cdown-logo" />
                      <span className="cdown-brand">NCAF 2026</span>
                    </div>
                    <div className="cdown-center">
                      <span className="cdown-pre-label">Days Until</span>
                      <span className="cdown-big-number">12</span>
                      <span className="cdown-festival">Pagsaulog<br />2026</span>
                    </div>
                    <div className="cdown-bottom">
                      <span className="cdown-date-pill">April 2026 · Iloilo City</span>
                      <div className="partner-lockup partner-lockup-light partner-lockup-icons cdown-partner-lockup" aria-label="Event partners">
                        {partnerLogos.map((partner) => (
                          <div key={`countdown-${partner.label}`} className="partner-lockup-item">
                            <img src={partner.src} alt={partner.alt} className="partner-lockup-logo" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="asset-format-tag" aria-label="1080 by 1920 pixels">1080 × 1920</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-social">Social</span>
                  <h3>Instagram Story Countdown</h3>
                  <p className="asset-note">Ceremonial orange with concentric ring motifs. The display number anchors the composition as the centrepiece.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAHE0L-zbvw/ToIpetpH7TELJGBhcSFoqg/edit?utm_content=DAHE0L-zbvw&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>

              {/* 3. Announcement Card */}
              <article className="asset-card announcement-card reveal" style={{ animationDelay: '0.19s' }}>
                <div className="asset-canvas portrait announcement-bg">
                  <div className="asset-texture"></div>
                  <div className="ann-vinta-overlay" aria-hidden="true"></div>
                  <div className="canvas-inset-layout ann-layout">
                    <div className="ann-top">
                      <img src="/logo-white-mono.svg" alt="" className="ann-logo" />
                      <span className="ann-eyebrow">Official Announcement</span>
                    </div>
                    <div className="ann-body">
                      <h4 className="ann-headline">Artists &amp;<br />Performers<br />Revealed.</h4>
                      <p className="ann-sub">Cultural achievers from across the archipelago converge in Iloilo.</p>
                    </div>
                    <div className="ann-footer-bar">
                      <span className="ann-date">Friday · 10:00 AM</span>
                      <div className="ann-footer-meta">
                        <div className="partner-lockup partner-lockup-light partner-lockup-icons ann-partner-lockup" aria-label="Event partners">
                          {partnerLogos.map((partner) => (
                            <div key={`announcement-${partner.label}`} className="partner-lockup-item">
                              <img src={partner.src} alt={partner.alt} className="partner-lockup-logo" />
                            </div>
                          ))}
                        </div>
                        <span className="ann-cta-text">See Full List →</span>
                      </div>
                    </div>
                  </div>
                  <span className="asset-format-tag" aria-label="1080 by 1350 pixels">1080 × 1350</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-social">Social</span>
                  <h3>Announcement Card</h3>
                  <p className="asset-note">Royal Culture to Heritage Green diagonal. High-contrast white display type for feed impact with an editorial composition.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAHE0mH_0hw/94b6dmCo4KLF5VrSEK_Xdw/edit?utm_content=DAHE0mH_0hw&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>

              {/* 4. Keynote Slide */}
              <article className="asset-card presentation-card reveal" style={{ animationDelay: '0.26s' }}>
                <div className="asset-canvas landscape presentation-bg">
                  <div className="kn-grid-bg" aria-hidden="true"></div>
                  <div className="kn-year-mark" aria-hidden="true">2026</div>
                  <div className="kn-layout">
                    <div className="kn-accent-bar"></div>
                    <div className="kn-content">
                      <img src="/brand-logo.png" alt="" className="kn-logo" />
                      <div className="kn-text">
                        <p className="kn-eyebrow">NCAF 2026 · Vision Deck</p>
                        <h4 className="kn-title">Our Cultural<br />Heritage</h4>
                        <div className="kn-rule"></div>
                        <p className="kn-tagline">Celebrating the Riches of Our Roots</p>
                      </div>
                      <div className="partner-lockup partner-lockup-dark partner-lockup-labels kn-partner-lockup" aria-label="Event partners">
                        {partnerLogos.map((partner) => (
                          <div key={`keynote-${partner.label}`} className="partner-lockup-item">
                            <img src={partner.src} alt={partner.alt} className="partner-lockup-logo" />
                            <span>{partner.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="asset-format-tag tag-dark" aria-label="1920 by 1080 pixels">1920 × 1080</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-presentation">Presentation</span>
                  <h3>Keynote Title Slide</h3>
                  <p className="asset-note">Woven Bone base with Heritage Green accent bar and light grid watermark. Premium editorial negative space throughout.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAG-temp-keynote-title-slide" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>

              {/* 5. Event Poster */}
              <article className="asset-card poster-card reveal" style={{ animationDelay: '0.33s' }}>
                <div className="asset-canvas portrait poster-bg">
                  <div className="poster-corner-tl" aria-hidden="true"></div>
                  <div className="poster-corner-br" aria-hidden="true"></div>
                  <div className="po-layout">
                    <img src="/brand-logo.png" alt="" className="po-logo" />
                    <div className="po-divider"></div>
                    <h4 className="po-name">National<br />Culture &amp;<br />Arts Festival</h4>
                    <span className="po-year">2026</span>
                    <p className="po-quote">"Celebrating the Riches of Our Roots"</p>
                    <div className="po-rule-thin"></div>
                    <div className="partner-lockup partner-lockup-dark partner-lockup-icons po-partner-lockup" aria-label="Event partners">
                      {partnerLogos.map((partner) => (
                        <div key={`poster-${partner.label}`} className="partner-lockup-item">
                          <img src={partner.src} alt={partner.alt} className="partner-lockup-logo" />
                        </div>
                      ))}
                    </div>
                    <div className="po-info-row">
                      <span>April 2026</span>
                      <span>·</span>
                      <span>Iloilo City</span>
                    </div>
                  </div>
                  <span className="asset-format-tag tag-dark">A3 Print</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-print">Print</span>
                  <h3>Event Poster</h3>
                  <p className="asset-note">Bone base with Heritage Green corner bracket accents and a layered typographic hierarchy. Print-safe at 300 DPI on A3.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAG-temp-event-poster" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>

              {/* 6. Portrait Pubmat */}
              <article className="asset-card story-card-social reveal" style={{ animationDelay: '0.40s' }}>
                <div className="asset-canvas portrait spotlight-bg">
                  <div className="asset-texture"></div>
                  <div className="sp-beams" aria-hidden="true">
                    <div className="sp-beam beam-purple"></div>
                    <div className="sp-beam beam-orange"></div>
                    <div className="sp-beam beam-green"></div>
                  </div>
                  <div className="sp-silhouette" aria-hidden="true"></div>
                  <div className="canvas-inset-layout sp-layout">
                    <div className="sp-top-row">
                      <span className="sp-badge">Artist Spotlight</span>
                      <img src="/logo-white-mono.svg" alt="" className="sp-logo" />
                    </div>
                    <div className="sp-info-card">
                      <p className="sp-eyebrow">Featured Performer</p>
                      <h4 className="sp-name">Maria<br />Makiling</h4>
                      <p className="sp-discipline">Traditional Weaving · Indigenous Art</p>
                      <div className="sp-tags">
                        <span>T'nalak Weaver</span>
                        <span>Palawan</span>
                      </div>
                      <div className="sp-event-row">NCAF 2026 · April · Iloilo</div>
                    </div>
                  </div>
                  <span className="asset-format-tag" aria-label="1080 by 1350 pixels">1080 × 1350</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-social">Social</span>
                  <h3>Portrait Pubmat</h3>
                  <p className="asset-note">Stage-dark base with tri-color lighting echoing the full brand palette. Frosted glass info card at bottom for immediate legibility.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAG-temp-portrait-pubmat" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>

              {/* 7. Street Banner */}
              <article className="asset-card tarp-card reveal" style={{ animationDelay: '0.47s' }}>
                <div className="asset-canvas tarp landscape tarp-bg">
                  <div className="asset-texture"></div>
                  <div className="tarp-stripe-overlay" aria-hidden="true"></div>
                  <div className="tp-layout">
                    <div className="tp-logo-zone">
                      <img src="/logo-white-mono.svg" alt="" className="tp-logo" />
                    </div>
                    <div className="tp-divider" aria-hidden="true"></div>
                    <div className="tp-center-zone">
                      <p className="tp-eyebrow">NCAF 2026</p>
                      <h4 className="tp-headline">Celebrating the<br />Riches of Our Roots</h4>
                      <p className="tp-sub">National Culture &amp; Arts Festival</p>
                      <div className="partner-lockup partner-lockup-light partner-lockup-labels tp-partner-lockup" aria-label="Event partners">
                        {partnerLogos.map((partner) => (
                          <div key={`tarp-${partner.label}`} className="partner-lockup-item">
                            <img src={partner.src} alt={partner.alt} className="partner-lockup-logo" />
                            <span>{partner.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="tp-right-zone">
                      <span className="tp-month">April</span>
                      <span className="tp-year">2026</span>
                      <span className="tp-venue">Iloilo City</span>
                    </div>
                  </div>
                  <span className="asset-format-tag">10ft × 3ft</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-print">Print</span>
                  <h3>Street Banner</h3>
                  <p className="asset-note">Heritage Green to Pagsaulog Orange gradient with Vinta stripe overlay — designed for outdoor rollout, stage backwalls, and venue entry points.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAG-temp-street-banner" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>

              {/* 8. Email Template */}
              <article className="asset-card email-card reveal" style={{ animationDelay: '0.54s' }}>
                <div className="asset-canvas portrait email-bg">
                  <div className="em-chrome" aria-hidden="true">
                    <div className="em-chrome-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                  <div className="em-wrapper">
                    <div className="em-header">
                      <img src="/logo-white-mono.svg" alt="" className="em-logo" />
                      <span className="em-header-tag">NCAF 2026</span>
                    </div>
                    <div className="em-content">
                      <p className="em-subject">You're Invited to NCAF 2026</p>
                      <div className="em-lines">
                        <div className="em-line wide"></div>
                        <div className="em-line medium"></div>
                        <div className="em-line medium"></div>
                        <div className="em-line short"></div>
                      </div>
                      <div className="em-cta">Open Invitation</div>
                    </div>
                    <div className="em-footer">
                      <div className="partner-lockup partner-lockup-dark partner-lockup-icons em-partner-lockup" aria-label="Event partners">
                        {partnerLogos.map((partner) => (
                          <div key={`email-${partner.label}`} className="partner-lockup-item">
                            <img src={partner.src} alt={partner.alt} className="partner-lockup-logo" />
                          </div>
                        ))}
                      </div>
                      <p className="em-footer-text">National Culture &amp; Arts Festival · Iloilo 2026</p>
                    </div>
                  </div>
                  <span className="asset-format-tag tag-dark">600px email</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-digital">Digital</span>
                  <h3>Email Template</h3>
                  <p className="asset-note">Invitation and announcement layout following 600px email-safe constraints. Heritage Green header for instant brand recognition.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAG-temp-email-template" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>

              {/* 9. Video Lower-Third */}
              <article className="asset-card lowerthird-card reveal" style={{ animationDelay: '0.61s' }}>
                <div className="asset-canvas landscape lowerthird-bg">
                  <div className="lt-scene" aria-hidden="true"></div>
                  <div className="lt-card">
                    <div className="lt-orange-bar"></div>
                    <div className="lt-text-zone">
                      <span className="lt-name-display">The Hiligaynon Weavers</span>
                      <span className="lt-role-display">Cultural Heritage Showcase · NCAF 2026</span>
                    </div>
                    <div className="lt-logo-zone">
                      <img src="/logo-white-mono.svg" alt="" className="lt-brand-logo" />
                    </div>
                  </div>
                  <span className="asset-format-tag">1920 × 1080</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-video">Video</span>
                  <h3>Video Lower-Third</h3>
                  <p className="asset-note">Glass-frosted name card for livestreams, documentation reels, and interview segments. Orange accent bar ties back to the brand palette.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAG-temp-video-lower-third" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>

              {/* 10. Festival Shirt */}
              <article className="asset-card merch-card reveal" style={{ animationDelay: '0.68s' }}>
                <div className="asset-canvas portrait merch-bg">
                  <div className="mc-weave-bg" aria-hidden="true"></div>
                  <div className="mc-layout">
                    <p className="mc-collection-label">Festival Collection</p>
                    <div className="mc-print-card">
                      <img src="/brand-logo.png" alt="" className="mc-logo" />
                      <p className="mc-tagline">NCAF 2026 · ILOILO</p>
                      <div className="mc-tagline-sub">Celebrating the Riches<br />of Our Roots</div>
                    </div>
                    <p className="mc-specs">Crew Neck · Bone White · 100% Cotton</p>
                  </div>
                  <span className="asset-format-tag tag-dark">Merchandise</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-print">Print</span>
                  <h3>Festival Shirt</h3>
                  <p className="asset-note">Official festival garment. Logo and tagline on Woven Bone base — minimal, premium, and culturally rooted.</p>
                  <a className="asset-canva-link" href="https://www.canva.com/design/DAG-temp-festival-shirt" target="_blank" rel="noopener noreferrer">Open in Canva</a>
                </div>
              </article>
            </div>
          </div>
        </section>


        {/* ── DP BLAST CREATOR ─────────────────────────────────────────────── */}
        <section id="dp-blast" className="section section-dp-blast reveal">
          <div className="container dp-blast-card">
            <div className="dp-blast-preview">
              <div className="dp-blast-stage" ref={dpBlastStageRef}>
                <span className="dp-stage-badge">DP Preview</span>
                {dpBlastPhoto ? (
                  <img
                    src={dpBlastPhoto}
                    alt="Uploaded profile photo preview"
                    className="dp-user-photo"
                    style={{ transform: `translate(${dpBlastOffsetX}px, ${dpBlastOffsetY}px) scale(${dpBlastScale})` }}
                  />
                ) : (
                  <div className="dp-placeholder">
                    <span className="dp-placeholder-kicker">No photo yet</span>
                    <span>Upload your photo to preview with the official frame</span>
                  </div>
                )}
                <img src="/dp-blast-facebook.png" alt="NCAF DP blast frame" className="dp-blast-frame" />
                <span className="dp-stage-tip">Tip: use sliders to center your face in the ring.</span>
              </div>
              <span className="asset-format-tag" aria-label="1080 by 1080 pixels">1080 × 1080</span>
            </div>
            <div className="dp-blast-controls">
              <span className="asset-category category-social">Social</span>
              <h3>Display Picture Blast</h3>
              <p className="asset-note">Interactive profile-frame mockup. Upload a photo, then adjust zoom and position like Twibbon-style framing for instant rollout previews.</p>

              <div className="dp-controls">
                <div className="dp-controls-head">
                  <p className="dp-controls-title">Photo controls</p>
                  <span className="dp-controls-chip">Live</span>
                </div>

                <div className="dp-upload-row">
                  <label className="dp-upload-label">
                    Choose photo
                    <input className="dp-upload-input" type="file" accept="image/*" onChange={handleDpBlastUpload} />
                  </label>
                  <button type="button" className="dp-reset-btn" onClick={resetDpBlast}>Reset</button>
                  <button type="button" className="dp-download-btn" onClick={downloadDpBlast} disabled={!dpBlastPhoto}>Download PNG</button>
                </div>

                <label className="dp-control">
                  <span>Zoom</span>
                  <input
                    type="range"
                    min="0.7"
                    max="2.2"
                    step="0.01"
                    value={dpBlastScale}
                    onChange={(e) => setDpBlastScale(Number(e.target.value))}
                  />
                  <strong>{dpBlastScale.toFixed(2)}x</strong>
                </label>

                <label className="dp-control">
                  <span>Horizontal</span>
                  <input
                    type="range"
                    min="-140"
                    max="140"
                    step="1"
                    value={dpBlastOffsetX}
                    onChange={(e) => setDpBlastOffsetX(Number(e.target.value))}
                  />
                  <strong>{dpBlastOffsetX}px</strong>
                </label>

                <label className="dp-control">
                  <span>Vertical</span>
                  <input
                    type="range"
                    min="-140"
                    max="140"
                    step="1"
                    value={dpBlastOffsetY}
                    onChange={(e) => setDpBlastOffsetY(Number(e.target.value))}
                  />
                  <strong>{dpBlastOffsetY}px</strong>
                </label>
              </div>

              <a className="asset-canva-link" href="https://www.canva.com/design/DAHEPe1J5JQ/4RGRJl8rpv6xt6-ZGc0FVg/edit?utm_content=DAHEPe1J5JQ&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank" rel="noopener noreferrer">Open in Canva</a>
            </div>
          </div>
        </section>

        {/* ── DO'S & DON'TS ─────────────────────────────────────────────── */}
        <section id="dos-donts" className="section section-rules reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Guardrails</p>
              <h2>Do's and Don'ts</h2>
            </div>

            <div className="rules-grid">
              <article className="rule-column do-column">
                <h3>Do:</h3>
                <ul>
                  <li><strong>Use generous spacing:</strong> High-end design thrives on breathing room.</li>
                  <li><strong>Overlap elements:</strong> Let motifs dance across boundaries.</li>
                  <li><strong>Use heritage gradients:</strong> Keep the color transitions organic.</li>
                  <li><strong>Stick to the type scale:</strong> Maintain the tradition-function hierarchy.</li>
                </ul>
              </article>

              <article className="rule-column dont-column">
                <h3>Don't:</h3>
                <ul>
                  <li><strong>Use 100% black:</strong> Always use On-Surface (#383831) for text.</li>
                  <li><strong>Use rigid boxes:</strong> Avoid 90-degree corners for large containers.</li>
                  <li><strong>Use solid borders:</strong> Sectioning should feel like a tapestry, not a table.</li>
                  <li><strong>Crowd the logo:</strong> Give the cultural swoosh space to breathe.</li>
                </ul>
              </article>
            </div>

            <aside className="closing-note reveal">
              <p className="hero-lead italic">
                "This design system is not a grid to be filled; it is a tapestry to be woven. Use the colors not just to decorate, but to guide the user through the celebration of our heritage."
              </p>
            </aside>
          </div>
        </section>

        <Assignments />
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <p>&copy; 2026 West Visayas State University, CICT Creatives Team. All cultural rights reserved.</p>
            <nav>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">Source archive</a>
            </nav>
          </div>
        </div>
      </footer>

      <div className={`toast ${toastMessage ? 'is-visible' : ''}`}>
        {toastMessage}
      </div>
    </div>
  )
}

export default App
