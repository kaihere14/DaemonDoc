---
name: product-social-images
description: Create premium, brand-native social media images of a product, plus ready-to-post copy, for any post — launch, new feature, update or changelog, milestone, tip, behind-the-scenes, or a general "what is this product" post. Use when the user asks to "make images/pictures for a post", "screenshot the website and make SaaS-style pictures", "create social media graphics / promo images / post visuals", "post about <product> on X / LinkedIn / Instagram", or "suggest what to post". Captures the live site with Playwright, builds cards in HTML in every needed platform size, renders them at 2x, self-reviews against a quality checklist, saves named PNGs to ~/Downloads, and drafts the post copy.
---

# Product Social Images

Make social images of a product that look designed by a human studio, not generated, and write the
posts that go with them. The first result must be good enough to post: the user should never have to
ask for a redo.

## The one rule that matters most

**The background must come from the brand itself, never from a generic gradient.**
A rejected version used a dark navy radial gradient, purple-blue gradient text, a grid overlay and
pill chips. It "looked AI-made". The accepted version used the product's own hero artwork as a
full-bleed canvas, an editorial serif headline in plain white and crisp white product panels.
That difference is the whole skill.

## 0. Pin down the post

From the request (ask only if truly unclear, otherwise pick a sensible default and say so):

- **Post type**: launch / new feature / update / milestone / tip / general intro. Default: general intro.
- **Platforms**: default X + LinkedIn.
- **Number of images**: single post = 1–2 images; thread or carousel = 4–6. Default: a 5-card set + 1 portrait.

Formats (all rendered at 2x pixel density):

| Format    | Size      | Use                                                       |
| --------- | --------- | --------------------------------------------------------- |
| landscape | 1600x900  | X, LinkedIn link-style posts, threads                     |
| portrait  | 1080x1350 | LinkedIn and Instagram feed (takes the most screen space) |
| square    | 1080x1080 | Instagram, LinkedIn carousel                              |
| story     | 1080x1920 | Instagram/LinkedIn stories, Shorts covers                 |

## 1. Find the product and its brand assets (before any screenshot)

- Read the repo README / package.json (or the site itself) to get the product name, one-line pitch,
  real features and the live URL. For a feature/update post, read the relevant code, commits or
  changelog so every claim is real.
- Collect brand assets from `public/`, `assets/`, logo folders: hero art or background images,
  mascot / logo PNGs, existing OG images. Check sizes with `sips -g pixelWidth -g pixelHeight`.
- Look at each candidate (Read the image). Pick ONE signature visual for the canvas, in this order:
  1. The hero illustration / painting / photo used on the site (best: unique to the brand).
  2. A large brand-colour field taken from the site's actual CSS (not an invented palette).
  3. Only if neither exists: a flat solid brand colour. Still no gradient washes.
- Note anything outdated (old logo in screenshots, placeholder content) so it never ships.

## 2. Capture the site

`SKILL_DIR` means the folder containing this SKILL.md (e.g. `.agents/skills/product-social-images`
or `~/.claude/skills/product-social-images`). Node resolves `playwright` from the script's folder,
so copy the scripts into a temporary work dir, never into the user's project:

```bash
W=<scratchpad or $(mktemp -d)>/social && mkdir -p $W/cards && cd $W
npm i playwright --silent && npx playwright install chromium   # once per work dir
cp $SKILL_DIR/scripts/*.mjs . && cp $SKILL_DIR/templates/card.css cards/
node capture.mjs https://example.com shots
```

`capture.mjs` saves `hero.png` (first viewport, nav included), scrolls the whole page slowly so
scroll-triggered animations fire, hides fixed/sticky headers, and saves `full.png`, `text.txt`, `links.txt`.
For logged-in app screens, ask the user for screenshots or use their browser; never guess UI.

Crop sections from `full.png` with Pillow:

- Make a thumbnail (`sips -Z 2400 full.png --out thumb.png`), Read it, note section bounds in thumbnail pixels.
- Multiply by `full_width / thumb_display_width` to get real pixels. Crop, then **Read every crop**.
- Crop tightly to the meaningful UI (a diagram, a card row). Drop empty white areas and section headings
  that the card headline will repeat.
- Animated widgets get captured mid-animation: re-crop if a row is cut or a state looks half-drawn.

## 3. Plan the cards (one idea per card)

Pick from these card jobs to fit the post type:

| Card job           | Content                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Outcome            | An HTML recreation of the moment the product delivers value (a commit diff, a Slack message, a dashboard number, an email). Strongest opener. |
| How it works       | The real step sequence, from the site or built in HTML.                                                                                       |
| Feature            | One feature: headline benefit + tight screenshot crop.                                                                                        |
| Differentiator     | The technical or product edge competitors lack.                                                                                               |
| Proof              | Testimonials, a metric the user gave you, GitHub stars. Never invent numbers or names.                                                        |
| Update / changelog | Before vs after, or the new UI with the change highlighted by layout, not arrows and glows.                                                   |

