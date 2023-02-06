export const FormatTimeSettings: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

export const FormatDateSettings: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export const stringToDatePreserveTimezone = (isoString: string) => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() + offset);
};

export const formatTime = (isoString: string) =>
  new Date(isoString).toLocaleTimeString(
    [...navigator.languages],
    FormatTimeSettings
  );

export const formatDate = (isoString: string) =>
  stringToDatePreserveTimezone(isoString).toLocaleDateString([
    ...navigator.languages,
  ]);

export const formatDateTime = (isoString: string) =>
  new Date(isoString).toLocaleTimeString([...navigator.languages], {
    ...FormatDateSettings,
    ...FormatTimeSettings,
  });

export const formatTimeRange = (start: string, end: string) =>
  `${formatTime(start)} - ${formatTime(end)}`;

export const formatDateTimeRange = (start: string, end: string) => {
  const startDate = stringToDatePreserveTimezone(start);
  const endDate = stringToDatePreserveTimezone(end);

  if (startDate.toLocaleDateString() === endDate.toLocaleDateString()) {
    return `${formatDate(start)} ${formatTimeRange(start, end)}`;
  }

  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
};

export const formatDateRange = (start: string, end: string) => {
  if (start === end) {
    return `${formatDate(start)}`;
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
};

export const DateTimeFormatter = new Intl.DateTimeFormat(navigator.language, {
  weekday: 'long',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

export const formatToParts = (date: Date) =>
  DateTimeFormatter.formatToParts(date);

export const formatToWeekDay = (date: Date) =>
  formatToParts(date).find((p) => p.type === 'weekday')?.value;
