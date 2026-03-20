import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CrimsonColors } from '@/constants/theme';
import type { PhaseKey } from '@/src/utils/todayInfo';

type Props = {
  phaseKey: PhaseKey;
  phaseLabel: string;
  phaseSubtitle: string;
  nextEventLabel: string | null;
  bestMove: string;
};

const PHASE_COLOR: Record<PhaseKey, string> = {
  regular: 'rgba(255,255,255,0.7)',
  period: '#E85A5F',
  pms: '#FAE0AD',
  fertile: '#2DEDF1',
  ovulation: '#6B7BFF',
};

export function StatusCard({
  phaseKey,
  phaseLabel,
  phaseSubtitle,
  nextEventLabel,
  bestMove,
}: Props) {
  const phaseColor = PHASE_COLOR[phaseKey];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.dot, { backgroundColor: phaseColor }]} />
        <Text style={[styles.phase, { color: phaseColor }]}>{phaseLabel}</Text>
      </View>
      <Text style={styles.subtitle}>{phaseSubtitle}</Text>

      {nextEventLabel && (
        <Text style={styles.nextEvent}>{nextEventLabel}</Text>
      )}

      <Text style={styles.bestMove}>{bestMove}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  phase: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 13, marginLeft: 17, color: 'rgba(255,255,255,0.6)' },
  nextEvent: { fontSize: 14, fontWeight: '600', marginTop: 8, color: '#F5F5F7' },
  bestMove: { fontSize: 13, fontStyle: 'italic', marginTop: 2, color: 'rgba(255,255,255,0.5)' },
});
