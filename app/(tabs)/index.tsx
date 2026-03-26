import React, { useMemo, useCallback, useState } from 'react';
import { View, ImageBackground, StyleSheet, Text } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { buildPredictedCalendar } from '@/src/services/cyclePrediction';
import { CrimsonCalendar } from '@/src/components/CrimsonCalendar';
import { LogPeriodModal } from '@/src/components/LogPeriodModal';
import { RemovePeriodModal } from '@/src/components/RemovePeriodModal';
import { PmsAdjustModal } from '@/src/components/PmsAdjustModal';
import { DayActionSheet } from '@/src/components/DayActionSheet';
import { LogEventModal } from '@/src/components/LogEventModal';
import { OverlayToggles } from '@/src/components/OverlayToggles';
import { parseDate, addDays, toDateOnly } from '@/src/utils/date';
import { PeriodLog, EventType, EventCategory } from '@/src/types';
import { Colors, Fonts } from '@/constants/theme';
import { CALENDAR_BACKGROUND } from '@/src/constants/backgrounds';

function getLogContainingDate(logs: PeriodLog[], date: string): PeriodLog | null {
  const d = parseDate(date);
  for (const log of logs) {
    const start = parseDate(log.startDate);
    const end = addDays(start, log.periodLengthDays - 1);
    if (d >= start && d <= end) return log;
  }
  return null;
}

