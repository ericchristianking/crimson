import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
  Vibration,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CrimsonColors, Fonts } from '@/constants/theme';

const PIN_LENGTH = 4;

type Props = {
  onSave: (pin: string, email: string) => void;
  onDismiss: () => void;
};

type Step = 'email' | 'enter' | 'confirm';

export function PinSetModal({ onSave, onDismiss }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [firstPin, setFirstPin] = useState('');
  const [entered, setEntered] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleEmailNext = () => {
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError(null);
    setStep('enter');
  };

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
          onSave(next, email.trim().toLowerCase());
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.backdrop} onPress={onDismiss}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>

            {step === 'email' ? (
              <>
                <Text style={styles.title}>Set PIN</Text>
                <Text style={styles.subtitle}>
                  Enter your email to enable PIN recovery
                </Text>
                <TextInput
                  style={[styles.emailInput, emailError ? styles.emailInputError : null]}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setEmailError(null);
                  }}
                  onSubmitEditing={handleEmailNext}
                  returnKeyType="next"
                />
                {emailError && <Text style={styles.errorText}>{emailError}</Text>}
                <TouchableOpacity style={styles.nextBtn} onPress={handleEmailNext}>
                  <Text style={styles.nextBtnText}>Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={onDismiss}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>
                  {step === 'enter' ? 'Set PIN' : 'Confirm PIN'}
                </Text>
                <Text style={styles.subtitle}>
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
                        i < entered.length && styles.dotFilled,
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

                <TouchableOpacity style={styles.cancelBtn} onPress={onDismiss}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#F5F5F7',
    fontFamily: Fonts.semiBold,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontFamily: Fonts.regular,
  },
  emailInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#F5F5F7',
    fontFamily: Fonts.regular,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emailInputError: {
    borderColor: '#DC2626',
  },
  nextBtn: {
    width: '100%',
    backgroundColor: CrimsonColors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  nextBtnText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontWeight: '600',
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
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 4,
    fontFamily: Fonts.regular,
    textAlign: 'center',
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
    color: '#F5F5F7',
    fontFamily: Fonts.medium,
  },
  keyTextDel: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.5)',
  },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  cancelText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: Fonts.regular,
  },
});
