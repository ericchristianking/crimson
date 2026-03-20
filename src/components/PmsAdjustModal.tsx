import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { CrimsonColors } from '@/constants/theme';

const MIN_PMS = 2;
const MAX_PMS = 14;
const DEFAULT_PMS = 7;

type Props = {
  currentDays: number;
  onSave: (days: number) => void;
  onDismiss: () => void;
};

export function PmsAdjustModal({ currentDays, onSave, onDismiss }: Props) {
  const [days, setDays] = useState(currentDays || DEFAULT_PMS);

  const decrement = () => setDays((d) => Math.max(MIN_PMS, d - 1));
  const increment = () => setDays((d) => Math.min(MAX_PMS, d + 1));

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>PMS duration</Text>
          <Text style={styles.subtitle}>
            How many days before her period does PMS typically start?
          </Text>

          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, days <= MIN_PMS && styles.stepperBtnDisabled]}
              onPress={decrement}
              disabled={days <= MIN_PMS}
            >
              <Text style={[styles.stepperBtnText, days <= MIN_PMS && styles.textDim]}>−</Text>
            </TouchableOpacity>

            <View style={styles.stepperValue}>
              <Text style={styles.stepperValueText}>{days}</Text>
              <Text style={styles.stepperLabel}>days</Text>
            </View>

            <TouchableOpacity
              style={[styles.stepperBtn, days >= MAX_PMS && styles.stepperBtnDisabled]}
              onPress={increment}
              disabled={days >= MAX_PMS}
            >
              <Text style={[styles.stepperBtnText, days >= MAX_PMS && styles.textDim]}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: CrimsonColors.pms }]}
            onPress={() => onSave(days)}
          >
            <Text style={styles.confirmText}>Done</Text>
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
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmText: { color: '#1A1A1A', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 15, color: 'rgba(255,255,255,0.5)' },
});
