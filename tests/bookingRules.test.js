import test from 'node:test'
import assert from 'node:assert/strict'
import { validateAttendees } from '../src/rules/bookingRules.js'

// Rule 1 (capacity): a booking accepts 1 to 6 attendees and never more than the spots left.

test('accepts an ordinary valid attendee count', () => {
  assert.deepEqual(validateAttendees(3), { valid: true, message: '' })
})

test('accepts exactly six attendees at the upper limit', () => {
  assert.deepEqual(validateAttendees(6), { valid: true, message: '' })
})

test('rejects an attendee count above the limit', () => {
  assert.deepEqual(validateAttendees(7), {
    valid: false,
    message: 'A booking can include at most 6 attendees.',
  })
})

test('rejects zero attendees at the lower boundary', () => {
  assert.equal(validateAttendees(0).valid, false)
})

test('rejects more attendees than the session has spots left', () => {
  assert.deepEqual(validateAttendees(4, 3), {
    valid: false,
    message: 'Only 3 spots remain in this session.',
  })
  assert.equal(validateAttendees(3, 3).valid, true)
})
