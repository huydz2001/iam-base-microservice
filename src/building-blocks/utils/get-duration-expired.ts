import moment from 'moment';

export function getDurationExpired(exp: Date): number {
  const expiryDate = moment(exp);

  const now = moment();

  const duration = expiryDate.diff(now, 'seconds');

  return duration;
}
