import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { PredictedDayState, PeriodLog } from '@/src/types';
import { CrimsonColors } from '@/constants/theme';
import { addMonths, toDateOnly, parseDate, addDays } from '@/src/utils/date';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_PADDING = 20;
const DAY_SIZE = Math.floor((SCREEN_WIDTH - CALENDAR_PADDING * 2) / 7);
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PAST_MONTHS = 6;
const FUTURE_MONTHS = 12;
const MONTH_HEADER_HEIGHT = 44;
const WEEK_LABEL_HEIGHT = 24;
const ROW_HEIGHT = DAY_SIZE + 8;

// Solid circle for today
const CIRCLE_SIZE = DAY_SIZE - 8;
// SVG glow slightly larger than cell so it bleeds softly into neighbors
const GLOW_SIZE = Math.round(DAY_SIZE * 1.35);

type MonthData = { key: string; year: number; month: number };
type PhaseInfo = { color: string; solid: string } | null;

type Props = {
  predictions: Record<string, PredictedDayState>;
  logs: PeriodLog[];
  onDayPress: (date: string) => void;
};

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOffset(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
function weekRowsForMonth(y: number, m: number) {
  return Math.ceil((getDaysInMonth(y, m) + getFirstDayOffset(y, m)) / 7);
}
function isLoggedDay(date: string, logs: PeriodLog[]) {
  const d = parseDate(date);
  return logs.some((l) => {
    const s = parseDate(l.startDate);
    return d >= s && d <= addDays(s, l.periodLengthDays - 1);
  });
}
function generateMonths(): MonthData[] {
  return Array.from({ length: PAST_MONTHS + FUTURE_MONTHS + 1 }, (_, i) => {
    const d = addMonths(new Date(), i - PAST_MONTHS);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, year: d.getFullYear(), month: d.getMonth() };
  });
}
function getPhase(isPeriod: boolean, isLogged: boolean, isPMS: boolean, isOv: boolean, isFert: boolean): PhaseInfo {
  if (isLogged || isPeriod) return { color: CrimsonColors.period,    solid: CrimsonColors.periodSolid };
  if (isOv)                  return { color: CrimsonColors.ovulation, solid: CrimsonColors.ovulationSolid };
  if (isFert)                return { color: CrimsonColors.fertile,   solid: CrimsonColors.fertileSolid };
  if (isPMS)                 return { color: CrimsonColors.pms,       solid: CrimsonColors.pmsSolid };
  return null;
}

// Offset to center a GLOW_SIZE element inside a DAY_SIZE cell
const glowLeft = (DAY_SIZE - GLOW_SIZE) / 2;
const glowTop  = (ROW_HEIGHT - GLOW_SIZE) / 2;

export function CrimsonCalendar({ predictions, logs, onDayPress }: Props) {
  const months  = useMemo(generateMonths, []);
  const todayStr = useMemo(() => toDateOnly(new Date()), []);

  const monthHeights = useMemo(() =>
    months.map((m) => MONTH_HEADER_HEIGHT + WEEK_LABEL_HEIGHT + weekRowsForMonth(m.year, m.month) * ROW_HEIGHT + 8),
  [months]);

  const getItemLayout = useCallback((_: unknown, i: number) => {
    let offset = 0;
    for (let j = 0; j < i; j++) offset += monthHeights[j];
    return { length: monthHeights[i], offset, index: i };
  }, [monthHeights]);

  const renderMonth = useCallback(({ item }: { item: MonthData }) => {
    const { year, month } = item;
    const total  = getDaysInMonth(year, month);
    const offset = getFirstDayOffset(year, month);
    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const cells: React.ReactNode[] = Array.from({ length: offset }, (_, i) => (
      <View key={`e-${i}`} style={styles.dayCell} />
    ));

    for (let day = 1; day <= total; day++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const pred = predictions[ds];
      const isToday  = ds === todayStr;
      const isLogged = isLoggedDay(ds, logs);
      const phase = getPhase(
        pred?.isPeriod ?? false, isLogged,
        pred?.isPMS ?? false, pred?.isOvulationDay ?? false, pred?.isFertileWindow ?? false,
      );

      cells.push(
        <TouchableOpacity key={ds} style={styles.dayCell} onPress={() => onDayPress(ds)} activeOpacity={0.7}>

          {/* ── Today + phase: solid opaque circle ── */}
          {phase && isToday ? (
            <View style={[styles.solidCircle, {
              backgroundColor: phase.solid,
              shadowColor: phase.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 18,
            }]}>
              <Text style={styles.textBright}>{day}</Text>
            </View>

          /* ── Phase day: large SVG radial glow ── */
          ) : phase ? (
            <View style={styles.glowCell}>
              {/* SVG is larger than the cell, centered with negative offset */}
              <Svg
                width={GLOW_SIZE}
                height={GLOW_SIZE}
                style={{ position: 'absolute', left: glowLeft, top: glowTop }}
              >
                <Defs>
                  <RadialGradient id={`g${ds}`} cx="50%" cy="50%" r="50%">
                    <Stop offset="0%"   stopColor={phase.color} stopOpacity="0.85" />
                    <Stop offset="45%"  stopColor={phase.color} stopOpacity="0.45" />
                    <Stop offset="75%"  stopColor={phase.color} stopOpacity="0.12" />
                    <Stop offset="100%" stopColor={phase.color} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill={`url(#g${ds})`} />
              </Svg>
              <Text style={styles.textBright}>{day}</Text>
            </View>

          /* ── Today, no phase: white ring ── */
          ) : isToday ? (
            <View style={styles.todayRing}>
              <Text style={styles.textBright}>{day}</Text>
            </View>

          /* ── Normal day ── */
          ) : (
            <Text style={styles.textNormal}>{day}</Text>
          )}
        </TouchableOpacity>,
      );
    }

    return (
      <View style={styles.monthContainer}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>{monthName}</Text>
        </View>
        <View style={styles.weekRow}>
          {WEEK_DAYS.map((d) => (
            <View key={d} style={styles.weekCell}>
              <Text style={styles.weekText}>{d}</Text>
            </View>
          ))}
        </View>
        <View style={styles.grid}>{cells}</View>
      </View>
    );
  }, [predictions, logs, todayStr, onDayPress]);

  return (
    <FlatList
      data={months}
      renderItem={renderMonth}
      keyExtractor={(m) => m.key}
      getItemLayout={getItemLayout}
      initialScrollIndex={PAST_MONTHS}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 20 },
  monthContainer: { marginBottom: 8, overflow: 'visible' },
  monthHeader: { paddingHorizontal: CALENDAR_PADDING, height: MONTH_HEADER_HEIGHT, justifyContent: 'center' },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#F5F5F7' },
  weekRow: { flexDirection: 'row', paddingHorizontal: CALENDAR_PADDING, height: WEEK_LABEL_HEIGHT },
  weekCell: { width: DAY_SIZE, alignItems: 'center', justifyContent: 'center' },
  weekText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: CALENDAR_PADDING,
    overflow: 'visible',
  },
  dayCell: {
    width: DAY_SIZE,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  // Phase glow cell — same size as dayCell, overflow visible
  glowCell: {
    width: DAY_SIZE,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  solidCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRing: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textNormal: { fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  textBright: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