Typical sets: intro or launch = outcome, how it works, 2 features, proof + portrait outcome.
Feature post = outcome of that feature + 1–2 detail cards. Single post = one outcome card in 2 formats.

For outcome cards, use real details from the codebase (real env var names, routes, commands) and keep
counts consistent with what is shown (`+12 −5` must match the diff lines). Tell the user which panels are mocks.

## 4. Build the cards

Start from `$SKILL_DIR/templates/card.css` and `$SKILL_DIR/templates/example-card.html`. Copy the
chosen art to `cards/art.png` and the logo to `cards/logo.png`. Name cards `c1.html`, `c2.html`… and
set the size on the body: `<body data-size="1080x1350" class="vertical">` (vertical = portrait/story,
bigger type). Landscape needs no attribute.

Design system:

- **Canvas**: brand art full-bleed, a different `background-position` per card so the set varies but
  stays cohesive. Soft top `.shade`; a left `.scrim` only where text sits on a busy part of the art.
  Set `--canvas` and `--shadow` in card.css from the art's dominant colour.
- **Headline**: editorial display face (default Instrument Serif, regular, ~84px landscape, ~104px
  vertical, line-height ~0.98, slight negative tracking), plain white. One sentence, a user benefit in
  plain verbs. No word accented by colour, italic or weight.
- **Body**: clean sans (default Geist), 22px, ~78% white, at most 2 lines.
- **Brand mark**: small logo + wordmark top-left, domain as plain text top-right. Nothing else.
- **Product panels**: pure white, 16px radius, shadow tinted with the canvas colour (not grey). Either
  fully visible (`.round`) and vertically balanced, or bleeding off the bottom edge, and bleed only
  when the content fills the panel. Panel height hugs the content.
- **Layout**: landscape features = text left, panel right. Steps, proof and vertical formats = text top,
  panel below. 72px outer margin.

Swap the default fonts only if the brand already uses a distinctive display face. If the brand art is
light, invert: dark ink headline, white panels with a hairline border and an art-tinted shadow.

## 5. Banned (these made the rejected version look AI-made)

- Dark navy/indigo radial gradient backgrounds, colour "glow" blobs, grid or dot overlays.
- Gradient text or a single highlighted word in the headline.
- Pill / chip eyebrow labels, monospace or ALL-CAPS labels above headings.
- Browser chrome (traffic-light dots + fake URL bar) on every screenshot.
- 3D perspective tilt on screenshots.
- Middle-dot meta strings ("A · B · C") and "→" decorations in captions.
- Placeholder content: fake customer logos ("ACME Corp"), lorem ipsum, outdated logos in screenshots.
- Panels with large empty white areas, or screenshots cut off mid-content.
- Emoji or stock icons sprinkled on the image.

## 6. Render and self-critique (mandatory)

```bash
node render.mjs cards   # renders every c*.html in cards/ to cards/out/ at 2x
```

The renderer waits for `document.fonts.ready` and takes the size from `<body data-size="WxH">`.

Make 1000px thumbnails and **Read every card**. Fix and re-render until all pass:

- [ ] Background is brand art (or real brand colour), not an invented gradient.
- [ ] Headline readable over the art (add scrim if not); no accented words.
- [ ] No empty white space inside panels; nothing cut off at the sides.
- [ ] No placeholder logos, old branding, or numbers that contradict what is shown.
- [ ] The set reads as one family (same mark, margins, type scale) with varied crops.
- [ ] Would a designer at Linear / Stripe / Vercel post this? If it looks like a template, redo that card.

## 7. Save

```
~/Downloads/<Product>-Social-<post-slug>/
  01-<product>-<topic-slug>-1600x900.png
  02-...
  0N-<product>-<topic-slug>-1080x1350.png
  raw-screenshots/raw-NN-<section>.png
```

Lowercase kebab-case, numbered in posting order, size in the name. If the folder exists from an
earlier run, move old files to `old-vN/` instead of deleting.

## 8. Write the posts

Match the post type. Use only real features and facts; never invent metrics, users or customers.

- **X**: a thread (hook about the pain → how it works → feature → differentiator → CTA) mapped to card
  numbers, plus a single-post alternative. Links go in the last post or a reply.
- **LinkedIn**: two-line hook, a personal line ("so I built" / "we just shipped"), 3 short how-it-works
  lines, an "under the hood" list for dev audiences, a proof quote if available, "link in the first
  comment", a closing question, 4–5 hashtags.
- **Instagram** (if asked): short caption, value first, 5–10 hashtags, link in bio.
- **Reach tips**: links in first comment/reply, reply to everything in the first hour, post Tue–Thu
  9–11am in the audience's time zone, follow up with a build-in-public post, a short screen recording
  of the product working beats static images.
- Flag anything the user must fix before posting (e.g. placeholder logos on the live site).

## Final reply

A short table of files + what each is for, the posts ready to paste, and the reach tips. Say which
panel content is a mock.
