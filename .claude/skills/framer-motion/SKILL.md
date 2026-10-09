---
name: framer-motion
description: Animation with Framer Motion (now "Motion", motion.dev, free and open source). Use when animating slides, video clips, web pages or React components, or when the user mentions Framer Motion, Motion, animation, transitions or motion graphics.
---

# Framer Motion / Motion

Framer Motion is now published as **Motion** (`motion` on npm). Two ways to use it:

- **Plain HTML** (this site, slides, video clips): the vanilla library, global `Motion`.
  `<script src="https://cdn.jsdelivr.net/npm/motion@12/dist/motion.js"></script>`
- **React** apps: `npm i motion`, then `import { motion, AnimatePresence } from "motion/react"`.
  (Older code imports from `framer-motion`; the API is the same.)

In this sandbox the browser cannot reach CDNs, but the `slides` and `video-clip` render scripts serve the Motion file from npm automatically.

## Vanilla API (HTML)

```js
const { animate, stagger, timeline, inView, scroll } = Motion;

// Fade and rise, one after another
animate('.line', { opacity: [0, 1], y: [40, 0] }, { delay: stagger(0.4), duration: 0.7, ease: 'easeOut' });

// Spring pop
animate('.badge', { scale: [0.6, 1] }, { type: 'spring', stiffness: 300, damping: 18 });

// Sequence: each step starts after the previous one, `at` overrides timing
animate([
  ['.title', { opacity: [0, 1], y: [60, 0] }, { duration: 0.8 }],
  ['.number', { opacity: [0, 1], scale: [0.8, 1] }, { duration: 0.6, at: '+0.3' }],
  ['.cta', { opacity: [0, 1] }, { duration: 0.5, at: '+1' }],
]);

// Count up a number
animate(0, 1.56, { duration: 1.2, onUpdate: v => (el.textContent = `+${v.toFixed(2)}%`) });

// On the website: animate when scrolled into view
inView('.card', el => { animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.5 }); });
```

Animatable: `opacity`, `x`, `y`, `scale`, `rotate`, colours, `clipPath`, CSS variables and most CSS properties.

## React API

```jsx
import { motion, AnimatePresence } from "motion/react";

<motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} />
<motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.15 } } }}>
  <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} />
</motion.ul>
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />
<AnimatePresence>{open && <motion.div key="m" exit={{ opacity: 0 }} />}</AnimatePresence>
```

## Taste rules

- Short and calm: 0.4 to 0.8 s per move, ease-out or gentle springs. One motion idea per beat.
- Move small distances (20 to 60px). Avoid spinning, bouncing text and flashing.
- On the website, respect reduced motion: skip animation when `matchMedia('(prefers-reduced-motion: reduce)').matches`.
- The website (`growth-framework/`) is a plain static site with no React; use the vanilla API there and keep it optional (content must be visible without JavaScript).
