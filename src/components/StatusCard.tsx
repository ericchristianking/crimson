import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, CrimsonColors } from '@/constants/theme';
import type { PhaseKey } from '@/src/utils/todayInfo';

type Props = {
  phaseKey: PhaseKey;
  phaseLabel: string;
  phaseSubtitle: string;
  nextEventLabel: string | null;
  bestMove: string;
};

const CARD_BG_LIGHT: Record<PhaseKey, string> = {
  regular: CrimsonColors.light.surface,
  period: '#F5E0E1',
  pms: '#FDF2DA',
  fertile: '#E4F6F7',
  ovulation: '#D4EDEF',
};

const CARD_BG_DARK: Record<PhaseKey, string> = {
  regular: CrimsonColors.dark.surface,
  period: CrimsonColors.periodSubtleDark,
  pms: CrimsonColors.pmsSubtleDark,
  fertile: CrimsonColors.fertileSubtleDark,
  ovulation: CrimsonColors.ovulationSubtleDark,
};

const PHASE_COLOR: Record<PhaseKey, string> = {
  regular: '#6b6f76',
  period: CrimsonColors.period,
  pms: '#B8860B',
  fertile: '#2D9EA1',
  ovulation: CrimsonColors.ovulation,
};

export function StatusCard({
  phaseKey,
  phaseLabel,
  phaseSubtitle,
  nextEventLabel,
  bestMove,
}: Props) {
  const isDark = (useColorScheme() ?? 'light') === 'dark';
  const cardBg = isDark ? CARD_BG_DARK[phaseKey] : CARD_BG_LIGHT[phaseKey];
  const text = isDark ? Colors.dark.text : Colors.light.text;
  const secondary = isDark ? CrimsonColors.dark.textSecondary : CrimsonColors.light.textSecondary;
  const phaseColor = PHASE_COLOR[phaseKey];

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.topRow}>
        <View style={[styles.dot, { backgroundColor: phaseColor }]} />
        <Text style={[styles.phase, { color: phaseColor }]}>{phaseLabel}</Text>
      </View>
      <Text style={[styles.subtitle, { color: secondary }]}>{phaseSubtitle}</Text>

      {nextEventLabel && (
        <Text style={[styles.nextEvent, { color: text }]}>{nextEventLabel}</Text>
      )}

      <Text style={[styles.bestMove, { color: secondary }]}>{bestMove}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  phase: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 13, marginLeft: 17 },
  nextEvent: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  bestMove: { fontSize: 13, fontStyle: 'italic', marginTop: 2 },
});
