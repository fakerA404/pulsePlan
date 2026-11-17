import { useEffect, useState } from 'react'
import { loadSessions } from '../utils/mockLoader.js'

// Loads the schedule through the async mock loader and exposes loading/error/retry.
export default function useSessions() {
  const [sessions, setSessions] = useState([])
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Ignore a result that arrives after the page has unmounted or a retry started.
    let active = true
    loadSessions()
      .then((data) => {
        if (!active) return
        setSessions(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!active) return
        setSessions([])
        setStatus('error')
      })
    return () => { active = false }
  }, [attempt])

  function retry() {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }

  return { sessions, status, retry }
}
