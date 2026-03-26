import { EventType, EventCategory } from '@/src/types';

export type EventConfig = {
  type: EventType;
  category: EventCategory;
  label: string;
  emoji: string;
};

export const EVENT_CONFIG: EventConfig[] = [
  { type: 'happy',      category: 'mood',     label: 'Happy',      emoji: '😊' },
  { type: 'moody',      category: 'mood',     label: 'Moody',      emoji: '😤' },
  { type: 'irritable',  category: 'mood',     label: 'Irritable',  emoji: '😠' },
  { type: 'sad',        category: 'mood',     label: 'Sad',        emoji: '😢' },
  { type: 'had_sex',    category: 'intimacy', label: 'Had Sex',    emoji: '🔥' },
  { type: 'horny',      category: 'intimacy', label: 'Horny',      emoji: '😏' },
  { type: 'low_libido', category: 'intimacy', label: 'Low Libido', emoji: '😶' },
  { type: 'high_energy', category: 'energy',  label: 'High Energy', emoji: '⚡' },
  { type: 'low_energy', category: 'energy',   label: 'Low Energy', emoji: '🔋' },
  { type: 'tired',      category: 'energy',   label: 'Tired',      emoji: '😴' },
  { type: 'discomfort', category: 'symptom',  label: 'Discomfort', emoji: '😣' },
  { type: 'cravings',   category: 'symptom',  label: 'Cravings',   emoji: '🍫' },
];

export const EVENT_LABELS: Record<EventType, string> = Object.fromEntries(
  EVENT_CONFIG.map((e) => [e.type, e.label]),
) as Record<EventType, string>;

export const EVENT_EMOJIS: Record<EventType, string> = Object.fromEntries(
  EVENT_CONFIG.map((e) => [e.type, e.emoji]),
) as Record<EventType, string>;
