import React, { useMemo } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/src/context/AppContext';
import { buildPredictedCalendar } from '@/src/services/cyclePrediction';
import { PartnerSwitcher } from '@/src/components/PartnerSwitcher';
import { buildTodayInfo } from '@/src/utils/todayInfo';
import { Colors, CrimsonColors, Fonts } from '@/constants/theme';
import { PHASE_BACKGROUNDS, CRIMSON_LOGO } from '@/src/constants/backgrounds';
import type { PhaseKey } from '@/src/utils/todayInfo';

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
    activePartnerId,
    showPms,
    showFertility,
    showOvulation,
    multiProfileEnabled,
    setActivePartner,
  } = useApp();

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
        </View>
      </ScrollView>
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
});
