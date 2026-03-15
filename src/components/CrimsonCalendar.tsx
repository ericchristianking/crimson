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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, CrimsonColors } from '@/constants/theme';
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
type MonthData = { key: string; year: number; month: number };

type Props = {
  predictions: Record<string, PredictedDayState>;
  logs: PeriodLog[];
  onDayPress: (date: string) => void;
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function weekRowsForMonth(year: number, month: number): number {
  const days = getDaysInMonth(year, month);
  const offset = getFirstDayOffset(year, month);
  return Math.ceil((days + offset) / 7);
}

function isLoggedPeriodDay(date: string, logs: PeriodLog[]): boolean {
  const d = parseDate(date);
  for (const log of logs) {
    const start = parseDate(log.startDate);
    const end = addDays(start, log.periodLengthDays - 1);
    if (d >= start && d <= end) return true;
  }
  return false;
}

function bgColorForDay(
  isPeriod: boolean,
  isLogged: boolean,
  isPMS: boolean,
  isOvulation: boolean,
  isFertile: boolean,
  isDark: boolean,
): string | undefined {
  if (isLogged) return CrimsonColors.period;
  if (isPeriod) return isDark ? CrimsonColors.periodSubtleDark : CrimsonColors.periodSubtle;
  if (isOvulation) return isDark ? CrimsonColors.ovulationSubtleDark : CrimsonColors.ovulationSubtle;
  if (isFertile) return isDark ? CrimsonColors.fertileSubtleDark : CrimsonColors.fertileSubtle;
  if (isPMS) return isDark ? CrimsonColors.pmsSubtleDark : CrimsonColors.pmsSubtle;
  return undefined;
}

function textColorForDay(
  isLogged: boolean,
  isDark: boolean,
): string {
  if (isLogged) return '#FFFFFF';
  return isDark ? '#E0E0E0' : '#3A3A3C';
}

function generateMonths(): MonthData[] {
  const months: MonthData[] = [];
  const now = new Date();
  for (let i = -PAST_MONTHS; i <= FUTURE_MONTHS; i++) {
    const d = addMonths(now, i);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

export function CrimsonCalendar({
  predictions,
  logs,
  onDayPress,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const months = useMemo(() => generateMonths(), []);
  const todayStr = useMemo(() => toDateOnly(new Date()), []);

  const monthHeights = useMemo(() => {
    return months.map((m) => {
      const rows = weekRowsForMonth(m.year, m.month);
      return MONTH_HEADER_HEIGHT + WEEK_LABEL_HEIGHT + rows * ROW_HEIGHT + 8;
    });
  }, [months]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => {
      let offset = 0;
      for (let i = 0; i < index; i++) offset += monthHeights[i];
      return { length: monthHeights[index], offset, index };
    },
    [monthHeights],
  );

  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const dimText = isDark ? CrimsonColors.dark.textTertiary : CrimsonColors.light.textTertiary;
  const headerBg = isDark ? CrimsonColors.dark.surface : CrimsonColors.light.surface;

  const renderMonth = useCallback(
    ({ item }: { item: MonthData }) => {
      const { year, month } = item;
      const daysInMonth = getDaysInMonth(year, month);
      const offset = getFirstDayOffset(year, month);
      const monthName = new Date(year, month).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      const cells: React.ReactNode[] = [];
      for (let i = 0; i < offset; i++) {
        cells.push(<View key={`e-${i}`} style={styles.dayCell} />);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const prediction = predictions[dateStr];
        const isToday = dateStr === todayStr;
        const isLogged = isLoggedPeriodDay(dateStr, logs);

        const isPeriod = prediction?.isPeriod ?? false;
        const isPMS = prediction?.isPMS ?? false;
        const isFertile = prediction?.isFertileWindow ?? false;
        const isOvulation = prediction?.isOvulationDay ?? false;

        const bg = bgColorForDay(isPeriod, isLogged, isPMS, isOvulation, isFertile, isDark);
        const dayTextColor = textColorForDay(isLogged, isDark);
        const hasSolidBg = isLogged;

        cells.push(
          <TouchableOpacity
            key={dateStr}
            style={styles.dayCell}
            onPress={() => onDayPress(dateStr)}
            activeOpacity={0.6}
          >
            <View
              style={[
                styles.dayCircle,
                bg != null && { backgroundColor: bg },
                isToday && !hasSolidBg && {
                  borderWidth: 2,
                  borderColor: isDark ? '#F5F5F7' : '#141318',
                },
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: dayTextColor },
                  isToday && !hasSolidBg && { fontWeight: '700' },
                ]}
              >
                {day}
              </Text>
            </View>
          </TouchableOpacity>,
        );
      }

      return (
        <View style={styles.monthContainer}>
          <View style={[styles.monthHeader, { backgroundColor: headerBg }]}>
            <Text style={[styles.monthTitle, { color: textColor }]}>{monthName}</Text>
          </View>
          <View style={styles.weekDayRow}>
            {WEEK_DAYS.map((d) => (
              <View key={d} style={styles.weekDayCell}>
                <Text style={[styles.weekDayText, { color: dimText }]}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.daysGrid}>{cells}</View>
        </View>
      );
    },
    [
      predictions,
      logs,
      todayStr,
      textColor,
      dimText,
      headerBg,
      isDark,
      onDayPress,
    ],
  );

  return (
    <FlatList
      data={months}
      renderItem={renderMonth}
      keyExtractor={(item) => item.key}
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
  monthHeader: {
    paddingHorizontal: CALENDAR_PADDING,
    height: MONTH_HEADER_HEIGHT,
    justifyContent: 'center',
  },
  monthTitle: { fontSize: 18, fontWeight: '700' },
  weekDayRow: {
    flexDirection: 'row',
    paddingHorizontal: CALENDAR_PADDING,
    height: WEEK_LABEL_HEIGHT,
  },
  weekDayCell: {
    width: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    width: DAY_SIZE,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: DAY_SIZE - 8,
    height: DAY_SIZE - 8,
    borderRadius: (DAY_SIZE - 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 15, fontWeight: '500' },
  weekDayText: { fontSize: 12, fontWeight: '600' },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: CALENDAR_PADDING,
  },
});
