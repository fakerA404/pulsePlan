// Operating rules for PulsePlan. Pure functions so the UI and tests share them.

export const MAX_ATTENDEES = 6
export const MIN_AGE = 16
export const SERVICE_FEE = 250
export const FEE_WAIVER_THRESHOLD = 5000

// Rule 1 (capacity): 1-6 attendees per booking, never more than the spots left.
export function validateAttendees(attendees, spotsLeft = MAX_ATTENDEES) {
  const count = Number(attendees)
  if (!Number.isInteger(count) || count < 1) {
    return { valid: false, message: 'Choose at least 1 attendee.' }
  }
  if (count > MAX_ATTENDEES) {
    return { valid: false, message: `A booking can include at most ${MAX_ATTENDEES} attendees.` }
  }
  if (count > spotsLeft) {
    return { valid: false, message: `Only ${spotsLeft} ${spotsLeft === 1 ? 'spot remains' : 'spots remain'} in this session.` }
  }
  return { valid: true, message: '' }
}

// Highest attendee count a session can accept in one booking.
export function attendeeLimit(session) {
  return Math.min(MAX_ATTENDEES, session.spots)
}

// Rule 2 (eligibility): the lead participant must be 16 or older.
export function validateAge(age) {
  const parsed = Number(age)
  if (String(age).trim() === '' || !Number.isInteger(parsed)) {
    return { valid: false, message: 'Enter the lead participant’s age in whole years.' }
  }
  if (parsed < MIN_AGE) return { valid: false, message: `The lead participant must be ${MIN_AGE} or older.` }
  if (parsed > 100) return { valid: false, message: 'Enter a realistic age (100 or below).' }
  return { valid: true, message: '' }
}

// Form rule: a Pakistani mobile number, 11 digits starting with 03.
export function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '')
  if (!/^03\d{9}$/.test(digits)) {
    return { valid: false, message: 'Enter an 11-digit Pakistani mobile number starting with 03.' }
  }
  return { valid: true, message: '' }
}

// Rule 3 (pricing): Rs 250 fee below Rs 5,000; waived at or above it.
export function calculateServiceFee(subtotal) {
  if (subtotal <= 0) return 0
  return subtotal >= FEE_WAIVER_THRESHOLD ? 0 : SERVICE_FEE
}
