import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/src/context/AppContext';
import { buildPredictedCalendar } from '@/src/services/cyclePrediction';
import { StatusCard } from '@/src/components/StatusCard';
import { PartnerSwitcher } from '@/src/components/PartnerSwitcher';
import { buildTodayInfo } from '@/src/utils/todayInfo';
import { Colors, CrimsonColors } from '@/constants/theme';

export default function HomeScreen() {
  const isDark = (useColorScheme() ?? 'light') === 'dark';
  const bgColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const dimColor = isDark ? '#9BA1A6' : '#6b6f76';

  const router = useRouter();
  const {
    partners,
    periodLogs,
    activePartnerId,
    showPms,
    showFertility,
    showOvulation,
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

  if (partners.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Crimson</Text>
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: dimColor }]}>Add a partner to start tracking</Text>
          <Text
            style={styles.addLink}
            onPress={() => router.push('/partner-form')}
          >
            + Add Partner
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Crimson</Text>

      <PartnerSwitcher
        partners={partners}
        activeId={activePartnerId}
        onSelect={setActivePartner}
        onAdd={() => router.push('/partner-form')}
      />

      <StatusCard
        phaseKey={todayInfo.phaseKey}
        phaseLabel={todayInfo.phaseLabel}
        phaseSubtitle={todayInfo.phaseSubtitle}
        nextEventLabel={todayInfo.nextEventLabel}
        bestMove={todayInfo.bestMove}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: { fontSize: 16 },
  addLink: { fontSize: 18, fontWeight: '700', color: CrimsonColors.primary },
});
