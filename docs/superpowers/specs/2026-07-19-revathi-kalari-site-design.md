# Revathi Kalaripayattu Website — Design Spec

## Purpose

A single-page promotional website for Amrutha E T ("kalariwoman_amruthaet_revathi"),
a Kalaripayattu trainer, to showcase her practice and drive prospective students to
DM her Instagram for online/offline class enquiries.

## Source Content

Gathered directly from her Instagram profile (@kalariwoman_amruthaet_revathi) via
browser automation:

- **Name / handle:** Amrutha E T, 72 posts, 14K followers
- **Bio:** Artist. Granddaughter of Guru Veerasree Sami Gurukkal. Kalari Trainer at
  @hindustankalarisangham. DM for online & offline classes.
- **Photos** (saved to `images/`): `profile.png` (ceremonial lamp-lighting shot used
  as her profile picture), `post-1.png` (mid-air jump strike on stage),
  `post-2.png` (sword & shield fighting stance), `post-3.png` (dagger stance,
  close-up), `post-4.png` (crouching stance, studio portrait), `post-5.png`
  (garden portrait with flowers), `post-6.png` (night ritual scene with oil lamps).
- **Caption excerpts** (for pull-quotes, used verbatim/lightly trimmed, not
  fabricated):
  - "Kalari isn't just about movement; it's about reclaiming your strength, sharp
    focus, and absolute grace... the martial art of the Goddesses is now
    accessible from your living room."
  - "We begin with the Vandhanam to remind ourselves that strength without
    humility is merely force."
  - "Aligned. Centered. Unyielding."
  - "The sword tests your focus, the shield demands your presence, and the stage
    captures your soul."

## Visual Style

"Bold & fierce": deep maroon/red (`#7a1f2b` family) and gold/ochre (`#c9963a`
family) on warm dark backgrounds (`#1a1210` family), matching the actual color
palette in her photos (red practice attire, gold jewelry, ochre training-ground
sand, oil-lamp warmth). Strong serif/condensed display type for headings, clean
sans-serif for body text. Full-bleed photography, generous negative space between
sections.

## Tech Approach

Static site, no build step, no framework:
- `index.html` — single page, all sections
- `styles.css` — all styling
- `images/` — the photos listed above (already in place)

Chosen for zero dependencies, trivial hosting (any static host, or just opening
the file), and easy hand-editing later by the user or Revathi herself.

## Sections (in order)

1. **Hero** — full-bleed `post-2.png` (sword & shield) or `post-1.png` (jump
   strike) as background, name + "Kalariwoman · Kalaripayattu Trainer" tagline,
   scroll-down indicator.
2. **About/Lineage** — bio text (granddaughter of Guru Veerasree Sami Gurukkal,
   trainer at Hindustan Kalari Sangham), paired with `profile.png` or
   `post-4.png`.
3. **Gallery** — grid of the 6 action/portrait photos (`post-1` through
   `post-6`), each with a short caption line drawn from her real posts.
4. **Classes** — two cards: Online and Offline, general descriptions (no
   fabricated pricing/schedule), both driving to the Contact CTA.
5. **Words from her practice** — 2-3 pull-quotes from the caption excerpts above,
   styled as large statement text, not attributed as "testimonials" (they are her
   own words, not client reviews).
6. **Contact/CTA** — "DM to begin your journey" button linking to
   `https://www.instagram.com/kalariwoman_amruthaet_revathi/`.

## Explicitly Out of Scope

- No fabricated pricing, schedules, or client testimonials.
- No contact form / backend (Instagram DM only, per user decision).
- No multi-page routing or CMS — single static HTML file.

## Open Items for Later

- Real class schedule/pricing if Revathi wants to add them.
- Additional photos/video if higher-quality originals are provided later
  (current photos are screenshot-captured at on-screen resolution, not
  original upload resolution).
