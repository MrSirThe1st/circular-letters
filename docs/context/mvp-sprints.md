# MVP Execution Plan (Next 2 Sprints)

## Goal
Deliver a usable read/listen experience in mobile backed by published sermon content.

## Sprint 1 (Foundation)

### Scope In
- Mobile app read path scaffold (list + detail + audio player shell)
- Published sermon data service contract for mobile consumption
- French-first UI copy and reading-optimized layout

### Scope Out
- Offline download/cache
- Favorites/notes/accounts
- Full-text search in sermon body

### Acceptance Criteria
- User can open app and see latest published sermons
- User can open sermon detail and read full content
- User sees audio player controls when audio exists
- Empty/loading/error states are present on both list and detail views

## Sprint 2 (Data Integration)

### Scope In
- Public read API for published sermons only
- Mobile integration from mock service to real API service
- Basic search by title/date
- Regression coverage for read API and mobile data states

### Scope Out
- Semantic/within-content search
- Personalized feeds

### Acceptance Criteria
- Only published sermons are returned to mobile
- Search filters update list in near real-time
- API returns `ApiResult<T>` shape for success and failures
- Mobile handles API/network failures with user-friendly feedback

## Delivery Order
1. Mobile read flow scaffold
2. Public published-sermons API
3. Mobile API integration
4. Search v1
5. QA, fixes, and release checklist

## Risks and Mitigations
- Missing public API can block mobile progress
  - Mitigation: keep mock-backed service interface stable and swap implementation only.
- Lexical content rendering differences between web and mobile
  - Mitigation: extract plain text fallback first, improve formatting in iteration.
- Inconsistent publish-state filtering
  - Mitigation: enforce status filter in repository + API tests.