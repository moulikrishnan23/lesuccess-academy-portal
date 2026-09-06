# Course page artwork

## The completion certificate is drawn, not photographed

The **Get Your Certificate** section of the course detail page renders an
inline SVG from `src/components/sections/CertificateSection.jsx`. It is drawn
to match the issued LeSuccess declaration of completion — the green and gold
corner wedges, the CERTIFIED rosette, the wordmark and the seal — and it names
the course being viewed.

**There is deliberately no shared `certificate.png`.** An earlier version
rendered one image file for all twenty courses, so every course page showed a
certificate reading FULL STACK PYTHON DEVELOPMENT. A raster certificate has its
course name baked into pixels; only the vector can say the right thing on
twenty different pages.

The award line fits itself to the title: one line where the name fits, two
where it does not, with the type size chosen to suit. `Tally` and `Artificial
Intelligence and Machine Learning` both sit correctly without any per-course
configuration.

### Course names on the certificate

The award line drops a trailing SEO phrase from the catalog title, because the
line above it already reads *has successfully completed the course*:

| Catalog title | On the certificate |
| --- | --- |
| Python : Full Stack Development course in Coimbatore | PYTHON: FULL STACK DEVELOPMENT |
| Artificial Intelligence and Machine Learning | ARTIFICIAL INTELLIGENCE<br>AND MACHINE LEARNING |
| Tally | TALLY |

### If you want a photographed certificate

`CertificateSection` still accepts an `imageUrl` prop, and an image passed that
way replaces the drawing. Use it **only for artwork specific to the course
being shown** — a per-course `certificate_sample_url` from the backend, for
instance. Pointing it at one shared file brings the original bug straight back.

If the image fails to load, the drawing takes over, so the section never shows
a broken image.

## `hero/`

Per-course hero backdrops. See `hero/README.md`.
