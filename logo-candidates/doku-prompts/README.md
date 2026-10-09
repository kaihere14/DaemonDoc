# Doku pose requirements

Doku is DaemonDoc's mascot: a small blue imp. These requirements apply to every new pose. Each pose has its own ready-to-paste prompt file in this folder.

## Workflow (ChatGPT)

1. Open a **new** ChatGPT chat for each pose, so earlier poses don't bleed into the next one.
2. Attach the reference images:
   - `logo-candidates/A2-full-2.png` (full body, required)
   - `logo-candidates/A2-transparent.png` (head close-up, recommended)
3. Paste the whole prompt block from the pose file.
4. Compare the result with the checklist below. If anything drifts, ask for a redraw; don't fix it by hand.
5. Download the image you like at full size and save it to `logo-candidates/doku/<file-name>.png`, using the file name given in the pose file.

## Character (must match the reference exactly)

- Oversized round head; the head is wider than the body.
- Small rounded body with stubby rounded arms and short stubby legs. No hands with fingers, no feet details.
- Two short, blunt, slightly curved horns on top of the head, one on each side.
- Two round eyes, widely spaced, set low on the face.
- One tiny U-shaped smile between the eyes, slightly lower.
- No eyebrows, nose, ears, tail, cheeks, outlines, texture or highlights.
- Soft matte surface with a very subtle, smooth sense of depth. Not glossy, not plastic, not photoreal.

## Colours

| Part                            | Colour                                                              |
| ------------------------------- | ------------------------------------------------------------------- |
| Body, head, arms, legs          | Blue, graded from `#4794F5` at the top to `#66BFFD` at the bottom   |
| Horns, eyes, mouth              | Cream `#FDEDB9`                                                     |
| Props (laptop, paper, confetti) | Cream `#FDEDB9` only, with blue `#4794F5` allowed for small details |
| Background                      | Transparent; if not possible, plain solid white `#FFFFFF`           |

No other colours anywhere in the image.

## Composition

- Square 1:1 image, about 1536 × 1536 pixels.
- Full body visible, centred unless the pose file says otherwise.
- Doku fills about 75% of the image height, with even empty space around it.
- Camera at Doku's eye level, straight on unless the pose file says otherwise.
- Soft light from the upper left, same as the reference.
- No floor, no scenery, no cast shadow, no frame or border.

## Rules

- One character only.
- No text, letters, numbers, symbols, speech bubbles or "z" marks.
- Expressions change only through the eyes (round, or closed arcs) and the small mouth.
- Must still read clearly when shrunk to 64 × 64 pixels.

## Review checklist

- [ ] Horns: same shape, size and position as the reference.
- [ ] Eyes: same size and spacing (unless the pose closes them into arcs).
- [ ] Blue and cream match the hex values above; no new colours.
- [ ] Head-to-body proportion matches the reference.
- [ ] Background is transparent or plain white, with no shadow.
- [ ] The pose is readable at a glance from the silhouette alone.

## Pose list

| File                                  | Priority | Used for                                          |
| ------------------------------------- | -------- | ------------------------------------------------- |
| [`doku-wave`](doku-wave.md)           | 1        | Checklist greeting on first visit                 |
| [`doku-working`](doku-working.md)     | 1        | First README is generating                        |
| [`doku-celebrate`](doku-celebrate.md) | 1        | First README done, checklist complete             |
| [`doku-oops`](doku-oops.md)           | 1        | Errors, repo needs admin access                   |
| [`doku-point`](doku-point.md)         | 2        | Drawing attention to a step (three-quarter angle) |
| [`doku-reading`](doku-reading.md)     | 2        | Empty states, Logs page                           |
| [`doku-resting`](doku-resting.md)     | 2        | "I'll finish later", folded checklist             |

The folded checklist launcher reuses the existing bust (`A2-rounded.png`), which already peeks in from the lower right.
