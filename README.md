# NCAF 2026 Brand Guidelines Website

A static editorial-style brand portal for the 2026 National Culture and Arts Festival, built around **The Living Archive** design direction.

## What's new in this version

The website now feels less like a plain guideline document and more like a cultural showcase. It includes:

- A redesigned hero section with stronger storytelling and layered visual treatment
- Glassmorphism-inspired sticky navigation with improved mobile behavior
- Richer sections for brand story, palette, typography, depth, and reusable components
- Interactive UX touches such as smooth section awareness and click-to-copy color tokens
- **Brand asset usage examples** for:
  - cover photos
  - countdown pubmats
  - announcement cards
  - vertical story layouts
  - poster-style publicity materials

## File structure

```text
ncaf-branding/
├── index.html          # Main brand guidelines experience
├── styles.css          # Full visual system and responsive styling
├── script.js           # Navigation, reveal animations, and micro-interactions
├── brand-logo.png      # Official NCAF 2026 logo
├── DESIGN.md           # Source design strategy and principles
└── README.md           # Project overview
```

## Local usage

Open `index.html` directly in a browser, or run a simple local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Design direction

The experience follows the guidance in `DESIGN.md`:

- Heritage green, festival orange, archive purple, and warm cream surfaces
- Noto Serif for ceremonial display moments
- Plus Jakarta Sans for readable interface and body content
- Tonal layering instead of hard lines
- Organic, poster-like layouts that feel celebratory and cultural

## Customization notes

- Update content structure in `index.html`
- Adjust brand tokens and layout styling in `styles.css`
- Extend interactions in `script.js`
- Keep new designs aligned with the cultural, editorial feel defined in `DESIGN.md`

## Browser notes

This is a lightweight static site using modern HTML, CSS, and vanilla JavaScript. It works best in current versions of Chrome, Edge, Firefox, and Safari.

## License

© 2026 National Culture and Arts Festival. All rights reserved.
