import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import BrowsePage from './pages/BrowsePage.jsx'
import DetailsPage from './pages/DetailsPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { attendeeLimit } from './rules/bookingRules.js'
import './App.css'

const STORAGE_KEY = 'pulseplan-selection'

// Restore the saved plan, keeping only well-formed { id, attendees } entries.
function readSelection() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(value)) return []
    return value.filter((item) => item && typeof item.id === 'string' && Number.isFinite(item.attendees))
  } catch {
    return []
  }
}

export default function App() {
  const [selection, setSelection] = useState(readSelection)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
  }, [selection])

  function addSession(session) {
    const limit = attendeeLimit(session)
    if (limit < 1) return
    setSelection((current) => {
      const existing = current.find((item) => item.id === session.id)
      if (existing) {
        return current.map((item) => item.id === session.id
          ? { ...item, attendees: Math.min(limit, item.attendees + 1) }
          : item)
      }
      return [...current, { id: session.id, attendees: 1 }]
    })
  }

  function updateAttendees(id, attendees) {
    setSelection((current) => current.map((item) =>
      item.id === id ? { ...item, attendees } : item
    ))
  }

  function removeSession(id) {
    setSelection((current) => current.filter((item) => item.id !== id))
  }

  function removeSessions(ids) {
    setSelection((current) => current.filter((item) => !ids.includes(item.id)))
  }

  const selectionCount = selection.reduce((sum, item) => sum + item.attendees, 0)

  return (
    <BrowserRouter>
      <Header selectionCount={selectionCount} />
      <main>
        <Routes>
          <Route path="/" element={<BrowsePage selection={selection} onAdd={addSession} />} />
          <Route path="/sessions/:id" element={<DetailsPage selection={selection} onAdd={addSession} />} />
          <Route path="/checkout" element={
            <CheckoutPage
              selection={selection}
              onUpdate={updateAttendees}
              onRemove={removeSession}
              onRemoveMany={removeSessions}
              onClear={() => setSelection([])}
            />
          } />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
