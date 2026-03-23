import { PeriodLog } from '@/src/types';
import { parseDate, addDays, toDateOnly } from '@/src/utils/date';

export type PhaseKey = 'regular' | 'period' | 'pms' | 'fertile' | 'ovulation';

export type TodayInfo = {
  phaseKey: PhaseKey;
  phaseLabel: string;
  phaseSubtitle: string;
  nextEventLabel: string | null;
  bestMove: string;
  nextPeriodDate: string | null;
  fertileCountdown: string | null;
};

type PredictionEntry = {
  isPeriod?: boolean;
  isPMS?: boolean;
  isFertileWindow?: boolean;
  isOvulationDay?: boolean;
};

function getLogContainingDate(logs: PeriodLog[], date: string): PeriodLog | null {
  const d = parseDate(date);
  for (const log of logs) {
    const start = parseDate(log.startDate);
    const end = addDays(start, log.periodLengthDays - 1);
    if (d >= start && d <= end) return log;
  }
  return null;
}

export function buildTodayInfo(
  predictions: Record<string, PredictionEntry>,
  logs: PeriodLog[],
): TodayInfo {
  const today = toDateOnly(new Date());
  const p = predictions[today];
  const isLoggedToday = getLogContainingDate(logs, today) !== null;

  let phaseKey: PhaseKey = 'regular';
  let phaseLabel = 'Regular';
  let phaseSubtitle = 'No significant phase right now.';
  let bestMove = 'Business as usual.';

  if (isLoggedToday || p?.isPeriod) {
    phaseKey = 'period';
    phaseLabel = 'Period';
    phaseSubtitle = 'Menstruation is active.';
    bestMove = 'A little extra care goes a long way.';
  } else if (p?.isOvulationDay) {
    phaseKey = 'ovulation';
    phaseLabel = 'Ovulation';
    phaseSubtitle = 'Peak fertility day.';
    bestMove = 'Great day for a date.';
  } else if (p?.isFertileWindow) {
    phaseKey = 'fertile';
    phaseLabel = 'Fertile window';
    phaseSubtitle = 'Higher chance of pregnancy.';
    bestMove = 'Plan accordingly.';
  } else if (p?.isPMS) {
    phaseKey = 'pms';
    phaseLabel = 'PMS window';
    phaseSubtitle = 'She may be more sensitive.';
    bestMove = 'Be a little extra patient.';
  }

  const nextEventLabel = findNextEvent(predictions, today);
  const nextPeriodDate = findNextPeriodDate(predictions, today);
  const fertileCountdown = findFertileCountdown(predictions, today, p);

  return { phaseKey, phaseLabel, phaseSubtitle, nextEventLabel, bestMove, nextPeriodDate, fertileCountdown };
}

function findNextEvent(
  predictions: Record<string, PredictionEntry>,
  todayStr: string,
): string | null {
  const today = parseDate(todayStr);
  const todayP = predictions[todayStr];

  const searchDays = 60;

  for (let i = 1; i <= searchDays; i++) {
    const d = addDays(today, i);
    const str = toDateOnly(d);
    const pred = predictions[str];
    if (!pred) continue;

    if (pred.isPeriod && !todayP?.isPeriod) {
      return formatCountdown('Period', i);
    }
    if (pred.isFertileWindow && !todayP?.isFertileWindow && !todayP?.isOvulationDay) {
      return formatCountdown('Fertile window', i);
    }
    if (pred.isOvulationDay && !todayP?.isOvulationDay) {
      return formatCountdown('Ovulation', i);
    }
    if (pred.isPMS && !todayP?.isPMS && !todayP?.isPeriod) {
      return formatCountdown('PMS', i);
    }
  }

  return null;
}

function findNextPeriodDate(
  predictions: Record<string, PredictionEntry>,
  todayStr: string,
): string | null {
  const today = parseDate(todayStr);
  const todayP = predictions[todayStr];
  const inPeriod = todayP?.isPeriod;

  for (let i = inPeriod ? 1 : 0; i <= 90; i++) {
    const d = addDays(today, i);
    const str = toDateOnly(d);
    const pred = predictions[str];
    if (!pred) continue;

    if (pred.isPeriod && (i > 0 || !inPeriod)) {
      const prevStr = toDateOnly(addDays(d, -1));
      const prevPred = predictions[prevStr];
      if (!prevPred?.isPeriod || i === 0) {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    }
  }

  return null;
}

function findFertileCountdown(
  predictions: Record<string, PredictionEntry>,
  todayStr: string,
  todayP: PredictionEntry | undefined,
): string | null {
  const today = parseDate(todayStr);

  if (todayP?.isFertileWindow || todayP?.isOvulationDay) {
    let remaining = 0;
    for (let i = 1; i <= 14; i++) {
      const str = toDateOnly(addDays(today, i));
      const pred = predictions[str];
      if (pred?.isFertileWindow || pred?.isOvulationDay) {
        remaining++;
      } else {
        break;
      }
    }
    return remaining > 0 ? `${remaining} more day${remaining === 1 ? '' : 's'}` : 'Last day';
  }

  for (let i = 1; i <= 60; i++) {
    const d = addDays(today, i);
    const str = toDateOnly(d);
    const pred = predictions[str];
    if (pred?.isFertileWindow) {
      return i === 1 ? 'Starts tomorrow' : `Starts in ${i} days`;
    }
  }

  return null;
}

function formatCountdown(event: string, days: number): string {
  if (days === 1) return `Next: ${event} tomorrow`;
  return `Next: ${event} in ${days} days`;
}
