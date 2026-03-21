import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CrimsonColors, Fonts } from '@/constants/theme';

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
  return (
    <View style={styles.row}>
      <View style={[styles.pill, styles.pillActive]}>
        <View style={[styles.dot, { backgroundColor: CrimsonColors.period }]} />
        <Text style={styles.label}>Period</Text>
      </View>
      <TouchableOpacity
        style={[styles.pill, showPms && styles.pillActive]}
        onPress={onTogglePms}
      >
        <View style={[styles.dot, { backgroundColor: CrimsonColors.pms }]} />
        <Text style={styles.label}>PMS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.pill, showFertility && styles.pillActive]}
        onPress={onToggleFertility}
      >
        <View style={[styles.dot, { backgroundColor: CrimsonColors.fertile }]} />
        <Text style={styles.label}>Fertile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.pill, showOvulation && styles.pillActive]}
        onPress={onToggleOvulation}
      >
        <View style={[styles.dot, { backgroundColor: CrimsonColors.ovulation }]} />
        <Text style={styles.label}>Ovulation</Text>
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
    backgroundColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    opacity: 0.4,
  },
  pillActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    opacity: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#F5F5F7', fontFamily: Fonts.semiBold },
});
