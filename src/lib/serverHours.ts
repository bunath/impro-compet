/** Le serveur n'est disponible que de 22h à 7h (heure de Paris). */
export const SERVER_OPEN_HOUR = 22;
export const SERVER_CLOSE_HOUR = 7;
export const SERVER_TIMEZONE = 'Europe/Paris';
export const SERVER_HOURS_LABEL = `${SERVER_OPEN_HOUR}h à ${SERVER_CLOSE_HOUR}h`;

export function hourIn(date: Date, timeZone = SERVER_TIMEZONE): number {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    hour: 'numeric',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
}

export function isServerOpen(date: Date = new Date()): boolean {
  const h = hourIn(date);
  return h >= SERVER_OPEN_HOUR || h < SERVER_CLOSE_HOUR;
}
