# Keyword Feedback Collector — Business Plan

**Target audience:** product managers, community managers, content teams, and small-to-medium businesses running WordPress sites who want lightweight, interactive keyword feedback from visitors.

---

## 1. Executive summary

Keyword Feedback Collector is a lightweight embeddable widget and admin board system that lets site visitors submit free-form keywords or short phrases. Submissions are aggregated on a collaborative whiteboard where keywords grow visually in proportion to frequency (think word cloud / Wordle dynamics). Boards are created and managed via a Next.js 15 application backed by Prisma, and each board produces an embeddable link (JS snippet / iframe) that customers paste into WordPress pages or posts.

Primary benefits:

- fast capture of qualitative keyword-level feedback from website visitors
- visual, shareable summary that highlights trends at a glance
- simple integration for content owners (one embed link)

Business model: freemium SaaS — free tier with limited boards and views; paid tiers add analytics, moderation, customization, export, and team seats.

---

## 2. Problem & opportunity

Many teams want a simple way to ask visitors one open question (e.g. "What words come to mind when you see this product?") and see aggregate patterns. Existing tools are either heavy (survey platforms), lack visualized aggregation (basic forms), or require engineering effort to integrate. An embeddable keyword board that visualizes frequency in real time meets a niche need for quick qualitative insight, conversion optimization, and content validation.

Market signals: content teams, UX researchers, marketing teams, and small e-commerce stores frequently run lightweight tests and would appreciate an easy, low-friction tool.

---

## 3. Product concept & core user flows

High-level flows:

1. **Create board:** user signs up, creates a board (title, description, optional prompt, moderation settings, theme). Optionally set board to open/closed and enable IP/session rate limits.
2. **Embed board:** system generates a unique embeddable link and JS snippet (or iframe) to place in WordPress. Also provide a direct public link to the board.
3. **Collect keywords:** visitors type keywords/phrases via the embedded widget; client-side validation prevents injection and rate abuse.
4. **Visualise:** keywords appear on the board in near real time; more frequent keywords scale up in font size and prominence; related/nearby terms can cluster or be suggested via simple fuzzy matching.
5. **Moderate & export:** board owner can moderate (approve, merge, delete), tag keywords, and export results (CSV/JSON). Analytics dashboard shows top keywords, time series, unique contributor counts, and embed performance.

User personas & needs:

- **Content marketer:** quick view of visitor sentiment for headline testing.
- **Product manager:** capture common feature terms during product launch.
- **UX researcher:** lightweight card-sorting / open-response capture.

---

## 4. MVP feature list (must-have)

**Creator / Admin:**

- Sign up / login (email + password, OAuth optional)
- Create, name and describe boards
- Board settings: public/private, moderation (auto-approve vs manual), max submissions per IP/session
- Embeddable link + copy-paste snippet for WordPress (iframe + JS widget option)
- Admin whiteboard UI: live keyword cloud, simple moderation actions (delete, merge, pin)
- Export top keywords to CSV

**Visitor widget:**

- Typing area with prompt and short character limit (e.g. 1–6 words / 80 chars)
- Submit button and lightweight validation
- Visual feedback (submitted, thanks message)
- Real-time display of top N keywords with sizes scaled by frequency

**Analytics & Ops:**

- Dashboard showing total submissions, unique contributors, top keywords, trends over last 7/30/90 days
- Basic rate-limiting and spam protection (CAPTCHA optional)

---

## 5. Technical considerations (high-level)

**Stack:**

- Frontend: Next.js 15 (React) for admin app and public board pages
- Backend: Next.js server components / API routes or a thin Nest/Express API (still Next-first)
- DB: Prisma ORM over PostgreSQL (production) — models: User, Board, Submission, ModerationAction, Visit/Session
- Realtime: WebSockets (e.g. native WebSocket, or Pusher / Supabase Realtime) for live updates, or short-polling fallback
- Embeds: Provide an iframe-hosted public board and a lightweight JS widget (UMD) for dynamic, inline embedding
- Hosting: Vercel or similar for front-end, managed Postgres (Supabase / Neon / Heroku) for DB

