import dayjs from 'dayjs';

export const formatDatetime = (date: string | number | Date) => {
  return dayjs(date).format('MMM D, YYYY HH:mm');
};

export const formatRelativeDatetime = (rawDate: string | number | Date) => {
  const date = dayjs(rawDate);
  const now = dayjs();
  const diffInSeconds = Math.abs(now.diff(date, 'second'));

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec${diffInSeconds === 1 ? '' : 's'} ago`;
  }

  const diffInMinutes = Math.abs(now.diff(date, 'minute'));
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.abs(now.diff(date, 'hour'));
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.abs(now.diff(date, 'day'));
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  return date.format('MMM D, YYYY');
};
