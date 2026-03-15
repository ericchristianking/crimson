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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/src/context/AppContext';
import { Colors, CrimsonColors } from '@/constants/theme';
import { PinSetModal } from '@/src/components/PinSetModal';
import { getIconComponent } from '@/src/constants/partnerIcons';

export default function SettingsScreen() {
  const isDark = (useColorScheme() ?? 'light') === 'dark';
  const bgColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const dimColor = isDark ? '#9BA1A6' : '#6b6f76';
  const cardBg = isDark ? CrimsonColors.dark.surface : CrimsonColors.light.surface;
  const borderColor = isDark ? CrimsonColors.dark.border : CrimsonColors.light.border;

  const router = useRouter();
  const { partners, pinEnabled, setPin, clearPin, deletePartner, themeMode, setThemeMode } = useApp();
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
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Settings</Text>

      {/* Theme */}
      <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={[styles.rowTitle, { color: textColor }]}>Dark Mode</Text>
          </View>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
            trackColor={{ false: '#ccc', true: CrimsonColors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* App Lock */}
      <Text style={[styles.sectionLabel, { color: dimColor }]}>Security</Text>
      <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={[styles.rowTitle, { color: textColor }]}>App Lock</Text>
            <Text style={[styles.rowSubtitle, { color: dimColor }]}>
              Require a 4-digit PIN to open the app
            </Text>
          </View>
          <Switch
            value={pinEnabled}
            onValueChange={handlePinToggle}
            trackColor={{ false: '#ccc', true: CrimsonColors.primary }}
            thumbColor="#fff"
          />
        </View>
        {pinEnabled && (
          <TouchableOpacity
            style={[styles.changeBtn, { borderTopColor: borderColor }]}
            onPress={() => setShowPinModal(true)}
          >
            <Text style={[styles.changeBtnText, { color: CrimsonColors.primary }]}>
              Change PIN
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Partners */}
      <Text style={[styles.sectionLabel, { color: dimColor }]}>Partners</Text>
      <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
        {partners.length === 0 ? (
          <View style={styles.row}>
            <Text style={[styles.rowTitle, { color: dimColor }]}>No partners added</Text>
          </View>
        ) : (
          partners.map((p, i) => (
            <View
              key={p.id}
              style={[
                styles.partnerRow,
                i < partners.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
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
                <Text style={[styles.partnerName, { color: textColor }]}>{p.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeletePartner(p.id, p.name)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <TouchableOpacity
          style={[styles.addPartnerBtn, partners.length > 0 && { borderTopWidth: 1, borderTopColor: borderColor }]}
          onPress={() => router.push('/partner-form')}
        >
          <Text style={[styles.addPartnerText, { color: CrimsonColors.primary }]}>
            + Add Partner
          </Text>
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
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 24,
    paddingHorizontal: 4,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowTextWrap: { flex: 1, marginRight: 12 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSubtitle: { fontSize: 13, marginTop: 2 },
  changeBtn: {
    borderTopWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  changeBtnText: { fontSize: 15, fontWeight: '600' },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  partnerDot: { width: 10, height: 10, borderRadius: 5 },
  partnerIcon: { fontSize: 18 },
  partnerName: { fontSize: 16, fontWeight: '500' },
  deleteText: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
  addPartnerBtn: {
    padding: 14,
    alignItems: 'center',
  },
  addPartnerText: { fontSize: 15, fontWeight: '600' },
});
