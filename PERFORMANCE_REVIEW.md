# Performance investigation — 29 October 2026

Branch: dev-mouli. Local changes only; no deployment, commit, push, or hosting-plan changes.

## What was measured

The current frontend is https://www.lesuccess.co.in/. The older https://lesuccess.in/ serves a different jQuery site and was excluded from conclusions about this application.

Read-only Chrome measurements on the current production frontend, 1366 x 768:
- HTML TTFB: 175 ms.
- First contentful paint: 2,064 ms. This includes the existing intentional splash, not time until the user completes its scroll interaction.
- Initial public API requests: 964–1,992 ms.
- First trace: main-thread long tasks of 449 ms and 85 ms. These observations do not establish their JavaScript/rendering attribution.
- Separate direct /api/team-members probes after warm-up: 850, 548, 559 ms. These include network and server time; server/database duration cannot be separated without backend tracing.
- Warm in-app navigation until the heading became visible: Team 505 ms, Gallery 1,213 ms, Courses 733 ms. These are not full-content completion or INP measurements.
- No cold start was observed or deliberately induced. No restart/idle-cycle test was performed. Monthly visitor counts do not establish peak concurrency or justify an upgrade.

Single-run samples are diagnostic, not statistical benchmarks. A later navigation sample ran alongside local test processes and its long-task timings are not used for before/after claims.

## Confirmed findings and fixes

1. **Gallery request waterfall and duplicate root data**
   - File: frontend/src/pages/Gallery/GalleryPage.jsx
   - The provider and Gallery both requested root categories on direct entry. Folder loading awaited category, optional parent, subfolders, then images.
   - Gallery now reuses the provider's root data; subfolder/image requests run concurrently after the folder ID is known. Optional parent breadcrumbs update independently.
   - Added abort/obsolete-result protection, real folder loading/error states, and folder retry. Rapid navigation no longer lets an earlier folder overwrite the new view.

2. **Team content waited for unused metadata**
   - File: frontend/src/context/AppDataContext.jsx
   - Promise.allSettled held member rendering until category administration metadata completed. Neither public Team consumer reads that category list; each derives visible filters from members.
   - Removed the public category request. Admin category management is untouched.
   - Initial provider dispatch also skips a discarded StrictMode effect, avoiding duplicate development requests.

3. **Unbounded persisted public caches**
   - File: frontend/src/context/AppDataContext.jsx
   - Cache savedAt existed but was not checked; successful empty responses did not overwrite old records.
   - Persisted public content older than five minutes is ignored on mount, normal mount revalidation remains, and successful empty responses replace persisted data.
   - This is not polling or an automatic five-minute refresh of an already-open tab. Existing in-memory snapshots/manual refetch behavior remain.
   - No new caching of authenticated/private responses, no global GET response cache, and no authentication changes.

4. **Cancelled requests were treated as network failures**
   - File: frontend/src/services/apiClient.js
   - The no-response retry branch included Axios cancellations, adding a three-second delay/retry to abandoned requests.
   - Cancellation/aborted signals now reject immediately. Genuine failure retry behavior is unchanged.

5. **Mock fixtures shipped to production**
   - Files: frontend/src/services/{courseApi,settingsApi,chatApi,leadApi,testimonialApi}.js
   - Static mockGateway imports pulled fixtures into the default deployment (94.43 KB raw / 29.78 KB gzip in the earlier local build; about 31 KB transferred in the live sample).
   - Mock handlers are dynamically imported only inside the explicit VITE_USE_MOCKS flag branch. The normal production output no longer contains this chunk. Mock functionality is retained.

6. **Oversized images**
   - frontend/src/components/home/OurTeam.jsx: changed the background URL from the existing 1,551,004-byte PNG to its already-used 13,280-byte WebP counterpart. No generated artwork or layout change.
   - frontend/src/utils/imageUtils.js: existing course-logo resolver now requests a capped 160px Cloudinary variant using the existing safe optimization helper.
   - Sample current production course icon: original 717,356 bytes; optimized response 5,781 bytes. This is a measured sample, not a guarantee for every image.
   - Existing transformations/non-Cloudinary URLs remain unchanged; c_limit avoids upscaling.

## Repeatable local before/after

Production-mode local preview, same Chrome/fixture script and controlled API delays:
- Team members: 200 ms; unused category endpoint: 2,000 ms.
- Gallery folder/images/subfolders: 200 ms each; optional parent: 1,200 ms.
- New page contexts; no stored content cache.

| Measurement | Before | After |
| --- | ---: | ---: |
| Team heading visible from navigation start | 2,814 ms | 976 ms |
| Gallery root visible | 755 ms | 750 ms |
| Gallery root request count | 2 | 1 |
| Gallery folder image request complete from navigation start | 2,367 ms | 1,070 ms |
| Public team-category requests | 1 | 0 |

The improvement is specifically removal of frontend waiting/duplicate work. These are simulated API-delay measurements, not deployed after-change measurements. Changes have not been deployed.

## Validation

Added frontend/e2e/performance-loading.spec.js:
- Team is independent of category administration.
- Gallery root reuse; folder usable before optional parent resolves; obsolete parent cannot overwrite root after navigation.
- Empty responses clear old persisted records.
- Expired cached members are not revived on a server failure.
- Production page does not request mock fixture code.

Full ESLint and local-preview build passed. Production build was also run.
Five focused tests plus four existing responsive multi-page tests passed sequentially: 9/9, desktop/laptop/tablet/mobile; no overflow or runtime errors in those checks.
Existing interaction tests for the game, mobile demo booking, both chatbot modes, Connect form, and reduced-motion components passed in the broader run.

The initial broader parallel run was not fully green: 13 passed, 8 failed. Four responsive timeouts passed on the sequential rerun. Two older tests expect the custom cursor that was intentionally removed earlier; remaining header/video tests were not resolved by this performance patch. Do not interpret this as an all-tests-pass claim. Playwright also emitted environment NO_COLOR/FORCE_COLOR warnings.

## Remaining limits and bottlenecks

- Warm API latency still includes roughly 0.5–2 seconds in these samples; backend/database/network attribution needs server timings/traces, not a hosting-plan assumption.
- Existing global provider still preloads six public data groups on application entry; this patch removes the confirmed duplicate/unused calls without a provider rewrite.
- API client retains its existing 300-second timeout plus one delayed GET retry. Failure recovery can therefore take a long time. Cold-start measurements are needed before choosing a shorter timeout/retry policy.
- Home's 26.65 MB video remains unchanged. It uses preload=none and visibility-driven playback, but playback can still consume substantial bandwidth. No video recompression or redesign was authorized as necessary by these measurements.
- Initial main-thread long tasks still need a dedicated uncontended CPU trace for attribution. Existing scroll splash is intentional UX, not backend loading; its timing was preserved.
- Route-level lazy loading, separated provider contexts, image lazy loading, RAF-throttled hover motion with cleanup, and visibility-aware animations already exist. No blanket memoization or new dependencies were added.
- Public lists are unpaginated in several places. No measured large-list rendering bottleneck justified a virtualization/API-contract change here. Backend catalog tools are already fetched in a batch, not one tools query per course.
- No production after-change measurements or production persistence checks were possible without deployment, which was explicitly prohibited.
