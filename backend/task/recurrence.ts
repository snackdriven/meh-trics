export type Cycle = 'daily' | 'weekly' | 'monthly';

export function getCycleStart(date: Date, cycle: Cycle): Date {
  const d = new Date(date);
  switch (cycle) {
    case 'daily':
      d.setHours(0, 0, 0, 0);
      break;
    case 'weekly': {
      const day = d.getDay();
      const diff = (day + 6) % 7; // Monday as start
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      break;
    }
    case 'monthly':
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      break;
  }
  return d;
}

export function getNextCycleStart(date: Date, cycle: Cycle): Date {
  const start = getCycleStart(date, cycle);
  switch (cycle) {
    case 'daily':
      start.setDate(start.getDate() + 1);
      break;
    case 'weekly':
      start.setDate(start.getDate() + 7);
      break;
    case 'monthly':
      start.setMonth(start.getMonth() + 1);
      break;
  }
  return start;
}

export function getCycleEnd(date: Date, cycle: Cycle): Date {
  const end = getNextCycleStart(date, cycle);
  return end;
}
