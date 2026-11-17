// Demo switches (set from the "Demo controls" panel on the browse page).
export const DEMO_LOAD_ERROR_KEY = 'pulseplan-simulate-load-error'
export const DEMO_FULL_SESSION_KEY = 'pulseplan-simulate-full-session'
export const DEMO_FULL_SESSION_ID = 'boxing-conditioning'

export async function loadSessions() {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (sessionStorage.getItem(DEMO_LOAD_ERROR_KEY) === 'true') {
    throw new Error('The session schedule could not be loaded.')
  }

  const changedAvailability = sessionStorage.getItem(DEMO_FULL_SESSION_KEY) === 'true'
  const { sessions } = await import('../data/sessions.js')

  if (!changedAvailability) return sessions
  return sessions.map((session) =>
    session.id === DEMO_FULL_SESSION_ID ? { ...session, spots: 0 } : session
  )
}
