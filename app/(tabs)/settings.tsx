import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useApp } from '@/src/context/AppContext';
import { usePurchases } from '@/src/context/PurchasesContext';
import { CrimsonColors, Fonts } from '@/constants/theme';
import { getIconComponent } from '@/src/constants/partnerIcons';

export default function SettingsScreen() {
  const router = useRouter();
  const { partners, appLockEnabled, setAppLock, multiProfileEnabled, setMultiProfile, deletePartner, setOnboardingComplete } = useApp();
  const { isPro, presentPaywall, presentCustomerCenter, restorePurchases } = usePurchases();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRestorePurchases = async () => {
    const info = await restorePurchases();
    if (info?.entitlements.active['Crimson Pro']) {
      Alert.alert('Restored', 'Crimson Pro has been restored successfully.');
    } else {
      Alert.alert('Nothing to restore', 'No active subscription found for this Apple ID.');
    }
  };

  const handleTitleTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      Alert.alert('Restart Onboarding?', 'This will show the onboarding flow again.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restart', onPress: () => setOnboardingComplete(false) },
      ]);
      return;
    }
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 800);
  };

  const handleLockToggle = async (value: boolean) => {
    if (value) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) {
        Alert.alert(
          'Not Available',
          'Your device does not have biometric authentication set up. Please enable Face ID, Touch ID, or a device passcode in your phone settings.',
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm to enable App Lock',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });
      if (result.success) {
        setAppLock(true);
      }
    } else {
      setAppLock(false);
    }
  };

  const handleDeletePartner = (id: string, name: string) => {
    Alert.alert(
      'Delete profile',
      `Remove "${name}" and all their period data?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePartner(id),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity activeOpacity={1} onPress={handleTitleTap}>
        <Text style={styles.title}>Settings</Text>
      </TouchableOpacity>

      {/* Security */}
      <Text style={styles.sectionLabel}>Security</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>App Lock</Text>
            <Text style={styles.rowSubtitle}>
              Use Face ID, Touch ID, or passcode to open the app
            </Text>
          </View>
          <Switch
            value={appLockEnabled}
            onValueChange={handleLockToggle}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: CrimsonColors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Multiple Profiles */}
      <Text style={styles.sectionLabel}>Profiles</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>Multiple Profiles</Text>
            <Text style={styles.rowSubtitle}>Track multiple people</Text>
          </View>
          <Switch
            value={multiProfileEnabled}
            onValueChange={setMultiProfile}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: CrimsonColors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {multiProfileEnabled && (
        <View style={[styles.section, { marginTop: 12 }]}>
          {partners.length === 0 ? (
            <View style={styles.row}>
              <Text style={styles.dimText}>No profiles added</Text>
            </View>
          ) : (
            partners.map((p, i) => (
              <View
                key={p.id}
                style={[
                  styles.partnerRow,
                  i < partners.length - 1 && styles.partnerRowBorder,
                ]}
              >
                <TouchableOpacity
                  style={styles.partnerInfo}
                  onPress={() => router.push(`/partner-form?id=${p.id}`)}
                >
                  {(() => {
                    const IconComp = p.icon ? getIconComponent(p.icon) : null;
                    if (IconComp) {
                      return <IconComp size={20} color={p.color} weight="fill" />;
                    }
                    if (p.icon) {
                      return <Text style={styles.partnerIcon}>{p.icon}</Text>;
                    }
                    return <View style={[styles.partnerDot, { backgroundColor: p.color }]} />;
                  })()}
                  <Text style={styles.partnerName}>{p.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePartner(p.id, p.name)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <TouchableOpacity
            style={[styles.addPartnerBtn, partners.length > 0 && styles.addPartnerBtnBorder]}
            onPress={() => router.push('/partner-form')}
          >
            <Text style={styles.addPartnerText}>+ Add Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Subscription */}
      <Text style={styles.sectionLabel}>Subscription</Text>
      <View style={styles.section}>
        {isPro ? (
          <View style={styles.row}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Crimson Pro</Text>
              <Text style={styles.rowSubtitle}>Your subscription is active</Text>
            </View>
            <View style={[styles.proBadge]}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.row, styles.legalRowBorder]}
            onPress={presentPaywall}
            activeOpacity={0.7}
          >
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Upgrade to Crimson Pro</Text>
              <Text style={styles.rowSubtitle}>Unlock full cycle predictions</Text>
            </View>
            <Text style={styles.legalChevron}>›</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.row, isPro && styles.legalRowBorder]}
          onPress={presentCustomerCenter}
          activeOpacity={0.7}
        >
          <Text style={styles.rowTitle}>Manage Subscription</Text>
          <Text style={styles.legalChevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={handleRestorePurchases}
          activeOpacity={0.7}
        >
          <Text style={styles.rowTitle}>Restore Purchases</Text>
          <Text style={styles.legalChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Legal */}
      <Text style={styles.sectionLabel}>Legal</Text>
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.row, styles.legalRowBorder]}
          onPress={() => Linking.openURL('https://goodcompany.com/crimson-privacy')}
        >
          <Text style={styles.rowTitle}>Privacy Policy</Text>
          <Text style={styles.legalChevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('https://goodcompany.com/crimson-terms')}
        >
          <Text style={styles.rowTitle}>Terms of Service</Text>
          <Text style={styles.legalChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 76,
    paddingHorizontal: 20,
    backgroundColor: '#0A0A0A',
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    marginBottom: 20,
    color: '#F5F5F7',
    fontFamily: Fonts.regular,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 24,
    paddingHorizontal: 4,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: Fonts.semiBold,
  },
  section: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowTextWrap: { flex: 1, marginRight: 12 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#F5F5F7', fontFamily: Fonts.semiBold },
  rowSubtitle: { fontSize: 13, marginTop: 2, color: 'rgba(255,255,255,0.5)', fontFamily: Fonts.regular },
  dimText: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: Fonts.semiBold },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  partnerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  partnerDot: { width: 10, height: 10, borderRadius: 5 },
  partnerIcon: { fontSize: 18 },
  partnerName: { fontSize: 16, fontWeight: '500', color: '#F5F5F7', fontFamily: Fonts.medium },
  deleteText: { color: '#DC2626', fontSize: 14, fontWeight: '600', fontFamily: Fonts.semiBold },
  addPartnerBtn: {
    padding: 14,
    alignItems: 'center',
  },
  addPartnerBtnBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  addPartnerText: { fontSize: 15, fontWeight: '600', color: CrimsonColors.primary, fontFamily: Fonts.semiBold },
  legalRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  legalChevron: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: Fonts.regular,
  },
  bottomSpacer: { height: 40 },
  proBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: CrimsonColors.primary,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    fontFamily: Fonts.bold,
    letterSpacing: 0.6,
  },
});
