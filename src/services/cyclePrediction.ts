import { PeriodLog, PredictedDayState } from '@/src/types';
import { parseDate, addDays, addMonths, toDateOnly, diffInDays } from '@/src/utils/date';

const DEFAULT_CYCLE_DAYS = 28;
const DEFAULT_PERIOD_DAYS = 5;

const DEFAULT_PMS_DAYS = 7;

export function buildPredictedCalendar(
  logs: PeriodLog[],
  partnerId: string,
  showPms: boolean,
  showFertility: boolean,
  showOvulation: boolean,
  pmsDays: number = DEFAULT_PMS_DAYS,
): Record<string, PredictedDayState> {
  const partnerLogs = logs
    .filter((l) => l.partnerId === partnerId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const result: Record<string, PredictedDayState> = {};

  if (partnerLogs.length === 0) return result;

  const cycleLengths: number[] = [];
  const periodLengths: number[] = [];

  for (let i = 0; i < partnerLogs.length; i++) {
    periodLengths.push(partnerLogs[i].periodLengthDays);
    if (i > 0) {
      const prevEnd = addDays(parseDate(partnerLogs[i - 1].startDate), partnerLogs[i - 1].periodLengthDays - 1);
      const currStart = parseDate(partnerLogs[i].startDate);
      const gap = diffInDays(currStart, prevEnd);
      if (gap > 0 && gap < 45) {
        cycleLengths.push(gap + partnerLogs[i - 1].periodLengthDays);
      }
    }
  }

  const avgCycle = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : DEFAULT_CYCLE_DAYS;
  const avgPeriod = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : DEFAULT_PERIOD_DAYS;

  const lastLog = partnerLogs[partnerLogs.length - 1];
  const lastStart = parseDate(lastLog.startDate);

  const now = new Date();
  const endMonth = addMonths(now, 12);

  // Ovulation typically occurs ~14 days before the NEXT period starts (luteal phase).
  // For the current cycle (between last logged period and first predicted), compute
  // fertile/ovulation relative to the first predicted period start.
  const firstPredStart = addDays(lastStart, avgCycle);

  // Mark fertile window & ovulation for the CURRENT cycle (before first predicted period)
  addFertileOvulationForCycle(result, firstPredStart, showFertility, showOvulation);

  if (showPms) {
    addPmsForCycle(result, firstPredStart, pmsDays);
  }

  let predStart = new Date(firstPredStart);

  while (predStart <= addMonths(endMonth, 1)) {
    const predEnd = addDays(predStart, avgPeriod - 1);
    for (let d = new Date(predStart); d <= predEnd; d.setDate(d.getDate() + 1)) {
      const str = toDateOnly(d);
      if (!result[str]) result[str] = {};
      result[str].isPeriod = true;
    }

    const nextPredStart = addDays(predStart, avgCycle);

    // Fertile/ovulation for this upcoming cycle
    addFertileOvulationForCycle(result, nextPredStart, showFertility, showOvulation);

    if (showPms) {
      addPmsForCycle(result, nextPredStart, pmsDays);
    }

    predStart = nextPredStart;
  }

  return result;
}

function addFertileOvulationForCycle(
  result: Record<string, PredictedDayState>,
  nextPeriodStart: Date,
  showFertility: boolean,
  showOvulation: boolean,
) {
  if (!showFertility && !showOvulation) return;

  // Ovulation ~14 days before next period start
  const ovuDay = addDays(nextPeriodStart, -14);
  const fertileStart = addDays(ovuDay, -5);
  const fertileEnd = addDays(ovuDay, 1);

  for (let d = new Date(fertileStart); d <= fertileEnd; d.setDate(d.getDate() + 1)) {
    const str = toDateOnly(d);
    if (!result[str]) result[str] = {};
    const isOvu = d.getTime() === ovuDay.getTime();
    if (isOvu && showOvulation) {
      result[str].isOvulationDay = true;
    }
    if (!isOvu && showFertility) {
      result[str].isFertileWindow = true;
    }
    // On ovulation day, also mark fertile if fertile toggle is on
    if (isOvu && showFertility && !showOvulation) {
      result[str].isFertileWindow = true;
    }
  }
}

function addPmsForCycle(
  result: Record<string, PredictedDayState>,
  periodStart: Date,
  pmsDays: number,
) {
  const pmsStart = addDays(periodStart, -pmsDays);
  const pmsEnd = addDays(periodStart, -1);
  for (let d = new Date(pmsStart); d <= pmsEnd; d.setDate(d.getDate() + 1)) {
    const str = toDateOnly(d);
    if (!result[str]) result[str] = {};
    result[str].isPMS = true;
  }
}
