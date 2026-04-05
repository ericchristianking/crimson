import React, { useMemo, useCallback, useState } from 'react';
import { View, ImageBackground, StyleSheet, Text } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { buildPredictedCalendar } from '@/src/services/cyclePrediction';
import { CrimsonCalendar } from '@/src/components/CrimsonCalendar';
import { ReplacePeriodModal } from '@/src/components/ReplacePeriodModal';
import { PmsAdjustModal } from '@/src/components/PmsAdjustModal';
import { DayActionSheet, DayStatus } from '@/src/components/DayActionSheet';
import { PhaseInfoPopup } from '@/src/components/PhaseInfoPopup';
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
    logPeriodStart,
    forceReplacePeriod,
    confirmDay,
    removeDayFromPeriod,
    updatePartner,
    togglePms,
    toggleFertility,
    toggleOvulation,
    toggleCycleEvent,
    getEventsForDate,
  } = useApp();

  const [actionSheetDate, setActionSheetDate] = useState<string | null>(null);
  const [actionSheetLog, setActionSheetLog] = useState<PeriodLog | null>(null);
  const [actionSheetStatus, setActionSheetStatus] = useState<DayStatus>('empty');
  const [replacePrompt, setReplacePrompt] = useState<{ date: string; existingLogId: string } | null>(null);
  const [showPmsModal, setShowPmsModal] = useState(false);
  const [eventModalDate, setEventModalDate] = useState<string | null>(null);
  const [phasePopupDate, setPhasePopupDate] = useState<string | null>(null);

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

  const todayStr = useMemo(() => toDateOnly(new Date()), []);

  const handleDayPress = useCallback(
    (date: string) => {
      const log = getLogContainingDate(partnerLogs, date);
      if (log) {
        const isConfirmed = (log.confirmedDays ?? []).includes(date);
        setActionSheetDate(date);
        setActionSheetLog(log);
        setActionSheetStatus(isConfirmed ? 'confirmed' : 'autofilled');
        return;
      }

      const isFuture = date > todayStr;

      if (isFuture) {
        const pred = predictions[date];
        if (pred && (pred.isPeriod || pred.isPMS || pred.isFertileWindow || pred.isOvulationDay)) {
          setPhasePopupDate(date);
        }
        return;
      }

      setActionSheetDate(date);
      setActionSheetLog(null);
      setActionSheetStatus('empty');
    },
    [partnerLogs, predictions, todayStr],
  );

  const handleActionLogPeriod = useCallback(() => {
    if (!actionSheetDate || !activePartnerId) return;

    if (actionSheetStatus === 'autofilled' && actionSheetLog) {
      confirmDay(actionSheetLog.id, actionSheetDate);
      setActionSheetDate(null);
      return;
    }

    const result = logPeriodStart(activePartnerId, actionSheetDate);
    if (result.ok) {
      setActionSheetDate(null);
    } else if (result.reason === 'tooClose' && 'existingLogId' in result) {
      setActionSheetDate(null);
      setReplacePrompt({ date: actionSheetDate, existingLogId: result.existingLogId });
    }
  }, [actionSheetDate, actionSheetStatus, actionSheetLog, activePartnerId, logPeriodStart, confirmDay]);

  const handleActionLogEvent = useCallback(() => {
    if (!actionSheetDate) return;
    setEventModalDate(actionSheetDate);
    setActionSheetDate(null);
  }, [actionSheetDate]);

  const handleRemove = useCallback(() => {
    if (!actionSheetLog || !actionSheetDate) return;
    removeDayFromPeriod(actionSheetLog.id, actionSheetDate);
    setActionSheetDate(null);
  }, [actionSheetLog, actionSheetDate, removeDayFromPeriod]);

  const handleReplace = useCallback(() => {
    if (!replacePrompt || !activePartnerId) return;
    forceReplacePeriod(activePartnerId, replacePrompt.date, replacePrompt.existingLogId);
    setReplacePrompt(null);
  }, [replacePrompt, activePartnerId, forceReplacePeriod]);

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
          dayStatus={actionSheetStatus}
          hasEvents={eventDates.has(actionSheetDate)}
          onLogPeriod={handleActionLogPeriod}
          onLogEvent={handleActionLogEvent}
          onRemove={handleRemove}
          onDismiss={() => setActionSheetDate(null)}
        />
      )}

      {replacePrompt != null && (
        <ReplacePeriodModal
          date={replacePrompt.date}
          onReplace={handleReplace}
          onDismiss={() => setReplacePrompt(null)}
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

      {phasePopupDate != null && predictions[phasePopupDate] && (
        <PhaseInfoPopup
          date={phasePopupDate}
          prediction={predictions[phasePopupDate]}
          onChangePms={
            predictions[phasePopupDate]?.isPMS
              ? () => { setPhasePopupDate(null); setShowPmsModal(true); }
              : undefined
          }
          onDismiss={() => setPhasePopupDate(null)}
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
