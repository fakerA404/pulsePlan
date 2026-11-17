import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SessionImage from '../components/SessionImage.jsx'
import useSessions from '../hooks/useSessions.js'
import {
  attendeeLimit,
  calculateServiceFee,
  FEE_WAIVER_THRESHOLD,
  MAX_ATTENDEES,
  MIN_AGE,
  SERVICE_FEE,
  validateAge,
  validateAttendees,
  validatePhone,
} from '../rules/bookingRules.js'

export default function CheckoutPage({ selection, onUpdate, onRemove, onRemoveMany, onClear }) {
  const navigate = useNavigate()
  const { sessions, status, retry } = useSessions()
  const [form, setForm] = useState({ name: '', age: '', phone: '', area: 'F-7 / Blue Area' })
  const [errors, setErrors] = useState({})

  // Join saved IDs to current schedule data; IDs no longer in the schedule are reported separately.
  const planned = useMemo(() => selection
    .map((item) => ({ ...item, session: sessions.find((session) => session.id === item.id) }))
    .filter((item) => item.session), [selection, sessions])
  const missingIds = selection
    .filter((item) => !sessions.some((session) => session.id === item.id))
    .map((item) => item.id)

  const unavailable = planned.filter((item) => item.session.spots === 0)
  const attendeeCount = planned.reduce((sum, item) => sum + item.attendees, 0)
  const subtotal = planned.reduce((sum, item) => sum + item.session.price * item.attendees, 0)
  const serviceFee = calculateServiceFee(subtotal)
  const total = subtotal + serviceFee

  // Drop one field's error once the user edits it; other feedback stays until resubmission.
  function clearError(key) {
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([name]) => name !== key)))
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    clearError(field)
  }

  function updateQuantity(id, value) {
    onUpdate(id, value)
    clearError(id)
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Enter your name using at least 2 characters.'
    const ageResult = validateAge(form.age)
    if (!ageResult.valid) nextErrors.age = ageResult.message
    const phoneResult = validatePhone(form.phone)
    if (!phoneResult.valid) nextErrors.phone = phoneResult.message
    planned.forEach((item) => {
      if (item.session.spots === 0) return
      const result = validateAttendees(item.attendees, item.session.spots)
      if (!result.valid) nextErrors[item.id] = result.message
    })
    if (unavailable.length) nextErrors.availability = 'Remove fully booked sessions before confirming.'
    if (missingIds.length) nextErrors.missing = 'Remove sessions that are no longer in the schedule before confirming.'
    if (!planned.length) nextErrors.selection = 'Add at least one session to your plan.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      const booking = { form: { name: form.name.trim(), area: form.area }, planned, subtotal, serviceFee, total, attendeeCount }
      navigate('/confirmation', { state: booking })
      onClear() // The booking is complete, so the saved plan is emptied.
    }
  }

  if (status === 'loading') return <div className="page state-card" role="status"><span className="spinner" /> Loading your plan…</div>
  if (status === 'error') return (
    <div className="page state-card error-state" role="alert">
      <h1>Could not load the booking data</h1>
      <p>Your saved plan is still stored on this device.</p>
      <button type="button" className="primary-button" onClick={retry}>Try again</button>
    </div>
  )

  const errorCount = Object.keys(errors).length

  return (
    <div className="page checkout-layout">
      <section>
        <Link className="back-link" to="/">← Continue browsing</Link>
        <p className="eyebrow">Step 2 of 3</p>
        <h1>Review and register</h1>

        {missingIds.length > 0 && (
          <div className="conflict-box" role="alert">
            <strong>Saved session removed</strong>
            <p>{missingIds.length === 1 ? 'One session' : `${missingIds.length} sessions`} from your saved plan {missingIds.length === 1 ? 'is' : 'are'} no longer in the schedule.</p>
            <button type="button" className="secondary-button" onClick={() => onRemoveMany(missingIds)}>Remove from plan</button>
          </div>
        )}
        {unavailable.length > 0 && (
          <div className="conflict-box" role="alert">
            <strong>Availability changed</strong>
            <p>{unavailable.map((item) => item.session.title).join(', ')} {unavailable.length === 1 ? 'is' : 'are'} now fully booked. Remove {unavailable.length === 1 ? 'it' : 'them'} or <Link to="/">choose another session</Link>.</p>
          </div>
        )}

        {planned.length === 0 ? (
          <div className="empty-plan">
            <h2>Your plan is empty</h2>
            <p>Add a session before completing registration.</p>
            <Link className="primary-button" to="/">Browse sessions</Link>
          </div>
        ) : (
          <div className="plan-list">
            {planned.map((item) => {
              const limit = Math.max(1, attendeeLimit(item.session))
              const full = item.session.spots === 0
              const liveCheck = full ? { valid: true } : validateAttendees(item.attendees, item.session.spots)
              const message = errors[item.id] || (!liveCheck.valid ? liveCheck.message : '')
              return (
                <article className={`plan-item${full ? ' plan-item-unavailable' : ''}`} key={item.id}>
                  <SessionImage src={item.session.image} alt="" label={item.session.type} />
                  <div className="plan-info">
                    <h2><Link to={`/sessions/${item.id}`}>{item.session.title}</Link></h2>
                    <p>{item.session.time} · {item.session.location} · Rs {item.session.price.toLocaleString()} each</p>
                    {full && <p className="text-error">Fully booked — remove this session to continue.</p>}
                    {!full && (
                      <div className="quantity-control">
                        <label htmlFor={`qty-${item.id}`}>Attendees</label>
                        <input
                          id={`qty-${item.id}`}
                          type="number"
                          min="1"
                          max={limit}
                          value={item.attendees}
                          onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                          aria-invalid={Boolean(message)}
                          aria-describedby={`qty-${item.id}-hint`}
                        />
                        <span id={`qty-${item.id}-hint`} className="field-hint">
                          1–{MAX_ATTENDEES} per booking · {item.session.spots} {item.session.spots === 1 ? 'spot' : 'spots'} left
                        </span>
                      </div>
                    )}
                    {message && <p className="text-error" role="alert">{message}</p>}
                  </div>
                  <div className="plan-price">
                    <strong>Rs {(item.session.price * item.attendees).toLocaleString()}</strong>
                    <button type="button" className="text-button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.session.title}`}>Remove</button>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <form className="registration-form" onSubmit={submit} noValidate>
          <h2>Lead participant</h2>
          <p className="form-help">Simulated booking: use fictional details. No payment information is collected.</p>
          {errorCount > 0 && (
            <p className="form-summary" role="alert">Please fix {errorCount === 1 ? 'the highlighted item' : `${errorCount} highlighted items`}. Your other entries have been kept.</p>
          )}
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" autoComplete="off" value={form.name} onChange={(event) => updateField('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
              {errors.name && <p id="name-error" className="text-error">{errors.name}</p>}
            </div>
            <div className="field">
              <label htmlFor="age">Age</label>
              <input id="age" type="number" inputMode="numeric" min={MIN_AGE} max="100" value={form.age} onChange={(event) => updateField('age', event.target.value)} aria-invalid={Boolean(errors.age)} aria-describedby={errors.age ? 'age-hint age-error' : 'age-hint'} />
              <span id="age-hint" className="field-hint">Lead participant must be {MIN_AGE} or older.</span>
              {errors.age && <p id="age-error" className="text-error">{errors.age}</p>}
            </div>
            <div className="field">
              <label htmlFor="phone">Mobile number</label>
              <input id="phone" type="tel" inputMode="tel" autoComplete="off" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="03XXXXXXXXX" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-hint phone-error' : 'phone-hint'} />
              <span id="phone-hint" className="field-hint">11 digits, starting with 03.</span>
              {errors.phone && <p id="phone-error" className="text-error">{errors.phone}</p>}
            </div>
            <div className="field">
              <label htmlFor="area">Nearest studio area</label>
              <select id="area" value={form.area} onChange={(event) => updateField('area', event.target.value)}>
                <option>F-7 / Blue Area</option>
                <option>G-8 / I-8</option>
              </select>
            </div>
          </div>

          {errors.missing && <p className="text-error">{errors.missing}</p>}
          {errors.availability && <p className="text-error">{errors.availability}</p>}
          {errors.selection && <p className="text-error">{errors.selection}</p>}
          <button className="primary-button submit-button" type="submit">Confirm simulated booking</button>
        </form>
      </section>

      <aside className="summary-card" aria-label="Booking summary">
        <h2>Plan summary</h2>
        <dl>
          <div><dt>Sessions</dt><dd>{planned.length}</dd></div>
          <div><dt>Attendees</dt><dd>{attendeeCount}</dd></div>
          <div><dt>Session total</dt><dd>Rs {subtotal.toLocaleString()}</dd></div>
          <div><dt>Service fee</dt><dd>{subtotal === 0 ? '—' : serviceFee === 0 ? 'Waived' : `Rs ${serviceFee}`}</dd></div>
        </dl>
        <div className="summary-total"><span>Total</span><strong>Rs {total.toLocaleString()}</strong></div>
        {serviceFee > 0 && (
          <p className="fee-note">
            A Rs {SERVICE_FEE} booking fee applies below Rs {FEE_WAIVER_THRESHOLD.toLocaleString()}. Add Rs {(FEE_WAIVER_THRESHOLD - subtotal).toLocaleString()} more to waive it. Charged once per booking, not per session.
          </p>
        )}
        {subtotal > 0 && serviceFee === 0 && <p className="fee-note">Service fee waived: your plan is Rs {FEE_WAIVER_THRESHOLD.toLocaleString()} or more.</p>}
        {selection.length > 0 && <button type="button" className="text-button" onClick={onClear}>Clear saved plan</button>}
      </aside>
    </div>
  )
}
