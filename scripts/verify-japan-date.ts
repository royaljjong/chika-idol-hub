import assert from 'node:assert/strict';
import { getJapanCalendarDate, JAPAN_TIME_ZONE } from '../src/lib/japan-date';

assert.equal(JAPAN_TIME_ZONE, 'Asia/Tokyo');
assert.equal(getJapanCalendarDate(new Date('2026-08-28T14:59:59.000Z')), '2026-08-28');
assert.equal(getJapanCalendarDate(new Date('2026-08-28T15:00:00.000Z')), '2026-08-29');
assert.equal(getJapanCalendarDate(new Date('2026-12-31T15:00:00.000Z')), '2027-01-01');
assert.throws(() => getJapanCalendarDate(new Date('invalid')), RangeError);
console.log('OK: Japan calendar date contract');
