export const IST_TIME_ZONE = "Asia/Kolkata";

export const toISTDateString = (date: Date | string | number) => {
  const value = new Date(date);
  return value.toLocaleDateString("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const toISTTimeString = (date: Date | string | number) => {
  const value = new Date(date);
  return value.toLocaleTimeString("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const toISTDateTimeString = (date: Date | string | number) => {
  const value = new Date(date);
  return value.toLocaleString("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getISTDateKey = (date: Date | string | number = new Date()) => {
  const value = new Date(date);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
  return parts;
};
