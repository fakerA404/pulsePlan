# PulsePlan

**Student:** Saad Arif | **Roll number:** 24i-0106 | **Section:** CY-A

PulsePlan is a fictional small-group fitness studio in Islamabad (F-7 and G-8). The website lets adults and university students browse 12 weekly sessions, search, filter and sort them, open session details, build a plan with attendee counts, register a lead participant, review a calculated total and reach a simulated confirmation.

## Links
- GitHub: https://github.com/fakerA404/web-assignment-pulseplan
- Deployment: _add the public deployment URL before submission_
- Final commit: _add the hash of the final pushed commit_

## Setup and commands
Requires Node.js 20 or newer.

```bash
npm install       # install dependencies
npm run dev       # start the development server
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm test          # run the rule tests (node --test)
npm run lint      # oxlint
```

### Test
`npm test` runs `node --test`, which picks up `tests/bookingRules.test.js`. It tests `validateAttendees` from `src/rules/bookingRules.js`, the same function the checkout page uses. Cases: 3 attendees (valid), exactly 6 (limit), 7 (rejected), 0 (rejected) and 4 attendees when only 3 spots remain (rejected). Result: 5 passed, 0 failed.

### Deployment
The app uses `BrowserRouter`, so the host must serve `index.html` for every path. Both common hosts are already configured:
- **Vercel:** `vercel.json` rewrites all paths to `/index.html`.
- **Netlify:** `public/_redirects` (copied into `dist/`) does the same.

Build command `npm run build`, output folder `dist`.

## Routes
| Route | Purpose |
|---|---|
| `/` | Browse 12 sessions; search, filter by activity, sort by price or time; spots left on every card |
| `/sessions/:id` | Session details, availability and booking rules; unknown IDs show a recovery message |
| `/checkout` | Change attendee counts, remove sessions, fill the registration form, see the fee and total |
| `/confirmation` | Simulated booking summary; the saved plan is cleared |
| any other path | 404 page with a link back to sessions |

## Operating rules
| Rule | Condition | Where shown | Result | Boundary |
|---|---|---|---|---|
| Capacity | 1–6 attendees per booking and no more than the session's spots left | Browse count line, details "Booking rules", hint beside each quantity input | Add buttons stop at the limit; an invalid quantity shows a message and blocks confirmation | 6 accepted, 7 rejected; Boxing (3 spots): 3 accepted, 4 rejected |
| Eligibility | Lead participant age is 16 or older | Hint under the Age field, details page | Specific error; confirmation blocked | 16 accepted, 15 rejected |
| Pricing | Rs 250 service fee when the session total is below Rs 5,000 | Details page, plan summary | Fee added to the total, or shown as "Waived" | Rs 4,800 pays Rs 250; Rs 5,000 pays no fee |

Values are constants in `src/rules/bookingRules.js` (`MAX_ATTENDEES`, `MIN_AGE`, `SERVICE_FEE`, `FEE_WAIVER_THRESHOLD`).

## Reproducing edge cases
Open **Demo controls for edge cases** at the bottom of `/`. Settings last for the browser tab (sessionStorage).
1. **Loading failure:** tick *Simulate loading failure*, press *Reload schedule* → error message. Untick it and press *Try again* → sessions load.
2. **Changed availability:** add Boxing Conditioning, tick *Make Boxing Conditioning unavailable*, open `/checkout` → "Availability changed" warning; confirmation is blocked until it is removed.
3. **Restored selection no longer exists:** in DevTools run `localStorage.setItem('pulseplan-selection', '[{"id":"old-class","attendees":2}]')` and open `/checkout` → "Saved session removed" with a *Remove from plan* button.
4. **Invalid form input:** enter a name, age 15 and phone `12345` and submit → specific errors; the name is kept. Editing a field clears its error.
5. **Capacity:** set Boxing Conditioning to 4 attendees → "Only 3 spots remain"; set any session to 7 → "at most 6 attendees".
6. **Empty results / invalid URL:** search `zzz` → *Clear search and filter*; open `/sessions/not-real` → recovery link.
7. **Missing image:** a failed image is replaced by a labelled placeholder (`SessionImage`).

## Concept map
| Concept | File | Component / function |
|---|---|---|
| Routing, URL params | `src/App.jsx`, `src/pages/DetailsPage.jsx` | `App`, `Routes`, `useParams` |
| Components, props | `src/components/Header.jsx`, `src/components/SessionImage.jsx` | `Header`, `SessionImage` |
| Callback props | `src/App.jsx` → pages | `onAdd`, `onUpdate`, `onRemove`, `onRemoveMany`, `onClear` |
| Shared state, immutable updates | `src/App.jsx` | `selection`, `addSession`, `updateAttendees`, `removeSessions` |
| Persistence | `src/App.jsx` | `readSelection`, `useEffect` → `localStorage` |
| Async loading, effect cleanup | `src/utils/mockLoader.js`, `src/hooks/useSessions.js` | `loadSessions`, `useSessions` |
| Search / filter / sort | `src/pages/BrowsePage.jsx` | `filtered` (`useMemo`) |
| Controlled form, validation | `src/pages/CheckoutPage.jsx` | `form`, `updateField`, `submit` |
| Business rules | `src/rules/bookingRules.js` | `validateAttendees`, `validateAge`, `validatePhone`, `calculateServiceFee` |
| Derived summary | `src/pages/CheckoutPage.jsx` | `attendeeCount`, `subtotal`, `serviceFee`, `total` |
| Automated test | `tests/bookingRules.test.js` | `node:test` cases |

## Simulated operations and limitations
- Bookings are simulated: nothing is sent to a server and no payment is taken. Name and phone are not saved.
- Session data and availability are local demo data, not a live studio system.
- Session photos load from Unsplash; offline, the labelled placeholder is shown.
- Only the plan (session IDs and attendee counts) is persisted; form entries reset on reload.
