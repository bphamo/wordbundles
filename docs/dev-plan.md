# Keyword Feedback Collector — Phase-Based Development Plan for MVP

## Phase 1: Core Infrastructure & Authentication

**Goals:** Enable secure user sign-up, authentication, and basic admin panel.

- Implement email/password auth (NextAuth or custom solution).
- User profile creation with plan type.
- Configure Prisma with PostgreSQL.
- Initial schema migration for User, Board, Submission.

## Phase 2: Board Creation & Management

**Goals:** Allow creation and configuration of boards.

- Board creation form: title, description, prompt, moderation setting.
- Generate unique embed token for each board.
- Board settings edit page.
- List view of user’s boards with status.

## Phase 3: Keyword Submission & Real-Time Updates

**Goals:** Enable visitors to submit keywords and see updates instantly.

- API endpoint for submission (rate-limited).
- Normalize keywords for aggregation.
- Implement WebSockets or pub/sub for real-time updates.
- Update word cloud dynamically based on frequency.

## Phase 4: Embeddable Widget & Public Board View

**Goals:** Provide embeddable iframe for WordPress integration.

- Public board page rendering live keyword cloud.
- Generate embed code snippet (iframe + direct link).
- Create minimal visitor widget UI: prompt, input, submit button.
- Sanitize and validate submissions.

## Phase 5: Moderation Tools

**Goals:** Provide admins control over submissions.

- Manual moderation queue if enabled.
- Approve/reject submissions.
- Merge similar keywords.
- Delete inappropriate entries.

## Phase 6: CSV Export

**Goals:** Allow board owners to export keyword data.

- Export top keywords with counts to CSV.
- Filter by date range.
- Download from admin panel.

## Phase 7: Basic Analytics & Rate-Limiting

**Goals:** Show basic board performance and protect from spam.

- Dashboard with total submissions, unique contributors, top keywords.
- Implement IP/session-based submission limits.
- Optional CAPTCHA integration.

## Phase 8: Testing & Deployment

**Goals:** Ensure stability and quality.

- Write automated tests for key flows (creation, submission, moderation).
- Manual QA of embeds on WordPress.
