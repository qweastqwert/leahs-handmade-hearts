## Plan

### 1. Ishaan sticker assets
- Upload the 4 attached PNGs to Lovable Assets (so they live on the CDN, not the repo):
  - `src/assets/ishaan-sticker-1.png.asset.json` … `-4.png.asset.json`
- Add a small `src/leah/ishaanStickers.js` helper exporting an array of asset URLs + tilt/scale presets, imported once at the top of `leah.script.js`.
- New CSS in `leah.css`:
  - `.ishaan-sticker` — torn-paper border, wobble on hover, gentle float, doodle shadow, tape strip on top, sparkle/heart pseudo-elements.
  - `.ishaan-sticker.finale-sticker` — larger, with sparkle drift used in the finale.
  - `.ishaan-sticker.scattered` — absolute-positioned tiny version (60–90px) with random rotation, used post-finale.

### 2. Remove Eye Contact Room entirely
- Delete the tile, modal, all script handlers, the `openZone` entry, the `modals` registration, any reference in `leah.script.js` / `body.html` / `leah.css`.
- Search-and-sweep to ensure no dangling button references or toast strings remain.

### 3. Finale stickers + post-finale scatter
- In `initiateEndingCinematic`, add a new stage between fireworks and letter rise:
  - 4 Ishaan stickers fly in from the corners onto a "polaroid wall" around the envelope, each with a written caption ("yours forever", "your idiot", "the gift 👑", "always cheering"). Each gets `.finale-sticker` styling and a small entrance animation.
- After the cinematic completes, set `localStorage.leah_finale_done = '1'` and call a new `scatterIshaanStickers()`:
  - Inserts ~10–14 `.ishaan-sticker.scattered` nodes at random positions across `body`, biased to dashboard tile corners + each game modal's header.
  - Runs on load if the flag is set, so they persist across reloads.
  - Tile-corner stickers are pinned via `position:absolute` inside the tile; modal stickers via a MutationObserver that decorates each modal when first opened.

### 4. Footer protrusion fix
- The footer currently overlaps content/toasts because it isn't accounted for in the dashboard's bottom padding and uses `fixed`/insufficient z-index. Plan:
  - Convert footer to normal flow at the bottom of the page (already in a flex column body) and add `padding-bottom: 6rem` to the main dashboard wrapper.
  - Lower footer `z-index` below modals/toasts and clamp its content width with `max-width` so the long Ishaan message wraps instead of bleeding out.
  - Add `word-break: break-word` to the footer message line.

### 5. Wishing Lamp → mailto only
- Replace `sendWish()` body: build `mailto:ishaan210611@gmail.com?subject=🪔%20Leah%20wished:%20…&body=…`, `window.location.href = mailto`. Keep the localStorage history list.
- Remove the `/api/wish` route file, the `.env.local` / `.env.example` WEB3FORMS keys, and the fetch call. Update the modal copy to "Opens your mail app — sends straight to Ishaan."

### 6. Aura Slot Machine — highlight Stellar Alignment
- Add a permanent "🌟 JACKPOT TARGET" card above the wheels listing the exact Stellar Alignment pattern (the 3 symbols), pulsing glow, "MUST GET" ribbon using `.finale-ribbon`.
- Add a marker-underline hint under each wheel showing which symbol contributes to the jackpot when it lands.
- Add CSS `.jackpot-target` with conic-gradient halo + caveat font.

### 7. Leah's Historical Museum — interactive exhibits
- Convert each exhibit card from static text into an interactive widget:
  - **June 30 2012 (Goddess Mary born)**: scratch-to-reveal halo + tap to play a tiny chime + animated 13-year counter.
  - **June 30 2025 (best day — we started dating)**: clickable polaroid that flips to show a handwritten note from Ishaan; confetti on flip.
  - Existing exhibits: add hover-tilt, "tap to hear story" button that triggers a short Web Audio tone sequence and shows a follow-up caption.
- Shared `.museum-exhibit` styles in CSS with `.flippable`, `.scratchable`, `.tappable` variants; logic in a new `setupMuseum()` called from the main init.

### 8. Retro Star Shield — real minigame
- Canvas-based shooter inside the modal:
  - Player is a doodle star at the bottom moving with ←/→ or pointer drag.
  - Falling "bad vibes" doodles (clouds, frowns) — shoot with space/tap.
  - Score, lives (3), 60-second timer, ramping spawn rate.
  - Win condition: survive 60s → toast "Leah's aura: shielded ✨".
  - Audio: pluck on shoot, soft thud on hit, chime on win (Web Audio, no assets).
- Hand-drawn HUD using existing doodle frame utilities.

### 9. Cake Protection Grid — real minigame
- Grid-based defense (5×5):
  - Cupcake in the center, 8 incoming "candle-blowers" approach along grid paths over 45s.
  - Tap empty cells to drop "frosting walls" (limited to 6 per round, regen every 4s).
  - Hit/miss feedback via floating doodles + Web Audio.
  - Win: cupcake survives → confetti + toast.
- Reuses scribble-progress for the candle/frosting meters.

### 10. Zen Soundscape Garden — more variation
- Expand the synth palette:
  - Add 3 new pads (rain droplet, wind chime swell, lo-fi vinyl crackle) and 2 melodic seeds (kalimba, music-box).
  - Each "plant" tile cycles through 2–3 timbre variants on subsequent taps (color-coded indicator dot).
  - Randomized micro-variation: small pitch drift (±15 cents), pan jitter, and volume LFO so the garden never sounds identical twice.
  - Add a "Mood" pill toggle (Dawn / Rain / Night) that re-tunes reverb wet/dry and master EQ.

### Technical notes
- All audio: existing Web Audio context, no new packages.
- Sticker assets via `lovable-assets create` from `/mnt/user-uploads/...` → JSON pointers in `src/assets`.
- Footer fix and sticker scatter live in `leah.css` + `leah.script.js`; no React component split needed yet.
- Cleanup: remove `src/routes/api/wish.ts`, drop `WEB3FORMS_KEY` from `.env.example`, regenerate `routeTree.gen.ts` automatically on next dev run.

### Files touched
- create: `src/assets/ishaan-sticker-{1..4}.png.asset.json`, `src/leah/ishaanStickers.js`
- delete: `src/routes/api/wish.ts`
- edit:   `src/leah/body.html`, `src/leah/leah.script.js`, `src/leah/leah.css`, `.env.example`
