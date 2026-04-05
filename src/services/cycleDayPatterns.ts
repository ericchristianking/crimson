import { CycleEvent, EventType, PeriodLog, CycleDayPattern } from '@/src/types';
import { parseDate, diffInDays } from '@/src/utils/date';
import { EVENT_LABELS, EVENT_EMOJIS } from '@/src/constants/events';

export type NearbyPrediction = {
  pattern: CycleDayPattern;
  offset: number;
};

type Phase = 'period' | 'pms' | 'fertile' | 'ovulation' | 'regular';

function getSortedPartnerLogs(logs: PeriodLog[], partnerId: string): PeriodLog[] {
  return logs
    .filter((l) => l.partnerId === partnerId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function assignCycleDayAndIndex(
  date: string,
  cycleStarts: string[],
): { cycleDay: number; cycleIndex: number } | null {
  if (cycleStarts.length === 0) return null;

  let cycleIndex = -1;
  for (let i = cycleStarts.length - 1; i >= 0; i--) {
    if (cycleStarts[i] <= date) {
      cycleIndex = i;
      break;
    }
  }
  if (cycleIndex === -1) return null;

  const cycleStart = parseDate(cycleStarts[cycleIndex]);
  const d = parseDate(date);
  const cycleDay = diffInDays(d, cycleStart) + 1;

  if (cycleDay < 1 || cycleDay > 60) return null;
  return { cycleDay, cycleIndex };
}

function getPhaseForCycleDay(
  cycleDay: number,
  avgCycleLength: number,
  avgPeriodLength: number,
  pmsDays: number = 7,
): Phase {
  if (cycleDay <= avgPeriodLength) return 'period';
  const ovulationDay = avgCycleLength - 14;
  if (cycleDay === ovulationDay) return 'ovulation';
  if (cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1) return 'fertile';
  if (cycleDay > avgCycleLength - pmsDays) return 'pms';
  return 'regular';
}

function computeAverages(partnerLogs: PeriodLog[]): { avgCycle: number; avgPeriod: number } {
  const cycleLengths: number[] = [];
  const periodLengths: number[] = [];

  for (let i = 0; i < partnerLogs.length; i++) {
    periodLengths.push(partnerLogs[i].periodLengthDays);
    if (i > 0) {
      const prevStart = parseDate(partnerLogs[i - 1].startDate);
      const currStart = parseDate(partnerLogs[i].startDate);
      const gap = diffInDays(currStart, prevStart);
      if (gap > 0 && gap < 60) {
        cycleLengths.push(gap);
      }
    }
  }

  const avgCycle = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : 28;
  const avgPeriod = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : 5;

  return { avgCycle, avgPeriod };
}

/**
 * Scan all logged events, assign each a cycle day, cluster nearby days (+/-1),
 * and return patterns that recur across at least 2 complete cycles.
 */
export function detectRecurringPatterns(
  events: CycleEvent[],
  logs: PeriodLog[],
  partnerId: string,
): CycleDayPattern[] {
  const partnerLogs = getSortedPartnerLogs(logs, partnerId);
  const totalCycles = Math.max(0, partnerLogs.length - 1);
  if (totalCycles < 2) return [];

  const cycleStarts = partnerLogs.map((l) => l.startDate);
  const partnerEvents = events.filter((e) => e.partnerId === partnerId);
  const { avgCycle, avgPeriod } = computeAverages(partnerLogs);

  // For each eventType, build: cycleDay -> Set<cycleIndex>
  const eventDayMap: Record<string, Map<number, Set<number>>> = {};

  for (const event of partnerEvents) {
    const info = assignCycleDayAndIndex(event.date, cycleStarts);
    if (!info) continue;
    // Skip events in the current (incomplete) cycle
    if (info.cycleIndex >= partnerLogs.length - 1) continue;

    if (!eventDayMap[event.eventType]) {
      eventDayMap[event.eventType] = new Map();
    }
    const dayMap = eventDayMap[event.eventType];
    if (!dayMap.has(info.cycleDay)) {
      dayMap.set(info.cycleDay, new Set());
    }
    dayMap.get(info.cycleDay)!.add(info.cycleIndex);
  }

  const patterns: CycleDayPattern[] = [];

  for (const [eventType, dayMap] of Object.entries(eventDayMap)) {
    const usedDays = new Set<number>();

    // For each cycle day, compute expanded cycle set (union of d-1, d, d+1)
    const expandedScores: { day: number; cycles: Set<number> }[] = [];
    for (const d of dayMap.keys()) {
      const cycles = new Set<number>();
      for (const offset of [-1, 0, 1]) {
        const nearby = dayMap.get(d + offset);
        if (nearby) {
          for (const c of nearby) cycles.add(c);
        }
      }
      expandedScores.push({ day: d, cycles });
    }

    // Greedy: pick best cluster center first
    expandedScores.sort((a, b) => b.cycles.size - a.cycles.size);

    for (const { day, cycles } of expandedScores) {
      if (usedDays.has(day)) continue;
      if (cycles.size < 2) continue;

      const rangeDays: number[] = [];
      for (const offset of [-1, 0, 1]) {
        const d = day + offset;
        if (dayMap.has(d) && !usedDays.has(d)) {
          rangeDays.push(d);
        }
      }

      for (const d of rangeDays) usedDays.add(d);

      const minDay = Math.min(...rangeDays);
      const maxDay = Math.max(...rangeDays);

      patterns.push({
        eventType: eventType as EventType,
        cycleDayCenter: day,
        cycleDayRange: [minDay, maxDay],
        cyclesWithEvent: cycles.size,
        totalCycles,
        recurrenceRate: Math.round((cycles.size / totalCycles) * 100),
        phase: getPhaseForCycleDay(day, avgCycle, avgPeriod),
      });
    }
  }

  return patterns.sort((a, b) => b.recurrenceRate - a.recurrenceRate);
}

export function getCurrentCycleDay(logs: PeriodLog[], partnerId: string): number | null {
  const partnerLogs = getSortedPartnerLogs(logs, partnerId);
  if (partnerLogs.length === 0) return null;

  const lastStart = parseDate(partnerLogs[partnerLogs.length - 1].startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = diffInDays(today, lastStart) + 1;

  if (day < 1 || day > 60) return null;
  return day;
}

/**
 * Filter patterns to those within +/- window days of the current cycle day.
 * Deduplicates by eventType, keeping the closest match.
 */
export function getNearbyPredictions(
  patterns: CycleDayPattern[],
  currentCycleDay: number,
  window: number = 3,
): NearbyPrediction[] {
  const nearby: NearbyPrediction[] = [];

  for (const pattern of patterns) {
    const offset = pattern.cycleDayCenter - currentCycleDay;
    if (Math.abs(offset) <= window) {
      nearby.push({ pattern, offset });
    }
  }

  // Deduplicate by eventType — keep the closest match
  const byEventType = new Map<string, NearbyPrediction>();
  for (const pred of nearby) {
    const existing = byEventType.get(pred.pattern.eventType);
    if (!existing || Math.abs(pred.offset) < Math.abs(existing.offset)) {
      byEventType.set(pred.pattern.eventType, pred);
    }
  }

  // Sort: closest first, prefer upcoming over trailing at same distance
  return Array.from(byEventType.values()).sort((a, b) => {
    const absA = Math.abs(a.offset);
    const absB = Math.abs(b.offset);
    if (absA !== absB) return absA - absB;
    return b.offset - a.offset;
  });
}

const PREDICTION_PHRASES: Record<EventType, { today: string; upcoming: string; trailing: string }> = {
  happy:       { today: 'She may be in a good mood today',        upcoming: 'She may be in a good mood in the coming days',      trailing: 'She may be in a good mood around now' },
  moody:       { today: 'She may feel moody today',               upcoming: 'She may feel moody in the coming days',             trailing: 'She may be feeling moody around now' },
  irritable:   { today: 'She may feel irritable today',           upcoming: 'She may feel irritable in the coming days',         trailing: 'She may be feeling irritable around now' },
  sad:         { today: 'She may feel sad today',                 upcoming: 'She may feel sad in the coming days',               trailing: 'She may be feeling sad around now' },
  had_sex:     { today: 'Intimacy tends to peak around now',      upcoming: 'Intimacy tends to peak in the coming days',         trailing: 'Intimacy tends to peak around now' },
  horny:       { today: 'She tends to be more in the mood today', upcoming: 'She tends to be more in the mood in the coming days', trailing: 'She tends to be more in the mood around now' },
  low_libido:  { today: 'Libido may be lower today',              upcoming: 'Libido may dip in the coming days',                 trailing: 'Libido may be lower around now' },
  high_energy: { today: 'She may have high energy today',         upcoming: 'She may have high energy in the coming days',        trailing: 'She may have high energy around now' },
  low_energy:  { today: 'She may have low energy today',          upcoming: 'She may have low energy in the coming days',         trailing: 'She may be feeling low energy around now' },
  tired:       { today: 'She may be more tired today',            upcoming: 'She may be more tired in the coming days',           trailing: 'She may be feeling more tired around now' },
  discomfort:  { today: 'She may feel some discomfort today',      upcoming: 'She may feel some discomfort in the coming days',    trailing: 'She may be feeling some discomfort around now' },
  cravings:    { today: 'Cravings may kick in today',             upcoming: 'Cravings may kick in soon',                         trailing: 'Cravings may be kicking in around now' },
};

export function formatPrediction(prediction: NearbyPrediction): string {
  const { pattern, offset } = prediction;
  const emoji = EVENT_EMOJIS[pattern.eventType] ?? '';
  const phrases = PREDICTION_PHRASES[pattern.eventType];

  if (phrases) {
    let text: string;
    if (offset === 0) text = phrases.today;
    else if (offset > 0) text = phrases.upcoming;
    else text = phrases.trailing;
    return `${emoji} ${text}`;
  }

  const label = EVENT_LABELS[pattern.eventType] ?? pattern.eventType;
  if (offset === 0) return `${emoji} ${label} is common around this time`;
  if (offset > 0) return `${emoji} ${label} may occur in the coming days`;
  return `${emoji} ${label} may be occurring around now`;
}

export function countCompleteCycles(logs: PeriodLog[], partnerId: string): number {
  const partnerLogs = logs
    .filter((l) => l.partnerId === partnerId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return Math.max(0, partnerLogs.length - 1);
}
