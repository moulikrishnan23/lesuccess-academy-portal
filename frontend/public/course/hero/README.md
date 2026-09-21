# Course hero backdrops

The band behind the course title on `/courses/<slug>`, rendered by
`src/components/sections/CourseHero.jsx`.

## What is here

One SVG per course, named after its slug:

    /course/hero/<slug>.svg

All twenty are generated artwork, not photographs. Each is built from two
layers:

1. **A subject motif**, chosen by the course's `categoryGroup` — code brackets
   and braces for the stack courses, bar columns and database cylinders for
   Data, small neural graphs for AI & ML, clouds and server rails for Cloud,
   shields and padlocks for Security, trend lines and funnels for Marketing,
   ruled rows and a rupee mark for Finance, checklists and rosettes for Career.
2. **The course's own tech logos**, inlined from `public/tech/` and scattered
   at the edges — the same logos the course's Tech Stack section lists.

The second layer is why a motif layer exists at all: logo coverage is very
uneven. `python-full-stack-development` maps to sixteen logos, while five
courses (`aws-the-ultimate`, `digital-marketing`, `cybersecurity`, `tally`,
`placement-readiness-program`) map to none. A collage alone would have left
those five blank.

Placement is deterministic — seeded from the slug — so a course's artwork does
not change between regenerations, and nothing lands in the middle of the band
where the title and stat pills sit. That centre gap is what lets the artwork be
drawn boldly: measured across all twenty, the darkest text-zone contrast is
8.5:1, so nothing in these files threatens the headline.

Total weight is about **82 KB for all twenty**, roughly 4 KB each. A photographic
band would be nearer 250 KB *per course*.

## Keep them legible

The first version of these files was effectively invisible on the page, and it
is worth recording why, because each cause was individually reasonable:

- motif shapes were drawn at 0.07–0.24 opacity;
- a `<rect fill="url(#bg)" opacity="0.18">` was painted over the finished
  artwork as a haze;
- each file carried its own 48px `<pattern id="grid">`;
- and `CourseHero` lays a navy scrim over the whole band.

Multiplied together, a mid-strength shape reached the eye at about **6%**
contrast against the navy. The fix was to drop the internal haze and grid
outright and lift shape opacity to roughly 0.35–0.80. If you add or regenerate
a file, check it against the others in a contact sheet rather than on its own —
faintness only reads as faint by comparison.

## Replacing them with photographs

These are honest placeholders. If you get real photography, there are two ways
in, and neither needs a code change:

- **Per course, from the backend** — send `hero_image_url` on the course. An
  explicit value always wins over the file here.
- **By hand** — replace `<slug>.svg` with your own SVG of the same name.

If a file is missing or fails to load, the band falls back to the patterned
navy it used before — the 48px grid renders only in that case, so it never sits
in front of a backdrop. A course never shows a broken image.

The backdrops carry no grid of their own either; the one in `CourseHero` is the
only one, and it appears only when there is no artwork to show.

## If you supply photographs

| Property | Recommended |
| --- | --- |
| Size | **1920 x 640** or wider — it renders full-bleed |
| Aspect | Roughly 3:1. Cropped with `object-cover`, so the centre survives and the edges may not |
| Weight | Under ~250 KB; it is the first thing on the page |

You do **not** need to pre-darken the file. A shaped navy scrim sits over every
backdrop: light enough at the edges to read the artwork through, concentrated
under the centre where the white type sits. Worked against a pure-white image,
the centre lands at 8.1:1 contrast and the outer edge of the text block at
4.96:1, so any photograph clears AA.

What does matter is **composition**: keep the middle third calm. The title and
the four stat pills sit dead centre, so busy detail or high-contrast logos there
will fight the type. Detail reads best pushed to the left and right edges.

## Regenerating

The generator is not part of the build — these files are committed artwork. It
lived in the scratchpad for the session that produced them; if the catalog gains
courses, the quickest path is to copy an existing file for a course in the same
`categoryGroup` and rename it, or ask for the generator again.

## Files

| File | Course | Motif |
| --- | --- | --- |
| `full-stack-java.svg` | Full Stack Java | code |
| `python-full-stack-development.svg` | Python : Full Stack Development course in Coimbatore | code |
| `frontend-developer-ui-ux-design.svg` | Frontend Developer - UI/UX Design | code |
| `mern-full-stack.svg` | MERN Full Stack | code |
| `mean-full-stack.svg` | MEAN Full Stack | code |
| `c-and-cpp.svg` | C and C++ | code |
| `dsa-with-python-java.svg` | DSA with Python / Java | code |
| `data-analytics.svg` | Data Analytics | data |
| `data-science.svg` | Data Science | data |
| `artificial-intelligence-and-machine-learning.svg` | Artificial Intelligence and Machine Learning | neural |
| `aws-the-ultimate.svg` | AWS - The Ultimate | cloud |
| `aws-and-devops.svg` | AWS & DevOps | cloud |
| `data-engineering.svg` | Data Engineering | data |
| `digital-marketing.svg` | Digital Marketing | growth |
| `gen-ai.svg` | Gen AI | neural |
| `agentic-ai.svg` | Agentic AI | neural |
| `servicenow.svg` | ServiceNow | cloud |
| `cybersecurity.svg` | Cybersecurity | security |
| `tally.svg` | Tally | ledger |
| `placement-readiness-program.svg` | Placement Readiness Program | career |