**Scalability:** the main scale challenge is many concurrent viewers and frequent submissions. Use message queues or pub/sub for broadcasting updates; cache aggregated counts for fast retrieval.

**Security / privacy:** prevent XSS in embeds, sanitise inputs, do not store raw IPs unless necessary (store hashed or use rate-limiting tokens). Provide GDPR-friendly export and deletion.

---

## 6. Data model (conceptual)

- **User**: id, email, hashed_password, plan
- **Board**: id, owner_id, title, prompt, settings (moderation, open/close), embed_token, created_at
- **Submission**: id, board_id, text (sanitised), normalised_key, count (if deduped), contributor_id (nullable), created_at
- **ModerationAction**: id, board_id, submission_id, action_type, actor_id, timestamp
- **Visit/Session**: optional short-lived session token, user_agent, timestamp (for analytics)

Note: for real-time size scaling store both raw submissions and maintain incremental aggregates (top N keywords per board) for display.

---

## 7. UX & visual behaviour

- Word-cloud layout where font size ∝ sqrt(frequency) or similar to keep sizes reasonable
- Smooth transitions for growing/shrinking keywords
- Tap/click a keyword to see counts, related submissions, or to pin/expand
- Mobile-first widget design (small footprint) but fullscreen board option for public view

---

## 9. Go-to-market strategy

Phase 1 (MVP):

- Target WordPress site owners and content/marketing Slack communities
- Launch a simple landing page and a demo embed to try
- Outreach via product hunt, IndieHackers, and targeted content marketing (how-to: "How to validate headlines with a keyword board")

Phase 2:

- Build integration guides (WordPress plugin or short snippet + Gutenberg block)
- Offer templates for use-cases (headline testing, feature discovery, product naming)

Partnerships: WordPress plugin ecosystem, UX research communities, digital agencies.

---

## 10. Key metrics (OKRs)

- **Acquisition:** sign-ups per week, embed installs
- **Engagement:** submissions per board per day, unique contributors per board
- **Retention:** boards active after 30/60/90 days
- **Monetisation:** conversion rate from free → paid, ARR
- **Quality:** spam rate, moderation actions per board

--

## 12. Risks & mitigations

- **Spam / abuse:** implement rate-limits, CAPTCHAs, moderation queue, IP/session heuristics
- **Embed security (XSS):** always iframe isolate embeds, sanitise and escape all content, CSP headers
- **Low adoption:** focus on a few strong use-cases and provide easy copy-paste embed + WordPress guide

---

## 13. Acceptance criteria for Cursor (to guide development tasks)

Provide short, testable acceptance criteria to be fed into Cursor tasks:

**Board creation:**

- Given an authenticated user, when they create a board with title and prompt, then a board record exists and an embed token is generated.

**Embed snippet:**

- Given a board exists, when a user copies the embed snippet and places it in a WP test page, then visitors can submit keywords and see the live cloud.

**Submission processing:**

- Given multiple visitors submit the same keyword in different forms (case, minor punctuation), then the system normalises and aggregates them to a single keyword count.

**Moderation:**

- Given a board with manual moderation enabled, new submissions remain hidden from the public board until approved by a board admin.

**Export:**

- Given a board owner requests export, then the system returns a CSV of keywords and counts, filtered by date range.

**Rate-limiting:**

- Given repeated rapid submissions from the same source, the system rejects submissions after configured threshold and logs the event.

---

## 14. Suggested deliverables to hand to engineering in Cursor

- User stories & acceptance criteria (above)
- Wireframes for embed widget + full-screen board + admin moderation panel
- API contract sketches (no code): endpoints, request/response shapes for create board, submit keyword, fetch top keywords, moderate
- DB schema draft (ER diagram or Prisma model sketch)
- QA checklist and performance targets (e.g. 95th percentile render time under X ms)

---

## 15. Next steps

1. Confirm target personas and primary use-case to scope MVP tightly.
2. Produce 3–5 wireframe screens.
3. Create Cursor tasks from acceptance criteria and prioritise the MVP backlog.

---

_Prepared for Cursor import — use the “Acceptance criteria” and “Suggested deliverables” sections as the primary ticket sources for engineering work._
