export const EVENT_COLORS = [
  {
    id: 'purple',
    label: 'Purple',
    dot: 'bg-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-600',
  },
  {
    id: 'pink',
    label: 'Pink',
    dot: 'bg-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-600',
  },
  {
    id: 'blue',
    label: 'Blue',
    dot: 'bg-sky-500',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-600',
  },
  {
    id: 'green',
    label: 'Green',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
  },
  {
    id: 'orange',
    label: 'Orange',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
  },
  {
    id: 'red',
    label: 'Red',
    dot: 'bg-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-600',
  },
];

export const DEFAULT_EVENT_COLOR = EVENT_COLORS[0];

export function getEventColor(colorId) {
  return (
    EVENT_COLORS.find((color) => color.id === colorId) || DEFAULT_EVENT_COLOR
  );
}

export function getRandomEventColor() {
  const index = Math.floor(Math.random() * EVENT_COLORS.length);

  return EVENT_COLORS[index].id;
}
