import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, CrimsonColors } from '@/constants/theme';

const MIN_PMS = 2;
const MAX_PMS = 14;
const DEFAULT_PMS = 7;

type Props = {
  currentDays: number;
  onSave: (days: number) => void;
  onDismiss: () => void;
};

export function PmsAdjustModal({ currentDays, onSave, onDismiss }: Props) {
  const isDark = (useColorScheme() ?? 'light') === 'dark';
  const [days, setDays] = useState(currentDays || DEFAULT_PMS);

  const bg = isDark ? CrimsonColors.dark.surfaceElevated : Colors.light.background;
  const text = isDark ? Colors.dark.text : Colors.light.text;
  const secondary = isDark ? CrimsonColors.dark.textSecondary : CrimsonColors.light.textSecondary;
  const border = isDark ? CrimsonColors.dark.border : CrimsonColors.light.border;

  const decrement = () => setDays((d) => Math.max(MIN_PMS, d - 1));
  const increment = () => setDays((d) => Math.min(MAX_PMS, d + 1));

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          style={[styles.card, { backgroundColor: bg, borderColor: border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: text }]}>PMS duration</Text>
          <Text style={[styles.subtitle, { color: secondary }]}>
            How many days before her period does PMS typically start?
          </Text>

          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: border }]}
              onPress={decrement}
              disabled={days <= MIN_PMS}
            >
              <Text style={[styles.stepperBtnText, { color: days <= MIN_PMS ? secondary : text }]}>
                −
              </Text>
            </TouchableOpacity>

            <View style={styles.stepperValue}>
              <Text style={[styles.stepperValueText, { color: text }]}>{days}</Text>
              <Text style={[styles.stepperLabel, { color: secondary }]}>days</Text>
            </View>

            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: border }]}
              onPress={increment}
              disabled={days >= MAX_PMS}
            >
              <Text style={[styles.stepperBtnText, { color: days >= MAX_PMS ? secondary : text }]}>
                +
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: CrimsonColors.pms }]}
            onPress={() => onSave(days)}
          >
            <Text style={styles.confirmText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onDismiss}>
            <Text style={[styles.cancelText, { color: secondary }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 24, fontWeight: '600' },
  stepperValue: { alignItems: 'center', minWidth: 50 },
  stepperValueText: { fontSize: 32, fontWeight: '700' },
  stepperLabel: { fontSize: 13, marginTop: 2 },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmText: { color: '#3A3A3C', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 15 },
});
