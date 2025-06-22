import dayjs from 'dayjs';

export const formatDatetime = (date: string) => {
  return dayjs(date).format('MMM D, YYYY HH:mm');
};

export const formatRelativeDatetime = (rawDate: string) => {
  const date = dayjs(rawDate);
  const now = dayjs();
  const diffInSeconds = Math.abs(now.diff(date, 'second'));

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  }

  const diffInMinutes = Math.abs(now.diff(date, 'minute'));
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.abs(now.diff(date, 'hour'));
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.abs(now.diff(date, 'day'));
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return date.format('MMM D, YYYY');
};
