import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, CrimsonColors } from '@/constants/theme';

const PIN_LENGTH = 4;

type Props = {
  onSave: (pin: string) => void;
  onDismiss: () => void;
};

type Step = 'enter' | 'confirm';

export function PinSetModal({ onSave, onDismiss }: Props) {
  const isDark = (useColorScheme() ?? 'light') === 'dark';
  const [step, setStep] = useState<Step>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [entered, setEntered] = useState('');
  const [error, setError] = useState<string | null>(null);

  const bg = isDark ? CrimsonColors.dark.surfaceElevated : Colors.light.background;
  const text = isDark ? Colors.dark.text : Colors.light.text;
  const secondary = isDark ? CrimsonColors.dark.textSecondary : CrimsonColors.light.textSecondary;
  const border = isDark ? CrimsonColors.dark.border : CrimsonColors.light.border;

  const handleKey = (digit: string) => {
    setError(null);
    const next = entered + digit;
    if (next.length <= PIN_LENGTH) {
      setEntered(next);
    }
    if (next.length === PIN_LENGTH) {
      if (step === 'enter') {
        setFirstPin(next);
        setEntered('');
        setStep('confirm');
      } else {
        if (next === firstPin) {
          onSave(next);
        } else {
          Vibration.vibrate(200);
          setError('PINs do not match. Try again.');
          setEntered('');
          setStep('enter');
          setFirstPin('');
        }
      }
    }
  };

  const handleDelete = () => {
    setError(null);
    setEntered((prev) => prev.slice(0, -1));
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          style={[styles.card, { backgroundColor: bg, borderColor: border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: text }]}>
            {step === 'enter' ? 'Set PIN' : 'Confirm PIN'}
          </Text>
          <Text style={[styles.subtitle, { color: secondary }]}>
            {step === 'enter'
              ? 'Choose a 4-digit PIN'
              : 'Enter the same PIN again'}
          </Text>

          <View style={styles.dotsRow}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { borderColor: CrimsonColors.primary },
                  i < entered.length && {
                    backgroundColor: CrimsonColors.primary,
                  },
                ]}
              />
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(
              (key) => {
                if (key === '') {
                  return <View key="empty" style={styles.key} />;
                }
                if (key === 'del') {
                  return (
                    <TouchableOpacity
                      key="del"
                      style={styles.key}
                      onPress={handleDelete}
                    >
                      <Text style={[styles.keyTextDel, { color: secondary }]}>⌫</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.key}
                    onPress={() => handleKey(key)}
                  >
                    <Text style={[styles.keyText, { color: text }]}>{key}</Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

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
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 4,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    marginTop: 16,
  },
  key: {
    width: 80,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 26,
    fontWeight: '500',
  },
  keyTextDel: {
    fontSize: 22,
  },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  cancelText: { fontSize: 15 },
});
