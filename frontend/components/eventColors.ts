export const eventColorMap = {
  blue:   { solid: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  green:  { solid: 'bg-green-500',  badge: 'bg-green-100 text-green-800 border-green-200' },
  red:    { solid: 'bg-red-500',    badge: 'bg-red-100 text-red-800 border-red-200' },
  purple: { solid: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  yellow: { solid: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  pink:   { solid: 'bg-pink-500',   badge: 'bg-pink-100 text-pink-800 border-pink-200' },
  indigo: { solid: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  orange: { solid: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800 border-orange-200' },
} as const;

export type EventColor = keyof typeof eventColorMap;

export const eventColors = (Object.keys(eventColorMap) as EventColor[]).map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
  class: eventColorMap[c].solid,
}));

export function getEventColorClasses(color?: string) {
  return eventColorMap[(color as EventColor) || 'indigo'] ?? eventColorMap.indigo;
}
