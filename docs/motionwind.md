# Motionwind

This app uses [Motionwind](https://www.motionwind.xyz/docs) so most animations are written as `animate-*` utility classes on lowercase HTML elements. The Babel transform (via `withMotionwind` in `next.config.ts`) compiles them to [Motion](https://motion.dev) at build time — see the [installation guide](https://www.motionwind.xyz/docs/installation).

## Rules

- Use **static string literals** in `className` on **lowercase tags** (`div`, `span`, `button`, …) for compile-time transforms.
- For **dynamic** `className` (template literals, `cn()`, conditionals), use **`mw.*`** from `motionwind-react` (runtime parser), e.g. `mw.div`.
- For **exit** animations with **`AnimatePresence`**, keep using **`motion`** / **`AnimatePresence`** from `motion/react` (see `smart-input.tsx`).

## Dependencies

- `motion` — Motion runtime (peer of motionwind).
- `motionwind-react` — Next.js wrapper + `mw` runtime components.
