import { Link, useParams } from 'react-router-dom'
import SessionImage from '../components/SessionImage.jsx'
import useSessions from '../hooks/useSessions.js'
import { attendeeLimit, FEE_WAIVER_THRESHOLD, MAX_ATTENDEES, SERVICE_FEE } from '../rules/bookingRules.js'

export default function DetailsPage({ selection, onAdd }) {
  const { id } = useParams()
  const { sessions, status, retry } = useSessions()

  if (status === 'loading') return <div className="page state-card" role="status"><span className="spinner" /> Loading session…</div>
  if (status === 'error') return (
    <div className="page state-card error-state" role="alert">
      <h1>Could not load details</h1>
      <p>The schedule did not load. Your saved plan has not changed.</p>
      <div className="state-actions">
        <button type="button" className="primary-button" onClick={retry}>Try again</button>
        <Link className="secondary-button" to="/">Back to sessions</Link>
      </div>
    </div>
  )

  const session = sessions.find((item) => item.id === id)
  if (!session) return (
    <div className="page state-card">
      <p className="eyebrow">Invalid session</p>
      <h1>This session does not exist</h1>
      <p>No session matches “{id}”. It may have been removed or the link may be incorrect.</p>
      <Link className="primary-button" to="/">Browse sessions</Link>
    </div>
  )

  const planned = selection.find((item) => item.id === session.id)
  const limit = attendeeLimit(session)
  const atLimit = planned && planned.attendees >= limit

  return (
    <div className="page details-layout">
      <div>
        <Link className="back-link" to="/">← Back to sessions</Link>
        <SessionImage className="details-image" src={session.image} alt={`${session.title} class in progress`} label={session.type} />
      </div>
      <section className="details-panel">
        <p className="eyebrow">{session.type} · {session.level}</p>
        <h1>{session.title}</h1>
        <p className="details-description">{session.description}</p>
        <dl className="details-list">
          <div><dt>Time</dt><dd>{session.time} · {session.duration} minutes</dd></div>
          <div><dt>Instructor</dt><dd>{session.instructor}</dd></div>
          <div><dt>Location</dt><dd>{session.location}, Islamabad</dd></div>
          <div><dt>Availability</dt><dd>{session.spots === 0 ? 'Fully booked' : `${session.spots} ${session.spots === 1 ? 'spot' : 'spots'} remaining`}</dd></div>
          {planned && <div><dt>In your plan</dt><dd>{planned.attendees} {planned.attendees === 1 ? 'attendee' : 'attendees'}</dd></div>}
        </dl>
        <div className="notice">
          <strong>Booking rules</strong>
          <span>1 to {MAX_ATTENDEES} attendees per booking, and no more than the spots remaining. The lead participant must be 16 or older.</span>
          <span>A Rs {SERVICE_FEE} service fee applies to plans under Rs {FEE_WAIVER_THRESHOLD.toLocaleString()}.</span>
        </div>
        <div className="details-buy">
          <strong>Rs {session.price.toLocaleString()} <small>per attendee</small></strong>
          {session.spots === 0 && <button type="button" className="secondary-button" disabled>Fully booked</button>}
          {session.spots > 0 && atLimit && <button type="button" className="secondary-button" disabled>Limit reached ({limit})</button>}
          {session.spots > 0 && !atLimit && (
            <button type="button" className="primary-button" onClick={() => onAdd(session)}>{planned ? 'Add another attendee' : 'Add to plan'}</button>
          )}
        </div>
        {planned && <Link className="text-link" to="/checkout">Review my plan →</Link>}
      </section>
    </div>
  )
}