export default function CalendarScreen() {
  const {
    partners,
    periodLogs,
    cycleEvents,
    activePartnerId,
    showPms,
    showFertility,
    showOvulation,
    addPeriodLog,
    forceAddPeriodLog,
    removePeriodLog,
    updatePeriodLog,
    updatePartner,
    togglePms,
    toggleFertility,
    toggleOvulation,
    toggleCycleEvent,
    getEventsForDate,
  } = useApp();

  const [logModalDate, setLogModalDate] = useState<string | null>(null);
  const [editLog, setEditLog] = useState<PeriodLog | null>(null);
  const [showPmsModal, setShowPmsModal] = useState(false);
  const [actionSheetDate, setActionSheetDate] = useState<string | null>(null);
  const [eventModalDate, setEventModalDate] = useState<string | null>(null);

  const activePartner = useMemo(
    () => partners.find((p) => p.id === activePartnerId) ?? null,
    [partners, activePartnerId],
  );

  const pmsDays = activePartner?.pmsDays ?? 7;

  const predictions = useMemo(
    () =>
      activePartnerId
        ? buildPredictedCalendar(periodLogs, activePartnerId, showPms, showFertility, showOvulation, pmsDays)
        : {},
    [periodLogs, activePartnerId, showPms, showFertility, showOvulation, pmsDays],
  );

  const partnerLogs = useMemo(
    () => (activePartnerId ? periodLogs.filter((l) => l.partnerId === activePartnerId) : []),
    [periodLogs, activePartnerId],
  );

  const eventDates = useMemo(() => {
    if (!activePartnerId) return new Set<string>();
    return new Set(
      cycleEvents.filter((e) => e.partnerId === activePartnerId).map((e) => e.date),
    );
  }, [cycleEvents, activePartnerId]);

  const maxLoggable = useMemo(() => toDateOnly(addDays(new Date(), 7)), []);

  const handleDayPress = useCallback(
    (date: string) => {
      const log = getLogContainingDate(periodLogs, date);
      if (log) {
        setEditLog(log);
        return;
      }
      if (date > maxLoggable) {
        setEventModalDate(date);
        return;
      }
      setActionSheetDate(date);
    },
    [periodLogs, maxLoggable],
  );

  const handleActionLogPeriod = useCallback(() => {
    if (!actionSheetDate) return;
    const prediction = predictions[actionSheetDate];
    if (prediction?.isPMS) {
      setActionSheetDate(null);
      setShowPmsModal(true);
      return;
    }
    setLogModalDate(actionSheetDate);
    setActionSheetDate(null);
  }, [actionSheetDate, predictions]);

  const handleActionLogEvent = useCallback(() => {
    if (!actionSheetDate) return;
    setEventModalDate(actionSheetDate);
    setActionSheetDate(null);
  }, [actionSheetDate]);

  const handleLogConfirm = useCallback(
    (date: string, days: number) => {
      if (!activePartnerId) return { ok: false as const, reason: 'No partner selected.' };
      return addPeriodLog(activePartnerId, date, days);
    },
    [activePartnerId, addPeriodLog],
  );

  const handleForceReplace = useCallback(
    (date: string, days: number, replaceLogId: string) => {
      if (!activePartnerId) return;
      forceAddPeriodLog(activePartnerId, date, days, replaceLogId);
    },
    [activePartnerId, forceAddPeriodLog],
  );

  const handleToggleEvent = useCallback(
    (eventType: EventType, category: EventCategory) => {
      if (!activePartnerId || !eventModalDate) return;
      toggleCycleEvent(activePartnerId, eventModalDate, eventType, category);
    },
    [activePartnerId, eventModalDate, toggleCycleEvent],
  );

  const eventModalEvents = useMemo(
    () => (activePartnerId && eventModalDate ? getEventsForDate(activePartnerId, eventModalDate) : []),
    [activePartnerId, eventModalDate, getEventsForDate],
  );

  return (
    <ImageBackground
      source={CALENDAR_BACKGROUND}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.pageHeader}>
        <Text style={styles.headline}>Cycle Calendar</Text>
        <Text style={styles.subtitle}>Tap a day to log or edit</Text>
      </View>
      <View style={styles.contentWrap}>
        <View style={styles.calendarCard}>
          <CrimsonCalendar
            predictions={predictions}
            logs={partnerLogs}
            eventDates={eventDates}
            onDayPress={handleDayPress}
          />
        </View>
        <OverlayToggles
          showPms={showPms}
          showFertility={showFertility}
          showOvulation={showOvulation}
          onTogglePms={togglePms}
          onToggleFertility={toggleFertility}
          onToggleOvulation={toggleOvulation}
        />
      </View>

      {actionSheetDate != null && (
        <DayActionSheet
          date={actionSheetDate}
          hasEvents={eventDates.has(actionSheetDate)}
          onLogPeriod={handleActionLogPeriod}
          onLogEvent={handleActionLogEvent}
          onDismiss={() => setActionSheetDate(null)}
        />
      )}

      {logModalDate != null && (
        <LogPeriodModal
          date={logModalDate}
          onConfirm={handleLogConfirm}
          onForceReplace={handleForceReplace}
          onDismiss={() => setLogModalDate(null)}
        />
      )}

      {eventModalDate != null && (
        <LogEventModal
          date={eventModalDate}
          events={eventModalEvents}
          onToggle={handleToggleEvent}
          onDismiss={() => setEventModalDate(null)}
        />
      )}

      {editLog != null && (
        <RemovePeriodModal
          log={editLog}
          onSave={(days) => {
            updatePeriodLog(editLog.id, days);
            setEditLog(null);
          }}
          onRemove={() => {
            removePeriodLog(editLog.id);
            setEditLog(null);
          }}
          onLogEvent={() => {
            const date = editLog.startDate;
            setEditLog(null);
            setEventModalDate(date);
          }}
          onDismiss={() => setEditLog(null)}
        />
      )}

      {showPmsModal && activePartner && (
        <PmsAdjustModal
          currentDays={activePartner.pmsDays ?? 7}
          onSave={(days) => {
            updatePartner({ ...activePartner, pmsDays: days });
            setShowPmsModal(false);
          }}
          onDismiss={() => setShowPmsModal(false)}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  pageHeader: {
    paddingTop: 76,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headline: {
    fontSize: 28,
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: Fonts.regular,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  contentWrap: {
    flex: 1,
    flexDirection: 'column',
  },
  calendarCard: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
  },
});
