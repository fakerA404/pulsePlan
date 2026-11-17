import { Link, NavLink } from 'react-router-dom'

export default function Header({ selectionCount }) {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="PulsePlan home">
        <span className="brand-mark" aria-hidden="true">P</span>
        <span>PulsePlan</span>
      </Link>
      <nav aria-label="Main navigation">
        <NavLink to="/" end>Sessions</NavLink>
        <NavLink to="/checkout">
          My plan <span className="count-badge" aria-label={`${selectionCount} attendees planned`}>{selectionCount}</span>
        </NavLink>
      </nav>
    </header>
  )
}
