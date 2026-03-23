import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import './App.css'

export function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Intersection Observer for reveal animations
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    });

    const revealItems = document.querySelectorAll('.reveal');
    revealItems.forEach((item) => revealObserver.observe(item));

    // Intersection Observer for active nav links
    const sectionObserver = new IntersectionObserver((entries) => {
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
      revealObserver.disconnect();
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

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsNavOpen(false);
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
              <Button className="btn-primary" asChild>
                <a href="#brand-assets" onClick={(e) => scrollToSection(e, 'brand-assets')}>Explore asset examples</a>
              </Button>
              <Button variant="outline" className="btn-secondary" asChild>
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
                <strong>Warm editorial archive</strong>
              </article>
            </div>
          </div>
        </div>
      </header>

      <nav className="site-nav">
        <div className="container nav-inner">
          <a href="#top" className="nav-brand" onClick={(e) => scrollToSection(e, 'top')}>NCAF 2026</a>
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

          <ul className={`nav-links ${isNavOpen ? 'is-open' : ''}`} id="primary-nav">
            <li><a href="#overview" className={activeSection === 'overview' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'overview')}>Story</a></li>
            <li><a href="#colors" className={activeSection === 'colors' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'colors')}>Palette</a></li>
            <li><a href="#typography" className={activeSection === 'typography' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'typography')}>Type</a></li>
            <li><a href="#experience" className={activeSection === 'experience' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'experience')}>Layers</a></li>
            <li><a href="#brand-assets" className={activeSection === 'brand-assets' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'brand-assets')}>Brand Assets</a></li>
            <li><a href="#dos-donts" className={activeSection === 'dos-donts' ? 'is-active' : ''} onClick={(e) => scrollToSection(e, 'dos-donts')}>Rules</a></li>
          </ul>
        </div>
      </nav>

      <main>
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
                      {color.hex}
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

        <section id="brand-assets" className="section section-assets reveal">
          <div className="container">
            <div className="section-intro">
              <p className="section-kicker">Brand assets</p>
              <h2> Rollout mockups & usage examples.</h2>
              <p className="section-lead">
                Each mockup demonstrates how the brand system translates into real-world formats—from social headers and countdown teasers to physical posters and stage banners.
              </p>
            </div>

            <div className="asset-grid">
              <article className="asset-card cover-photo reveal" style={{ animationDelay: '0.05s' }}>
                <div className="asset-canvas landscape cover-photo-bg">
                  <div className="asset-texture"></div>
                  <span className="asset-motif motif-bl">✦</span>
                  <img src="/brand-logo.png" alt="" className="asset-logo mb-4" />
                  <div className="asset-copy">
                    <span className="glass-pill">Social Header</span>
                    <h4>Celebrating the Riches of Our Roots</h4>
                  </div>
                  <span className="asset-format-tag" aria-label="1200 by 628 pixels">1200 × 628</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-social">Social</span>
                  <h3>Facebook Cover</h3>
                  <p className="asset-note">Centered logo with high-contrast heritage green background.</p>
                </div>
              </article>

              <article className="asset-card countdown-card reveal" style={{ animationDelay: '0.12s' }}>
                <div className="asset-canvas portrait countdown-bg">
                  <div className="asset-texture"></div>
                  <span className="asset-motif motif-tr">♪</span>
                  <span className="asset-motif motif-bl">✦</span>
                  <div className="asset-copy countdown-copy">
                    <span className="glass-pill">Teaser</span>
                    <p className="countdown-number">12</p>
                    <p className="asset-subcopy uppercase font-bold tracking-widest text-xs">Days to Pagsaulog</p>
                  </div>
                  <span className="asset-format-tag" aria-label="1080 by 1920 pixels">1080 × 1920</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-social">Social</span>
                  <h3>Instagram Story</h3>
                  <p className="asset-note">Vertical teaser using the ceremonial orange gradient.</p>
                </div>
              </article>

              <article className="asset-card announcement-card reveal" style={{ animationDelay: '0.19s' }}>
                <div className="asset-canvas portrait announcement-bg">
                  <div className="asset-texture"></div>
                  <span className="asset-motif motif-tr">◆</span>
                  <div className="asset-copy">
                    <span className="glass-pill">Official</span>
                    <h4>Artists announced this Friday.</h4>
                    <p className="asset-subcopy text-sm opacity-80">Check the live feed at 10AM.</p>
                  </div>
                  <span className="asset-format-tag" aria-label="1080 by 1350 pixels">1080 × 1350</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-social">Social</span>
                  <h3>Social Square</h3>
                  <p className="asset-note">Announcement layout with editorial spacing.</p>
                </div>
              </article>

              <article className="asset-card presentation-card reveal" style={{ animationDelay: '0.26s' }}>
                <div className="asset-canvas landscape presentation-bg">
                  <div className="asset-texture"></div>
                  <div className="p-4">
                    <span className="text-brand-secondary font-bold tracking-widest text-xs uppercase">Vision Deck</span>
                    <h4 className="text-brand-primary">Our Cultural Heritage</h4>
                    <div className="w-12 h-1 bg-brand-secondary mt-4 rounded-full"></div>
                  </div>
                  <span className="asset-format-tag tag-dark" aria-label="1920 by 1080 pixels">1920 × 1080</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-presentation">Presentation</span>
                  <h3>Keynote Slide</h3>
                  <p className="asset-note">Clean, cream-toned layout for corporate and vision decks.</p>
                </div>
              </article>

              <article className="asset-card poster-card reveal" style={{ animationDelay: '0.33s' }}>
                <div className="asset-canvas portrait poster-bg">
                  <div className="asset-texture"></div>
                  <div className="poster-inner">
                    <div>
                      <img src="/brand-logo.png" alt="" className="asset-logo small" />
                      <h4 className="mt-8 text-brand-primary">National Festival 2026</h4>
                    </div>
                    <ul className="poster-list text-xs uppercase font-bold tracking-widest mt-4">
                      <li>Iloilo</li>
                    </ul>
                  </div>
                  <span className="asset-format-tag tag-dark">A3 Print</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-print">Print</span>
                  <h3>Event Poster</h3>
                  <p className="asset-note">Physical print mockup using the Woven Bone base.</p>
                </div>
              </article>

              <article className="asset-card story-card-social reveal" style={{ animationDelay: '0.40s' }}>
                <div className="asset-canvas portrait spotlight-bg">
                  <div className="asset-texture"></div>
                  <div className="spotlight-content">
                    <div className="spotlight-badge">Artist Spotlight</div>
                    <h4 className="text-white spotlight-name">Maria Makiling</h4>
                    <p className="asset-subcopy text-sm text-white/80">A journey through indigenous weaving.</p>
                  </div>
                  <span className="asset-format-tag" aria-label="1080 by 1350 pixels">1080 × 1350</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-social">Social</span>
                  <h3>Portrait Pubmat</h3>
                  <p className="asset-note">High-impact artist reveal with ceremonial purple.</p>
                </div>
              </article>

              <article className="asset-card tarp-card reveal" style={{ animationDelay: '0.47s' }}>
                <div className="asset-canvas tarp landscape tarp-bg">
                  <div className="asset-texture"></div>
                  <div className="flex items-center gap-8 z-10 px-8">
                    <img src="/brand-logo.png" alt="" className="asset-logo" />
                    <div className="h-16 w-px bg-white/20"></div>
                    <h4 className="max-w-[12ch] text-white">Celebrating the Riches of Our Roots</h4>
                  </div>
                  <div className="z-10 px-8 text-right text-white">
                    <p className="font-bold tracking-widest uppercase text-sm">March 2026</p>
                  </div>
                  <span className="asset-format-tag">10ft × 3ft</span>
                </div>
                <div className="asset-meta">
                  <span className="asset-category category-print">Print</span>
                  <h3>Street Banner</h3>
                  <p className="asset-note">Horizontal large-format asset for street rollout and stage banners.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

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
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <p>&copy; 2026 NCAF Creative Team. All cultural rights reserved.</p>
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
