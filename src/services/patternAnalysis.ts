import { CycleEvent, EventType, PhasePattern, PredictedDayState, PeriodLog } from '@/src/types';
import { parseDate, addDays } from '@/src/utils/date';
import { EVENT_LABELS, EVENT_EMOJIS } from '@/src/constants/events';

type Phase = 'period' | 'pms' | 'fertile' | 'ovulation' | 'regular';

const PHASE_LABELS: Record<Phase, string> = {
  period: 'period',
  pms: 'PMS',
  fertile: 'fertile window',
  ovulation: 'ovulation',
  regular: 'regular days',
};

function buildLoggedPeriodDates(logs: PeriodLog[], partnerId: string): Set<string> {
  const dates = new Set<string>();
  for (const log of logs) {
    if (log.partnerId !== partnerId) continue;
    const start = parseDate(log.startDate);
    for (let i = 0; i < log.periodLengthDays; i++) {
      const d = addDays(start, i);
      dates.add(d.toISOString().slice(0, 10));
    }
  }
  return dates;
}

function getPhaseForDate(
  date: string,
  predictions: Record<string, PredictedDayState>,
  loggedPeriodDates: Set<string>,
): Phase {
  if (loggedPeriodDates.has(date)) return 'period';
  const p = predictions[date];
  if (!p) return 'regular';
  if (p.isPeriod) return 'period';
  if (p.isOvulationDay) return 'ovulation';
  if (p.isFertileWindow) return 'fertile';
  if (p.isPMS) return 'pms';
  return 'regular';
}

export function buildPatterns(
  events: CycleEvent[],
  predictions: Record<string, PredictedDayState>,
  logs: PeriodLog[],
  partnerId: string,
): PhasePattern[] {
  if (events.length === 0) return [];

  const loggedPeriodDates = buildLoggedPeriodDates(logs, partnerId);
  const partnerEvents = events.filter((e) => e.partnerId === partnerId);

  const allDatesWithEvents = new Set(partnerEvents.map((e) => e.date));
  const phaseDayCounts: Record<Phase, number> = {
    period: 0, pms: 0, fertile: 0, ovulation: 0, regular: 0,
  };
  for (const date of allDatesWithEvents) {
    const phase = getPhaseForDate(date, predictions, loggedPeriodDates);
    phaseDayCounts[phase]++;
  }

  const counts: Record<string, number> = {};
  for (const event of partnerEvents) {
    const phase = getPhaseForDate(event.date, predictions, loggedPeriodDates);
    const key = `${phase}::${event.eventType}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const patterns: PhasePattern[] = [];
  for (const [key, occurrences] of Object.entries(counts)) {
    const [phase, eventType] = key.split('::') as [Phase, EventType];
    const total = phaseDayCounts[phase];
    if (total === 0) continue;
    patterns.push({
      phase,
      eventType,
      occurrences,
      totalDaysInPhase: total,
      percentage: Math.round((occurrences / total) * 100),
    });
  }

  return patterns.sort((a, b) => b.percentage - a.percentage);
}

export function getTopInsights(
  patterns: PhasePattern[],
  maxResults: number = 3,
  minOccurrences: number = 2,
): string[] {
  return patterns
    .filter((p) => p.occurrences >= minOccurrences && p.percentage >= 40)
    .slice(0, maxResults)
    .map((p) => {
      const emoji = EVENT_EMOJIS[p.eventType] ?? '';
      const label = EVENT_LABELS[p.eventType] ?? p.eventType;
      const phase = PHASE_LABELS[p.phase];
      return `${emoji} ${label} — ${p.percentage}% of ${phase} days`;
    });
}

export function countCompleteCycles(logs: PeriodLog[], partnerId: string): number {
  const partnerLogs = logs
    .filter((l) => l.partnerId === partnerId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return Math.max(0, partnerLogs.length - 1);
}
