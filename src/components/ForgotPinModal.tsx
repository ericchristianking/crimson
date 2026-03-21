import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { CrimsonColors, Fonts } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';
import { PinSetModal } from '@/src/components/PinSetModal';

type Step = 'send' | 'verify' | 'reset';

type Props = {
  email: string;
  onReset: (newPin: string, email: string) => void;
  onDismiss: () => void;
};

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

export function ForgotPinModal({ email, onReset, onDismiss }: Props) {
  const [step, setStep] = useState<Step>('send');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetPin, setShowResetPin] = useState(false);

  const handleSendCode = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (otpError) throw otpError;
      setStep('verify');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send code. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'email',
      });
      if (verifyError) throw verifyError;
      setStep('reset');
      setShowResetPin(true);
    } catch {
      setError('Incorrect or expired code. Please try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  if (showResetPin) {
    return (
      <PinSetModal
        onSave={(newPin, newEmail) => {
          onReset(newPin, newEmail);
        }}
        onDismiss={onDismiss}
      />
    );
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Forgot PIN</Text>

          {step === 'send' && (
            <>
              <Text style={styles.subtitle}>
                We'll send a verification code to
              </Text>
              <Text style={styles.emailDisplay}>{maskEmail(email)}</Text>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
                onPress={handleSendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>Send Code</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 'verify' && (
            <>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to{'\n'}
                <Text style={styles.emailDisplay}>{maskEmail(email)}</Text>
              </Text>

              <TextInput
                style={[styles.codeInput, error ? styles.codeInputError : null]}
                placeholder="000000"
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={(t) => {
                  setCode(t);
                  setError(null);
                }}
                onSubmitEditing={handleVerifyCode}
                returnKeyType="done"
                textAlign="center"
                autoFocus
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>Verify</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={() => {
                  setStep('send');
                  setCode('');
                  setError(null);
                }}
              >
                <Text style={styles.resendText}>Resend code</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    backgroundColor: 'rgba(20,20,20,0.95)',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#F5F5F7',
    fontFamily: Fonts.semiBold,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  emailDisplay: {
    fontSize: 15,
    color: '#F5F5F7',
    fontFamily: Fonts.medium,
    marginVertical: 8,
    textAlign: 'center',
  },
  codeInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 14,
    fontSize: 28,
    color: '#F5F5F7',
    fontFamily: Fonts.regular,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    letterSpacing: 8,
  },
  codeInputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 4,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  actionBtn: {
    width: '100%',
    backgroundColor: CrimsonColors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontWeight: '600',
  },
  resendBtn: {
    marginTop: 12,
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    color: CrimsonColors.primary,
    fontFamily: Fonts.regular,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: Fonts.regular,
  },
});
