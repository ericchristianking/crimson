import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { CrimsonColors } from '@/constants/theme';
import { PeriodLog } from '@/src/types';
import { parseDate } from '@/src/utils/date';

const MIN_DAYS = 1;
const MAX_DAYS = 10;

type Props = {
  log: PeriodLog;
  onSave: (days: number) => void;
  onRemove: () => void;
  onLogEvent?: () => void;
  onDismiss: () => void;
};

export function RemovePeriodModal({ log, onSave, onRemove, onLogEvent, onDismiss }: Props) {
  const [days, setDays] = useState(log.periodLengthDays);

  const formatted = parseDate(log.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const decrement = () => setDays((d) => Math.max(MIN_DAYS, d - 1));
  const increment = () => setDays((d) => Math.min(MAX_DAYS, d + 1));

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Edit period</Text>
          <Text style={styles.subtitle}>Starting {formatted}</Text>

          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, days <= MIN_DAYS && styles.stepperBtnDisabled]}
              onPress={decrement}
              disabled={days <= MIN_DAYS}
            >
              <Text style={[styles.stepperBtnText, days <= MIN_DAYS && styles.textDim]}>−</Text>
            </TouchableOpacity>

            <View style={styles.stepperValue}>
              <Text style={styles.stepperValueText}>{days}</Text>
              <Text style={styles.stepperLabel}>days</Text>
            </View>

            <TouchableOpacity
              style={[styles.stepperBtn, days >= MAX_DAYS && styles.stepperBtnDisabled]}
              onPress={increment}
              disabled={days >= MAX_DAYS}
            >
              <Text style={[styles.stepperBtnText, days >= MAX_DAYS && styles.textDim]}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: CrimsonColors.period }]}
            onPress={() => onSave(days)}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>

          {onLogEvent && (
            <TouchableOpacity style={styles.logEventBtn} onPress={onLogEvent}>
              <Text style={styles.logEventText}>📝 Log Event</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteBtn} onPress={onRemove}>
            <Text style={styles.deleteBtnText}>Delete period</Text>
          </TouchableOpacity>

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
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(20,20,20,0.92)',
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4, color: '#F5F5F7' },
  subtitle: { fontSize: 14, marginBottom: 20, color: 'rgba(255,255,255,0.5)' },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: { opacity: 0.3 },
  stepperBtnText: { fontSize: 24, fontWeight: '600', color: '#F5F5F7' },
  textDim: { color: 'rgba(255,255,255,0.3)' },
  stepperValue: { alignItems: 'center', minWidth: 50 },
  stepperValueText: { fontSize: 32, fontWeight: '700', color: '#F5F5F7' },
  stepperLabel: { fontSize: 13, marginTop: 2, color: 'rgba(255,255,255,0.5)' },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logEventBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 4,
  },
  logEventText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 4,
  },
  deleteBtnText: { color: '#DC2626', fontSize: 15, fontWeight: '600' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 15, color: 'rgba(255,255,255,0.5)' },
});
