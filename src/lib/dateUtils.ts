import { formatInTimeZone } from 'date-fns-tz';

export const getISTDate = (date: Date = new Date()) => {
  return formatInTimeZone(date, 'Asia/Kolkata', 'yyyy-MM-dd');
};

export const getISTTimestamp = (date: Date = new Date()) => {
  return formatInTimeZone(date, 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm:ssXXX");
};
