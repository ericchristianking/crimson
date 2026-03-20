import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { CrimsonColors } from '@/constants/theme';
import { CRIMSON_LOGO } from '@/src/constants/backgrounds';

const PIN_LENGTH = 4;

type Props = {
  correctPin: string;
  onUnlock: () => void;
};

export function PinLockScreen({ correctPin, onUnlock }: Props) {
  const [entered, setEntered] = useState('');
  const [error, setError] = useState(false);

  const handleKey = useCallback(
    (digit: string) => {
      setError(false);
      const next = entered + digit;
      if (next.length === PIN_LENGTH) {
        if (next === correctPin) {
          onUnlock();
        } else {
          Vibration.vibrate(200);
          setError(true);
          setTimeout(() => {
            setEntered('');
            setError(false);
          }, 600);
        }
      } else {
        setEntered(next);
      }
    },
    [entered, correctPin, onUnlock],
  );

  const handleDelete = useCallback(() => {
    setError(false);
    setEntered((prev) => prev.slice(0, -1));
  }, []);

  return (
    <View style={styles.container}>
      <Image source={CRIMSON_LOGO} style={styles.logo} resizeMode="contain" />
      <Text style={styles.subtitle}>Enter PIN</Text>

      <View style={styles.dotsRow}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < entered.length && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>

      {error && <Text style={styles.errorText}>Incorrect PIN</Text>}

      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(
          (key) => {
            if (key === '') {
              return <View key="empty" style={styles.key} />;
            }
            if (key === 'del') {
              return (
                <TouchableOpacity key="del" style={styles.key} onPress={handleDelete}>
                  <Text style={styles.keyTextDel}>⌫</Text>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity key={key} style={styles.key} onPress={() => handleKey(key)}>
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            );
          },
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 160,
    height: 44,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 32,
  },
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
    borderColor: CrimsonColors.primary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: CrimsonColors.primary,
  },
  dotError: {
    borderColor: '#DC2626',
    backgroundColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 270,
    marginTop: 24,
  },
  key: {
    width: 90,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#F5F5F7',
  },
  keyTextDel: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
  },
});
