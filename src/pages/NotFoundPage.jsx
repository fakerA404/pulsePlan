import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page state-card">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The route is not part of the PulsePlan journey.</p>
      <Link className="primary-button" to="/">Return to sessions</Link>
    </div>
  )
}
