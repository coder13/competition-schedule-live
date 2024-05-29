export const durationToMinutes = (start: Date, end: Date): number =>
  Math.round((end.getTime() - start.getTime()) / 1000 / 60);
