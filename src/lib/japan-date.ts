export const JAPAN_TIME_ZONE = 'Asia/Tokyo';

export function getJapanCalendarDate(date: Date = new Date()): string {
  if (Number.isNaN(date.getTime())) throw new RangeError('A valid Date is required');

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: JAPAN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: 'year' | 'month' | 'day') => parts.find((part) => part.type === type)?.value;
  const year = value('year');
  const month = value('month');
  const day = value('day');
  if (!year || !month || !day) throw new RangeError('Unable to resolve the Japan calendar date');
  return `${year}-${month}-${day}`;
}
