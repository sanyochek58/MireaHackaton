export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

export function formatHoursRu(hours: number): string {
  const h = Math.round(hours);
  const mod10 = h % 10;
  const mod100 = h % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${h} часов`;
  if (mod10 === 1) return `${h} час`;
  if (mod10 >= 2 && mod10 <= 4) return `${h} часа`;
  return `${h} часов`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
