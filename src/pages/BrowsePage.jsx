import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SessionImage from '../components/SessionImage.jsx'
import useSessions from '../hooks/useSessions.js'
import { attendeeLimit, MAX_ATTENDEES } from '../rules/bookingRules.js'
import { DEMO_FULL_SESSION_KEY, DEMO_LOAD_ERROR_KEY } from '../utils/mockLoader.js'

const ACTIVITY_TYPES = ['Yoga', 'Strength', 'Pilates', 'Boxing', 'Cardio', 'Mobility']

function readDemo(key) {
  return sessionStorage.getItem(key) === 'true'
}

export default function BrowsePage({ selection, onAdd }) {
  const { sessions, status, retry } = useSessions()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [sort, setSort] = useState('recommended')

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    const result = sessions.filter((session) => {
      const searchable = `${session.title} ${session.type} ${session.level} ${session.instructor} ${session.location}`.toLowerCase()
      return searchable.includes(search) && (type === 'All' || session.type === type)
    })
    if (sort === 'price') return [...result].sort((a, b) => a.price - b.price)
    if (sort === 'time') return [...result].sort((a, b) => a.time.localeCompare(b.time))
    return result
  }, [sessions, query, type, sort])

  const plannedCount = selection.reduce((sum, item) => sum + item.attendees, 0)

  function toggleDemo(key, checked) {
    sessionStorage.setItem(key, String(checked))
  }

  return (
    <div className="page">
      <section className="browse-hero">
        <div>
          <p className="eyebrow">Islamabad · This week</p>
          <h1>Find a session that fits.</h1>
          <p>Small-group training in F-7 and G-8, with clear availability and no surprise charges.</p>
        </div>
        <Link className="primary-button" to="/checkout">Review my plan ({plannedCount})</Link>
      </section>

      <section className="browse-controls" aria-label="Search and filter sessions">
        <div className="field">
          <label htmlFor="search">Search sessions</label>
          <input id="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try yoga, Maha or G-8" />
        </div>
        <div className="field">
          <label htmlFor="type">Activity</label>
          <select id="type" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="All">All activities</option>
            {ACTIVITY_TYPES.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="recommended">Recommended</option>
            <option value="price">Lowest price</option>
            <option value="time">Earliest time</option>
          </select>
        </div>
      </section>

      {status === 'ready' && sessions.length > 0 && (
        <p className="results-count" role="status">
          Showing {filtered.length} of {sessions.length} sessions · up to {MAX_ATTENDEES} attendees per booking
        </p>
      )}

      {status === 'loading' && <div className="state-card" role="status"><span className="spinner" /> Loading this week’s sessions…</div>}
      {status === 'error' && (
        <div className="state-card error-state" role="alert">
          <h2>Schedule unavailable</h2>
          <p>The schedule could not be loaded. Your existing plan has not changed.</p>
          <button type="button" className="secondary-button" onClick={retry}>Try again</button>
        </div>
      )}
      {status === 'ready' && sessions.length === 0 && (
        <div className="state-card"><h2>No sessions scheduled</h2><p>Check back when a new timetable is published.</p></div>
      )}
      {status === 'ready' && sessions.length > 0 && filtered.length === 0 && (
        <div className="state-card">
          <h2>No sessions match</h2>
          <p>Nothing matches “{query.trim() || type}”. Try a different search or choose All activities.</p>
          <button type="button" className="secondary-button" onClick={() => { setQuery(''); setType('All') }}>Clear search and filter</button>
        </div>
      )}

      {status === 'ready' && filtered.length > 0 && (
        <section className="session-grid" aria-label="Available fitness sessions">
          {filtered.map((session) => {
            const planned = selection.find((item) => item.id === session.id)
            const limit = attendeeLimit(session)
            const atLimit = planned && planned.attendees >= limit
            return (
              <article className="session-card" key={session.id}>
                <Link className="card-image" to={`/sessions/${session.id}`} aria-label={`View ${session.title}`}>
                  <SessionImage src={session.image} alt={`${session.title} in progress`} label={session.type} />
                  {session.spots === 0 && <span className="status-pill sold-out">Fully booked</span>}
                  {planned && <span className="status-pill in-plan">In plan · {planned.attendees}</span>}
                </Link>
                <div className="card-body">
                  <div className="card-meta"><span>{session.type}</span><span>{session.level}</span></div>
                  <h2><Link to={`/sessions/${session.id}`}>{session.title}</Link></h2>
                  <p>{session.time} · {session.duration} min · {session.location}</p>
                  <p className={session.spots === 0 ? 'spots spots-none' : session.spots <= 3 ? 'spots spots-low' : 'spots'}>
                    {session.spots === 0 ? 'No spots left' : `${session.spots} ${session.spots === 1 ? 'spot' : 'spots'} left`}
                  </p>
                  <div className="card-footer">
                    <strong>Rs {session.price.toLocaleString()}</strong>
                    {session.spots === 0 && <button type="button" className="secondary-button" disabled>Unavailable</button>}
                    {session.spots > 0 && atLimit && <button type="button" className="secondary-button" disabled>Limit reached ({planned.attendees})</button>}
                    {session.spots > 0 && !atLimit && (
                      <button type="button" className="add-button" onClick={() => onAdd(session)}>
                        {planned ? `Add another (${planned.attendees})` : 'Add to plan'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}

      <details className="demo-controls">
        <summary>Demo controls for edge cases</summary>
        <label><input type="checkbox" defaultChecked={readDemo(DEMO_LOAD_ERROR_KEY)} onChange={(event) => toggleDemo(DEMO_LOAD_ERROR_KEY, event.target.checked)} /> Simulate loading failure</label>
        <label><input type="checkbox" defaultChecked={readDemo(DEMO_FULL_SESSION_KEY)} onChange={(event) => toggleDemo(DEMO_FULL_SESSION_KEY, event.target.checked)} /> Make Boxing Conditioning unavailable</label>
        <p>Settings last for this browser tab. Apply them by reloading the schedule.</p>
        <button type="button" className="secondary-button" onClick={retry}>Reload schedule</button>
      </details>
    </div>
  )
}
