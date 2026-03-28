export function formatClockTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00.000';
  }

  const totalMilliseconds = Math.round(seconds * 1000);
  const minutes = Math.floor(totalMilliseconds / 60000);
  const secs = Math.floor((totalMilliseconds % 60000) / 1000);
  const ms = totalMilliseconds % 1000;

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

export function formatTTMLTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00:00.000';
  }

  const totalMilliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(totalMilliseconds / 3600000);
  const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
  const secs = Math.floor((totalMilliseconds % 60000) / 1000);
  const ms = totalMilliseconds % 1000;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

export function parseEditableTime(value: string): number | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (/^\d+(\.\d+)?$/.test(normalized)) {
    const seconds = Number(normalized);
    return Number.isFinite(seconds) ? seconds : null;
  }

  const parts = normalized.split(':');

  if (parts.length === 2) {
    const [minutesPart, secondsPart] = parts;
    const minutes = Number(minutesPart);
    const seconds = Number(secondsPart);

    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return minutes * 60 + seconds;
    }
  }

  if (parts.length === 3) {
    const [hoursPart, minutesPart, secondsPart] = parts;
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);
    const seconds = Number(secondsPart);

    if (
      Number.isFinite(hours) &&
      Number.isFinite(minutes) &&
      Number.isFinite(seconds)
    ) {
      return hours * 3600 + minutes * 60 + seconds;
    }
  }

  return null;
}
