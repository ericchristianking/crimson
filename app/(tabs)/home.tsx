import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/src/context/AppContext';
import { buildPredictedCalendar } from '@/src/services/cyclePrediction';
import {
  detectRecurringPatterns,
  getCurrentCycleDay,
  getNearbyPredictions,
  formatPrediction,
  countCompleteCycles,
} from '@/src/services/cycleDayPatterns';
import { PartnerSwitcher } from '@/src/components/PartnerSwitcher';
import { LogEventModal } from '@/src/components/LogEventModal';
import { buildTodayInfo } from '@/src/utils/todayInfo';
import { toDateOnly } from '@/src/utils/date';
import { Colors, CrimsonColors, Fonts } from '@/constants/theme';
import { PHASE_BACKGROUNDS, CRIMSON_LOGO } from '@/src/constants/backgrounds';
import type { PhaseKey } from '@/src/utils/todayInfo';
import type { EventType, EventCategory } from '@/src/types';

const PHASE_ACCENT: Record<PhaseKey, string> = {
  regular: 'rgba(255,255,255,0.7)',
  period: '#E40118',
  pms: '#CA903C',
  fertile: CrimsonColors.fertile,
  ovulation: CrimsonColors.ovulation,
};

export default function HomeScreen() {
  const router = useRouter();
  const {
    partners,
    periodLogs,
    cycleEvents,
    activePartnerId,
    showPms,
    showFertility,
    showOvulation,
    multiProfileEnabled,
    setActivePartner,
    toggleCycleEvent,
    getEventsForDate,
  } = useApp();

  const [showEventModal, setShowEventModal] = useState(false);

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

  const todayInfo = useMemo(() => buildTodayInfo(predictions, partnerLogs), [predictions, partnerLogs]);

  const partnerEvents = useMemo(
    () => (activePartnerId ? cycleEvents.filter((e) => e.partnerId === activePartnerId) : []),
    [cycleEvents, activePartnerId],
  );

  const completeCycles = useMemo(
    () => (activePartnerId ? countCompleteCycles(periodLogs, activePartnerId) : 0),
    [periodLogs, activePartnerId],
  );

  const recurringPatterns = useMemo(
    () => (activePartnerId ? detectRecurringPatterns(cycleEvents, periodLogs, activePartnerId) : []),
    [cycleEvents, periodLogs, activePartnerId],
  );

  const currentCycleDay = useMemo(
    () => (activePartnerId ? getCurrentCycleDay(periodLogs, activePartnerId) : null),
    [periodLogs, activePartnerId],
  );

  const nearbyPredictions = useMemo(
    () => (currentCycleDay != null ? getNearbyPredictions(recurringPatterns, currentCycleDay) : []),
    [recurringPatterns, currentCycleDay],
  );

  const predictionLines = useMemo(
    () => nearbyPredictions.map(formatPrediction),
    [nearbyPredictions],
  );

  const todayStr = useMemo(() => toDateOnly(new Date()), []);

  const todayEvents = useMemo(
    () => (activePartnerId ? getEventsForDate(activePartnerId, todayStr) : []),
    [activePartnerId, todayStr, getEventsForDate],
  );

  const handleToggleEvent = useCallback(
    (eventType: EventType, category: EventCategory) => {
      if (!activePartnerId) return;
      toggleCycleEvent(activePartnerId, todayStr, eventType, category);
    },
    [activePartnerId, todayStr, toggleCycleEvent],
  );

  const bgSource = PHASE_BACKGROUNDS[todayInfo.phaseKey] ?? PHASE_BACKGROUNDS.regular;
  const accent = PHASE_ACCENT[todayInfo.phaseKey];

  if (partners.length === 0) {
    return (
      <ImageBackground source={PHASE_BACKGROUNDS.regular} style={styles.bg} resizeMode="cover">
        <View style={styles.header}>
          <Image source={CRIMSON_LOGO} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Add a profile to start tracking</Text>
          <Text style={styles.addLink} onPress={() => router.push('/partner-form')}>
            + Add Profile
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={bgSource} style={styles.bg} resizeMode="cover">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={CRIMSON_LOGO} style={styles.logo} resizeMode="contain" />
        </View>

        {multiProfileEnabled && (
          <PartnerSwitcher
            partners={partners}
            activeId={activePartnerId}
            onSelect={setActivePartner}
            onAdd={() => router.push('/partner-form')}
          />
        )}

        <View style={styles.cards}>
          {/* Card 1 – Current Phase */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Current phase:</Text>
            <Text style={[styles.phaseTitle, { color: accent }]}>{todayInfo.phaseLabel}</Text>
            <Text style={styles.phaseSubtitle}>{todayInfo.phaseSubtitle}</Text>
            <Text style={styles.bestMove}>{todayInfo.bestMove}</Text>
          </View>

          {/* Card 2 – Next Period */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Next period:</Text>
            <Text style={styles.cardBigText}>
              {todayInfo.nextPeriodDate ?? 'Not enough data'}
            </Text>
          </View>

          {/* Card 3 – Fertile Window */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Fertile Window:</Text>
            <Text style={styles.cardBigText}>
              {todayInfo.fertileCountdown ?? 'Not enough data'}
            </Text>
          </View>

          {/* Card 4 – Cycle Patterns */}
          <View style={styles.card}>
            {partnerEvents.length === 0 ? (
              <>
                <Text style={styles.cardLabel}>Daily Insights</Text>
                <Text style={styles.patternHint}>
                  Track moods & events to discover patterns in her cycle.
                </Text>
              </>
            ) : completeCycles < 2 ? (
              <>
                <Text style={styles.cardLabel}>Daily Insights</Text>
                <Text style={styles.patternStats}>
                  {partnerEvents.length} event{partnerEvents.length !== 1 ? 's' : ''} logged
                </Text>
                <Text style={styles.patternHint}>
                  Patterns unlock after 2 cycles.
                </Text>
              </>
            ) : predictionLines.length > 0 ? (
              <>
                <Text style={styles.cardLabel}>Cycle Patterns</Text>
                {predictionLines.map((line, i) => (
                  <Text key={i} style={styles.insightLine}>{line}</Text>
                ))}
              </>
            ) : (
              <>
                <Text style={styles.cardLabel}>Cycle Patterns</Text>
                <Text style={styles.patternHint}>Nothing notable right now</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.logTodayBtn}
              onPress={() => setShowEventModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.logTodayText}>Log Today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {showEventModal && (
        <LogEventModal
          date={todayStr}
          events={todayEvents}
          onToggle={handleToggleEvent}
          onDismiss={() => setShowEventModal(false)}
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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    width: 180,
    height: 50,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: { fontSize: 16, color: 'rgba(255,255,255,0.6)', fontFamily: Fonts.regular },
  addLink: { fontSize: 18, fontWeight: '400', color: '#E85A5F', fontFamily: Fonts.regular },
  cards: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    padding: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
    fontFamily: Fonts.regular,
  },
  phaseTitle: {
    fontSize: 28,
    fontWeight: '400',
    marginBottom: 4,
    fontFamily: Fonts.regular,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    fontFamily: Fonts.regular,
  },
  bestMove: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Fonts.regular,
  },
  cardBigText: {
    fontSize: 26,
    fontWeight: '400',
    color: '#F5F5F7',
    marginTop: 2,
    fontFamily: Fonts.regular,
  },
  patternHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: Fonts.regular,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 20,
  },
  patternStats: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5F5F7',
    fontFamily: Fonts.medium,
    marginTop: 4,
  },
  insightLine: {
    fontSize: 15,
    color: '#F5F5F7',
    fontFamily: Fonts.regular,
    marginTop: 6,
    lineHeight: 22,
  },
  logTodayBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  logTodayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F5F7',
    fontFamily: Fonts.semiBold,
  },
});
