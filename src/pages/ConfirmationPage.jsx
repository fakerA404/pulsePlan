import { Link, useLocation } from 'react-router-dom'

export default function ConfirmationPage() {
  const location = useLocation()
  const booking = location.state

  if (!booking) {
    return (
      <div className="page state-card">
        <p className="eyebrow">No completed booking</p>
        <h1>Start with a session</h1>
        <p>Confirmations appear here after you complete a booking.</p>
        <Link className="primary-button" to="/">Browse sessions</Link>
      </div>
    )
  }

  return (
    <div className="page confirmation">
      <div className="success-icon" aria-hidden="true">✓</div>
      <p className="eyebrow">Step 3 of 3 · Booking confirmed (simulated)</p>
      <h1>You’re in, {booking.form.name}.</h1>
      <p>No payment was taken. Your selected sessions are summarized below. Nearest studio area: {booking.form.area}.</p>
      <div className="confirmation-card">
        {booking.planned.map((item) => (
          <div key={item.id}>
            <span>{item.session.title} × {item.attendees}</span>
            <strong>{item.session.time} · {item.session.location}</strong>
          </div>
        ))}
        <div><span>Service fee</span><strong>{booking.serviceFee === 0 ? 'Waived' : `Rs ${booking.serviceFee}`}</strong></div>
        <div className="confirmation-total"><span>Simulated total ({booking.attendeeCount} {booking.attendeeCount === 1 ? 'attendee' : 'attendees'})</span><strong>Rs {booking.total.toLocaleString()}</strong></div>
      </div>
      <Link className="primary-button" to="/">Browse more sessions</Link>
    </div>
  )
}
