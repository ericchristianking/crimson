import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/src/context/AppContext';
import { CrimsonColors } from '@/constants/theme';
import { PinSetModal } from '@/src/components/PinSetModal';
import { getIconComponent } from '@/src/constants/partnerIcons';

export default function SettingsScreen() {
  const router = useRouter();
  const { partners, pinEnabled, setPin, clearPin, deletePartner } = useApp();
  const [showPinModal, setShowPinModal] = useState(false);

  const handlePinToggle = (value: boolean) => {
    if (value) {
      setShowPinModal(true);
    } else {
      clearPin();
    }
  };

  const handleDeletePartner = (id: string, name: string) => {
    Alert.alert(
      'Delete partner',
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
      <Text style={styles.title}>Settings</Text>

      {/* Security */}
      <Text style={styles.sectionLabel}>Security</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle}>App Lock</Text>
            <Text style={styles.rowSubtitle}>
              Require a 4-digit PIN to open the app
            </Text>
          </View>
          <Switch
            value={pinEnabled}
            onValueChange={handlePinToggle}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: CrimsonColors.primary }}
            thumbColor="#fff"
          />
        </View>
        {pinEnabled && (
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={() => setShowPinModal(true)}
          >
            <Text style={styles.changeBtnText}>Change PIN</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Partners */}
      <Text style={styles.sectionLabel}>Partners</Text>
      <View style={styles.section}>
        {partners.length === 0 ? (
          <View style={styles.row}>
            <Text style={styles.dimText}>No partners added</Text>
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
          <Text style={styles.addPartnerText}>+ Add Partner</Text>
        </TouchableOpacity>
      </View>

      {showPinModal && (
        <PinSetModal
          onSave={(pin) => {
            setPin(pin);
            setShowPinModal(false);
          }}
          onDismiss={() => setShowPinModal(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#0A0A0A',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    color: '#F5F5F7',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 24,
    paddingHorizontal: 4,
    color: 'rgba(255,255,255,0.4)',
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#F5F5F7' },
  rowSubtitle: { fontSize: 13, marginTop: 2, color: 'rgba(255,255,255,0.5)' },
  dimText: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  changeBtn: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    alignItems: 'center',
  },
  changeBtnText: { fontSize: 15, fontWeight: '600', color: CrimsonColors.primary },
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
  partnerName: { fontSize: 16, fontWeight: '500', color: '#F5F5F7' },
  deleteText: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
  addPartnerBtn: {
    padding: 14,
    alignItems: 'center',
  },
  addPartnerBtnBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  addPartnerText: { fontSize: 15, fontWeight: '600', color: CrimsonColors.primary },
});
