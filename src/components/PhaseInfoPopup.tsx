import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Fonts, CrimsonColors } from '@/constants/theme';
import { parseDate } from '@/src/utils/date';
import { PredictedDayState } from '@/src/types';

type Props = {
  date: string;
  prediction: PredictedDayState;
  onChangePms?: () => void;
  onDismiss: () => void;
};

function getPhaseInfo(pred: PredictedDayState): { emoji: string; label: string; hint: string; color: string } {
  if (pred.isOvulationDay) return { emoji: '🥚', label: 'Ovulation Day', hint: 'Most fertile day of the cycle', color: CrimsonColors.ovulation };
  if (pred.isFertileWindow) return { emoji: '💧', label: 'Fertile Window', hint: 'Higher chance of conception', color: CrimsonColors.fertile };
  if (pred.isPMS) return { emoji: '⚡', label: 'PMS', hint: 'Premenstrual symptoms may occur', color: CrimsonColors.pms };
  if (pred.isPeriod) return { emoji: '🩸', label: 'Predicted Period', hint: 'Period is predicted around this time', color: CrimsonColors.period };
  return { emoji: '📅', label: 'Cycle Day', hint: '', color: '#F5F5F7' };
}

export function PhaseInfoPopup({ date, prediction, onChangePms, onDismiss }: Props) {
  const formatted = parseDate(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const phase = getPhaseInfo(prediction);

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{formatted}</Text>

          <View style={styles.phaseRow}>
            <Text style={styles.phaseEmoji}>{phase.emoji}</Text>
            <View style={styles.phaseTextWrap}>
              <Text style={[styles.phaseLabel, { color: phase.color }]}>{phase.label}</Text>
              {phase.hint !== '' && <Text style={styles.phaseHint}>{phase.hint}</Text>}
            </View>
          </View>

          {prediction.isPMS && onChangePms && (
            <TouchableOpacity style={styles.option} onPress={onChangePms} activeOpacity={0.7}>
              <Text style={styles.optionEmoji}>⚙️</Text>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionLabel}>Change PMS Duration</Text>
                <Text style={styles.optionHint}>Adjust how many PMS days to show</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: CrimsonColors.glass.border,
    backgroundColor: 'rgba(20,20,20,0.92)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
    fontFamily: Fonts.bold,
    marginBottom: 20,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: CrimsonColors.glass.surfaceElevated,
    marginBottom: 10,
  },
  phaseEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  phaseTextWrap: {
    flex: 1,
  },
  phaseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5F5F7',
    fontFamily: Fonts.semiBold,
  },
  phaseHint: {
    fontSize: 13,
    color: CrimsonColors.glass.textSecondary,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: CrimsonColors.glass.surfaceElevated,
    marginBottom: 10,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5F5F7',
    fontFamily: Fonts.semiBold,
  },
  optionHint: {
    fontSize: 13,
    color: CrimsonColors.glass.textSecondary,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  closeText: {
    fontSize: 15,
    color: CrimsonColors.glass.textSecondary,
    fontFamily: Fonts.regular,
  },
});
