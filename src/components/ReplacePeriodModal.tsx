import React from 'react';
import {
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { CrimsonColors } from '@/constants/theme';
import { parseDate } from '@/src/utils/date';

type Props = {
  date: string;
  onReplace: () => void;
  onDismiss: () => void;
};

export function ReplacePeriodModal({ date, onReplace, onDismiss }: Props) {
  const formatted = parseDate(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Replace period?</Text>
          <Text style={styles.subtitle}>
            You already logged a period this cycle. Starting a new one on {formatted} will replace it.
          </Text>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: CrimsonColors.period }]}
            onPress={onReplace}
          >
            <Text style={styles.confirmText}>Replace</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onDismiss}>
            <Text style={styles.cancelText}>Go back</Text>
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
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 15, color: 'rgba(255,255,255,0.5)' },
});
