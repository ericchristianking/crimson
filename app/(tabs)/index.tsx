import React, { useMemo, useCallback, useState } from 'react';
import { View, ImageBackground, StyleSheet, Text } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { buildPredictedCalendar } from '@/src/services/cyclePrediction';
import { CrimsonCalendar } from '@/src/components/CrimsonCalendar';
import { LogPeriodModal } from '@/src/components/LogPeriodModal';
import { RemovePeriodModal } from '@/src/components/RemovePeriodModal';
import { PmsAdjustModal } from '@/src/components/PmsAdjustModal';
import { OverlayToggles } from '@/src/components/OverlayToggles';
import { parseDate, addDays, toDateOnly } from '@/src/utils/date';
import { PeriodLog } from '@/src/types';
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
  } = useApp();

  const [logModalDate, setLogModalDate] = useState<string | null>(null);
  const [editLog, setEditLog] = useState<PeriodLog | null>(null);
  const [showPmsModal, setShowPmsModal] = useState(false);

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

  const maxLoggable = useMemo(() => toDateOnly(addDays(new Date(), 7)), []);

  const handleDayPress = useCallback(
    (date: string) => {
      const log = getLogContainingDate(periodLogs, date);
      if (log) {
        setEditLog(log);
        return;
      }
      const prediction = predictions[date];
      if (prediction?.isPMS) {
        setShowPmsModal(true);
        return;
      }
      if (date > maxLoggable) return;
      setLogModalDate(date);
    },
    [periodLogs, predictions, maxLoggable],
  );

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

  return (
    <ImageBackground
      source={CALENDAR_BACKGROUND}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.pageHeader}>
        <Text style={styles.headline}>Cycle Calendar</Text>
      </View>
      <View style={styles.contentWrap}>
        <View style={styles.calendarCard}>
          <CrimsonCalendar
            predictions={predictions}
            logs={partnerLogs}
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

      {logModalDate != null && (
        <LogPeriodModal
          date={logModalDate}
          onConfirm={handleLogConfirm}
          onForceReplace={handleForceReplace}
          onDismiss={() => setLogModalDate(null)}
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
    paddingBottom: 35,
  },
  headline: {
    fontSize: 28,
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: Fonts.regular,
    textAlign: 'left',
  },
  contentWrap: {
    flex: 1,
    flexDirection: 'column',
  },
  calendarCard: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
  },
});
