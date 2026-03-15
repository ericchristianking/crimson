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
import { parseDate } from '@/src/utils/date';
import type { AddPeriodResult } from '@/src/context/AppContext';

const MIN_DAYS = 1;
const MAX_DAYS = 10;
const DEFAULT_DAYS = 5;

type Props = {
  date: string;
  onConfirm: (date: string, days: number) => AddPeriodResult;
  onForceReplace: (date: string, days: number, replaceLogId: string) => void;
  onDismiss: () => void;
};

export function LogPeriodModal({ date, onConfirm, onForceReplace, onDismiss }: Props) {
  const isDark = (useColorScheme() ?? 'light') === 'dark';
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [error, setError] = useState<string | null>(null);
  const [replacePrompt, setReplacePrompt] = useState<{ logId: string } | null>(null);

  const formatted = parseDate(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const bg = isDark ? CrimsonColors.dark.surfaceElevated : Colors.light.background;
  const text = isDark ? Colors.dark.text : Colors.light.text;
  const secondary = isDark ? CrimsonColors.dark.textSecondary : CrimsonColors.light.textSecondary;
  const border = isDark ? CrimsonColors.dark.border : CrimsonColors.light.border;

  const decrement = () => setDays((d) => Math.max(MIN_DAYS, d - 1));
  const increment = () => setDays((d) => Math.min(MAX_DAYS, d + 1));

  const handleConfirm = () => {
    setError(null);
    setReplacePrompt(null);
    const result = onConfirm(date, days);
    if (result.ok) {
      onDismiss();
    } else if (result.reason === 'tooClose' && 'existingLogId' in result) {
      setReplacePrompt({ logId: result.existingLogId });
    } else {
      setError(result.reason ?? 'Could not add period.');
    }
  };

  const handleReplace = () => {
    if (replacePrompt) {
      onForceReplace(date, days, replacePrompt.logId);
      onDismiss();
    }
  };

  if (replacePrompt) {
    return (
      <Modal transparent animationType="fade" onRequestClose={onDismiss}>
        <Pressable style={styles.backdrop} onPress={onDismiss}>
          <Pressable
            style={[styles.card, { backgroundColor: bg, borderColor: border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.title, { color: text }]}>Replace period?</Text>
            <Text style={[styles.subtitle, { color: secondary }]}>
              You already logged a period this cycle. Adding this one will replace it.
            </Text>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: CrimsonColors.period }]}
              onPress={handleReplace}
            >
              <Text style={styles.confirmText}>Replace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setReplacePrompt(null)}
            >
              <Text style={[styles.cancelText, { color: secondary }]}>Go back</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          style={[styles.card, { backgroundColor: bg, borderColor: border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: text }]}>Log period</Text>
          <Text style={[styles.subtitle, { color: secondary }]}>
            Starting {formatted}
          </Text>

          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: border }]}
              onPress={decrement}
              disabled={days <= MIN_DAYS}
            >
              <Text style={[styles.stepperBtnText, { color: days <= MIN_DAYS ? secondary : text }]}>
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
              disabled={days >= MAX_DAYS}
            >
              <Text style={[styles.stepperBtnText, { color: days >= MAX_DAYS ? secondary : text }]}>
                +
              </Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: CrimsonColors.period }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>Add {days} day{days > 1 ? 's' : ''}</Text>
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
  error: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
  },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 15 },
});
