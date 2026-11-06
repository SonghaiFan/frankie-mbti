# MBTI introduction: source and UI audit

Reviewed 2026-11-06. Scope is the standalone introduction and relevant Pages watch paths only. App behavior and its current Frank MBTI branding are preserved.

## Design read

Reading this as an explanatory guide for people exploring personality concepts, preserving the actual app's white/ink editorial stage. Variance5, motion2, density4. Actual source tokens: white paper, #111111 ink, #6b6b6b secondary text and #e8e8e6 hairlines. NT/NF/SJ/SP accents remain semantic group colors. Native CSS with comparable system sans fallbacks; no network font or new UI dependency. The app's light theme takes priority over generic dual-theme defaults.

## Real app opened

Opened https://frank-mbti.vercel.app in shared Ego workspace9, page3. Inspected the default INFP stage, toggled its first preference to ENFP and opened the real character profile. Navigated Groups, Claims and Pairing. Waited for actual claim records/source titles and character imagery. Five current captures are under `site/assets/*-current.png`. No private history, API key, AI generation, connection test or paid request was used.

## Source read

- `src/app/page.tsx`, `components/type-stage.tsx`, `store/mbti-store.ts`: featured INFP, four switches rewrite one letter, local profile data and expanded type sheet. Stage does not require Neo4j or a model call.
- `src/app/globals.css`, `layout.tsx`, `styles/mbti-styles.ts`: actual palette, Outfit/Noto Sans app typography, hairlines, group accents and responsive frame.
- `src/data/core/mbti-data.ts`: sixteen profiles, original character paths, ordered function stacks, four group families, authored pairing scores, eight-slot relation mapping and preference descriptions.
- `mbti-dimensions.tsx`, `mbti-cognitive-functions.tsx`: dominant-function deduction, expandable definitions/slot readings. Intro explains notation without calling it a measured brain model.
- `groups-view.tsx`, `dominant-functions-view.tsx`, `mbti-compact-table.tsx`, `pairing-reels-view.tsx`: group/function browsing, searchable index and two-reel pairing. Scores and “official” best-partner labels in the app are collection readings, not represented as scientific relationship probabilities in the intro.
- `mbti-test.tsx`: four questions choose one letter each. This is accurately described as a shortcut, not the official MBTI instrument.
- `claims-view.tsx`, `hooks/use-type-claims.ts`, `services/claims-service.ts`, `api/mbti/claims/route.ts`: type/context/kind/function/keyword filtering, source number/title, group inheritance, Neo4j/local-data server fallback. A source label is distinguished from empirical confirmation of a claim.
- `agent-chat-view.tsx`, `api/mbti/agent/route.ts`, `services/mbti-agent-service.ts`: optional consultation sends history via server; current Gemini/custom key flow, browser-retained key/model and rule-based collection fallback. No key values or environment files read.

The intro demo is an explicit small adaptation of the real stage logic, using sixteen records extracted at build time and the unchanged original SVG assets. It does not pretend to embed the full application.

## Primary concept research

Read [Myers & Briggs Foundation: The MBTI Preferences](https://www.myersbriggs.org/my-mbti-personality-type/the-mbti-preferences/) and [The Myers-Briggs Company: MBTI Facts](https://www.themyersbriggs.com/en-US/Support/MBTI-Facts). Used the Foundation page for concise paraphrased definitions of the four preference pairs. The source explicitly distinguishes preferences from skill/ability. The intro independently explains this app's shortcut and authored content; no efficacy, diagnosis or compatibility validation is invented.

## Verification

- Python standard-library build: English root plus Chinese `/zh/`.
- Local asset/link checker: two pages, zero issues.
- `node --check site/demo.js` and `git diff --check` pass.
- Browser validation results appended after final checks.
- No Lighthouse score claimed: not run through the approved shared browser interface.
- Tested all sixteen type combinations through the real intro switch buttons; code and stack were present for every state.
- EN and Chinese target viewport390×844: `scrollWidth === innerWidth ===390`. Desktop and mobile screenshots visually inspected. Mobile Chinese headline adjusted to avoid a one-character orphan.
- Re-captured Groups after its entry fade completed; Pairing’s visible reel images were visually inspected. Its many off-screen lazy reel images are intentionally not all loaded by the app.
- The project agent leaves the shared workspace open for the coordinating agent and does not commit/push.
