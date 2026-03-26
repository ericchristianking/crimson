export type Partner = {
  id: string;
  name: string;
  color: string;
  pmsDays?: number;
  icon?: string;
};

export type PeriodLog = {
  id: string;
  partnerId: string;
  startDate: string;
  periodLengthDays: number;
};

export type PredictedDayState = {
  isPeriod?: boolean;
  isPMS?: boolean;
  isFertileWindow?: boolean;
  isOvulationDay?: boolean;
};

export type EventCategory = 'mood' | 'intimacy' | 'energy' | 'symptom';

export type EventType =
  | 'happy' | 'moody' | 'irritable' | 'sad'
  | 'had_sex' | 'horny' | 'low_libido'
  | 'high_energy' | 'low_energy' | 'tired'
  | 'discomfort' | 'cravings';

export type CycleEvent = {
  id: string;
  partnerId: string;
  date: string;
  eventType: EventType;
  category: EventCategory;
  createdAt: number;
};

export type PhasePattern = {
  phase: 'period' | 'pms' | 'fertile' | 'ovulation' | 'regular';
  eventType: EventType;
  occurrences: number;
  totalDaysInPhase: number;
  percentage: number;
};
