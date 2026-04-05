import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Fonts, CrimsonColors } from '@/constants/theme';
import { parseDate } from '@/src/utils/date';

export type DayStatus = 'empty' | 'autofilled' | 'confirmed';

type Props = {
  date: string;
  dayStatus: DayStatus;
  hasEvents: boolean;
  onLogPeriod: () => void;
  onLogEvent: () => void;
  onRemove: () => void;
  onDismiss: () => void;
};

export function DayActionSheet({
  date, dayStatus, hasEvents,
  onLogPeriod, onLogEvent, onRemove, onDismiss,
}: Props) {
  const formatted = parseDate(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{formatted}</Text>

          {dayStatus === 'empty' && (
            <>
              <TouchableOpacity style={styles.option} onPress={onLogPeriod} activeOpacity={0.7}>
                <Text style={styles.optionEmoji}>🩸</Text>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>Period</Text>
                  <Text style={styles.optionHint}>Log period start</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={onLogEvent} activeOpacity={0.7}>
                <Text style={styles.optionEmoji}>📝</Text>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>{hasEvents ? 'Edit Events' : 'Log Event'}</Text>
                  <Text style={styles.optionHint}>Mood, intimacy, energy & more</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {dayStatus === 'autofilled' && (
            <>
              <TouchableOpacity style={styles.option} onPress={onLogPeriod} activeOpacity={0.7}>
                <Text style={styles.optionEmoji}>🩸</Text>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>Log Period</Text>
                  <Text style={styles.optionHint}>Confirm this day</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={onRemove} activeOpacity={0.7}>
                <Text style={styles.optionEmoji}>🗑️</Text>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, styles.destructive]}>Remove Day</Text>
                  <Text style={styles.optionHint}>Remove this day from period</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={onLogEvent} activeOpacity={0.7}>
                <Text style={styles.optionEmoji}>📝</Text>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>{hasEvents ? 'Edit Events' : 'Log Event'}</Text>
                  <Text style={styles.optionHint}>Mood, intimacy, energy & more</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {dayStatus === 'confirmed' && (
            <>
              <TouchableOpacity style={styles.option} onPress={onRemove} activeOpacity={0.7}>
                <Text style={styles.optionEmoji}>🗑️</Text>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, styles.destructive]}>Remove Day</Text>
                  <Text style={styles.optionHint}>Remove this day from period</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={onLogEvent} activeOpacity={0.7}>
                <Text style={styles.optionEmoji}>📝</Text>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>{hasEvents ? 'Edit Events' : 'Log Event'}</Text>
                  <Text style={styles.optionHint}>Mood, intimacy, energy & more</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={onDismiss}>
            <Text style={styles.cancelText}>Cancel</Text>
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
  destructive: {
    color: '#DC2626',
  },
  optionHint: {
    fontSize: 13,
    color: CrimsonColors.glass.textSecondary,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    color: CrimsonColors.glass.textSecondary,
    fontFamily: Fonts.regular,
  },
});
