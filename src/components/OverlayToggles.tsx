import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CrimsonColors } from '@/constants/theme';

type Props = {
  showPms: boolean;
  showFertility: boolean;
  showOvulation: boolean;
  onTogglePms: () => void;
  onToggleFertility: () => void;
  onToggleOvulation: () => void;
};

export function OverlayToggles({
  showPms,
  showFertility,
  showOvulation,
  onTogglePms,
  onToggleFertility,
  onToggleOvulation,
}: Props) {
  const isDark = (useColorScheme() ?? 'light') === 'dark';
  const bg = isDark ? CrimsonColors.dark.surface : CrimsonColors.light.surface;
  const text = isDark ? '#F5F5F7' : '#141318';

  const periodPillBg = isDark ? CrimsonColors.periodSubtleDark : '#F0D0D1';
  const pmsPillBg = isDark ? CrimsonColors.pmsSubtleDark : CrimsonColors.pmsSubtle;
  const fertilePillBg = isDark ? CrimsonColors.fertileSubtleDark : CrimsonColors.fertileSubtle;
  const ovulationPillBg = isDark ? CrimsonColors.ovulationSubtleDark : CrimsonColors.ovulationSubtle;

  return (
    <View style={[styles.row, { backgroundColor: bg }]}>
      <View style={[styles.pill, { backgroundColor: periodPillBg }]}>
        <View style={[styles.dot, { backgroundColor: CrimsonColors.period }]} />
        <Text style={[styles.label, { color: text }]}>Period</Text>
      </View>
      <TouchableOpacity
        style={[styles.pill, showPms && { backgroundColor: pmsPillBg }]}
        onPress={onTogglePms}
      >
        <View style={[styles.dot, { backgroundColor: CrimsonColors.pms }]} />
        <Text style={[styles.label, { color: text }]}>PMS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.pill, showFertility && { backgroundColor: fertilePillBg }]}
        onPress={onToggleFertility}
      >
        <View style={[styles.dot, { backgroundColor: CrimsonColors.fertile }]} />
        <Text style={[styles.label, { color: text }]}>Fertile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.pill, showOvulation && { backgroundColor: ovulationPillBg }]}
        onPress={onToggleOvulation}
      >
        <View style={[styles.dot, { backgroundColor: CrimsonColors.ovulation }]} />
        <Text style={[styles.label, { color: text }]}>Ovulation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 14, fontWeight: '600' },
});
