# Dev fixtures

These exist because the course detail page was built before
`/api/courses`, `/api/testimonials`, `/api/leads` and `/api/settings` were
implemented on the Spring Boot side.

## How it works

`VITE_USE_MOCKS=true` (set only in `.env.development`) makes each service
resolve from `fixtures.js` instead of calling the network. The result still
goes through the same `normalize*` function as a real response, so the mock
path cannot quietly become a second contract.

`fixtures.js` holds the testimonial and settings fixtures and re-exports
`COURSES` from `catalog.js`, which carries all twenty seeded courses. Add a
course there — `makeCourse()` fills in the fields that are the same across the
catalog, and its tech stack is written as `{ 'Group Name': ['Tool', …] }` in the
order the groups should render.

## Forcing states in the browser

| URL | What you get |
| --- | --- |
| `/` | Dev index listing every seeded course |
| `/courses/python-full-stack-development` | The Course_Page.pdf reference course — five tech groups, ten modules, 30% off |
| `/courses/full-stack-java` | Five tech groups and a two-column role section |
| `/courses/tally` | Four groups and a one-column role section |
| `/courses/gen-ai` | A three-group course with no discount and no badge |
| `/courses/does-not-exist` | 404 → "Course not found" |
| `?mockState=slow` | 5s delay → skeletons |
| `?mockState=error` | 500 → error state with retry; lead form returns a 400 with field errors |
| `?mockState=empty` | Course with no modules, tech stack, role copy or testimonials |

## Removing this

1. Set `VITE_USE_MOCKS=false` in `.env.development`.
2. Confirm the four endpoints against the shapes in `fixtures.js` and
   `catalog.js`.
3. Delete `src/mocks/` and the `isMockEnabled()` branch in each service.

Nothing outside `src/services/` imports this folder.
