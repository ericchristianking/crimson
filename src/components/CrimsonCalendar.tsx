import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { PredictedDayState, PeriodLog } from '@/src/types';
import { CrimsonColors, Fonts } from '@/constants/theme';
import { addMonths, toDateOnly, parseDate, addDays } from '@/src/utils/date';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 20;
const CALENDAR_PADDING = 10;
const DAY_SIZE = Math.floor((SCREEN_WIDTH - CARD_MARGIN * 2 - CALENDAR_PADDING * 2) / 7);
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PAST_MONTHS = 6;
const FUTURE_MONTHS = 12;
const MONTH_HEADER_HEIGHT = 44;
const WEEK_LABEL_HEIGHT = 24;
const ROW_HEIGHT = DAY_SIZE + 8;
const CIRCLE_SIZE = DAY_SIZE - 10;

/** Opacity multiplier for non-current months */
const DIM_OPACITY = 0.4;

type MonthData = { key: string; year: number; month: number };

type Props = {
  predictions: Record<string, PredictedDayState>;
  logs: PeriodLog[];
  eventDates?: Set<string>;
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

type PhaseColor = { bg: string; text: string } | null;

function getPhaseColor(
  isPeriod: boolean, isLogged: boolean,
  isPMS: boolean, isOv: boolean, isFert: boolean,
): PhaseColor {
  if (isLogged || isPeriod) return { bg: CrimsonColors.period,              text: '#fff' };
  if (isOv)                  return { bg: 'rgba(0,90,255,0.7)',             text: '#fff' };
  if (isFert)                return { bg: 'rgba(12,136,150,0.7)',            text: '#fff' };
  if (isPMS)                 return { bg: 'rgba(202,144,60,0.7)',           text: '#fff' };
  return null;
}

function generateMonths(): MonthData[] {
  const now = new Date();
  return Array.from({ length: PAST_MONTHS + FUTURE_MONTHS + 1 }, (_, i) => {
    const d = addMonths(now, i - PAST_MONTHS);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });
}

export function CrimsonCalendar({ predictions, logs, eventDates, onDayPress }: Props) {
  const months   = useMemo(generateMonths, []);
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
      const pred     = predictions[ds];
      const isToday  = ds === todayStr;
      const isLogged = isLoggedDay(ds, logs);
      const phase    = getPhaseColor(
        pred?.isPeriod ?? false, isLogged,
        pred?.isPMS ?? false, pred?.isOvulationDay ?? false, pred?.isFertileWindow ?? false,
      );

      const isFuturePrediction = phase && !isLogged && ds > todayStr;
      const hasEvent = eventDates?.has(ds);

      cells.push(
        <TouchableOpacity key={ds} style={styles.dayCell} onPress={() => onDayPress(ds)} activeOpacity={0.6}>
          {phase ? (
            <View style={[styles.circle, { backgroundColor: phase.bg }, isToday && styles.todayBorder, isFuturePrediction && { opacity: DIM_OPACITY }]}>
              <Text style={[styles.textPhase, { color: phase.text }]}>{day}</Text>
            </View>
          ) : isToday ? (
            <View style={[styles.circle, styles.todayEmpty]}>
              <Text style={styles.textToday}>{day}</Text>
            </View>
          ) : (
            <Text style={[styles.textNormal, { opacity: DIM_OPACITY }]}>{day}</Text>
          )}
          {hasEvent && <View style={styles.eventDot} />}
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
  }, [predictions, logs, eventDates, todayStr, onDayPress]);

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
  monthContainer: { marginBottom: 8 },
  monthHeader: { paddingHorizontal: CALENDAR_PADDING, height: MONTH_HEADER_HEIGHT, justifyContent: 'center' },
  monthTitle: { fontSize: 18, fontWeight: '400', color: '#F5F5F7', fontFamily: Fonts.regular },
  weekRow: { flexDirection: 'row', paddingHorizontal: CALENDAR_PADDING, height: WEEK_LABEL_HEIGHT },
  weekCell: { width: DAY_SIZE, alignItems: 'center', justifyContent: 'center' },
  weekText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: Fonts.semiBold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: CALENDAR_PADDING },
  dayCell: { width: DAY_SIZE, height: ROW_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  todayEmpty: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  textNormal: { fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.medium },
  textPhase:  { fontSize: 14, fontWeight: '400', fontFamily: Fonts.regular },
  textToday:  { fontSize: 15, fontWeight: '400', color: '#FFFFFF', fontFamily: Fonts.regular },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    position: 'absolute',
    bottom: 2,
  },
});
