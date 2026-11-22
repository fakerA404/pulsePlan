# Frontend decisions

## 1. Persistent plan across routes (interaction / state)
- **Problem:** On the reference fitness sites, moving between listings, details and booking can lose the class or quantity the user picked.
- **Decision:** Keep the plan (`{ id, attendees }` per session) in one React state in `App`, saved to `localStorage`. The header badge, browse cards, details page and checkout all read that state. On restore, saved IDs are checked against the current schedule, and missing or fully booked sessions are flagged with a fix.
- **Alternative:** Keep the selection only on the checkout page, or encode it in the URL.
- **Reason:** Visitors can compare classes across pages and come back later without starting again.
- **Tradeoff:** Saved IDs can go out of date, so checkout needs extra conflict checks and messages.
- **Code location:** `src/App.jsx` (`App`, `readSelection`, `addSession`, `updateAttendees`, `removeSessions`); `src/pages/CheckoutPage.jsx` (`missingIds`, `unavailable`).
- **Evidence:** Add a session, open another session's details, press Back, reload the page → badge and checkout still show the plan. Screenshots: `screenshots/details-desktop.png`, `screenshots/checkout-desktop.png`.

## 2. Availability and key facts on every card (information hierarchy / mobile layout)
- **Problem:** Reference listings leave out details needed to compare classes (spots left, level, price), so users only find out after opening a class.
- **Decision:** Put search, filter and sort above a 3-column grid that becomes 1 column at 390 px. Each card shows type, level, time, duration, location, price, spots left (coloured and written as text) and one primary action. The action is disabled with a reason when the session is full or the plan limit is reached.
- **Alternative:** A compact table, or text-only cards with availability shown only on the details page.
- **Reason:** Users can rule out full or unsuitable sessions straight from the list, on phones as well.
- **Tradeoff:** Image cards take more vertical space and depend on image assets (a fallback placeholder covers failed images).
- **Code location:** `src/pages/BrowsePage.jsx` (`BrowsePage`); `src/components/SessionImage.jsx`; `src/App.css` (`.session-grid`, `.spots`, media queries).
- **Evidence:** Open `/` at 1280 px and 390 px → spots left shown on every card, no horizontal overflow. Screenshots: `screenshots/browse-desktop.png`, `screenshots/browse-mobile.png`.

## 3. Controlled, in-place form validation (interaction / state)
- **Problem:** Reference booking forms show unclear errors late or clear what the user entered.
- **Decision:** Name, age, phone and studio area are controlled inputs. Rule hints are shown beside fields before submission. On submit, each invalid field gets its own message and a summary line, valid input is kept, and editing a field clears its error.
- **Alternative:** Browser-only validation (`required`, `min`), or clearing the form after an error.
- **Reason:** Users fix only what is wrong, so registering takes fewer attempts.
- **Tradeoff:** Custom validation has to be maintained for every field and rule.
- **Code location:** `src/pages/CheckoutPage.jsx` (`submit`, `updateField`, `clearError`); `src/rules/bookingRules.js` (`validateAge`, `validatePhone`, `validateAttendees`).
- **Evidence:** Enter a valid name, age 15 and an invalid phone, then submit → two specific errors and the name is kept. Change age to 16 → that error disappears. Screenshot: `screenshots/checkout-validation.png`.
