import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/src/context/AppContext';
import { CrimsonColors } from '@/constants/theme';
import { PARTNER_ICONS, getIconComponent } from '@/src/constants/partnerIcons';

const PRESET_COLORS = ['#F5D69D', '#ED2F17', '#9D0615', '#702887', '#005AFF', '#00AEBF'];
const DEFAULT_ICON_COLOR = '#AAAAAA';

type DisplayChoice = 'color' | 'icon';

export default function PartnerFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { partners, addPartner, updatePartner } = useApp();

  const existing = params.id ? partners.find((p) => p.id === params.id) : null;
  const existingUsesIcon = existing?.icon ? !!getIconComponent(existing.icon) : false;

  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? PRESET_COLORS[0]);
  const [iconKey, setIconKey] = useState(
    existingUsesIcon ? existing!.icon! : PARTNER_ICONS[0].key,
  );
  const [iconColor, setIconColor] = useState(
    existingUsesIcon ? existing!.color : DEFAULT_ICON_COLOR,
  );
  const [displayChoice, setDisplayChoice] = useState<DisplayChoice>(
    existingUsesIcon ? 'icon' : 'color',
  );

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const partnerData = {
      name: trimmed,
      color: displayChoice === 'color' ? color : iconColor,
      icon: displayChoice === 'icon' ? iconKey : undefined,
    };

    if (existing) {
      updatePartner({ ...existing, ...partnerData });
    } else {
      addPartner(partnerData);
    }
    router.back();
  };

  const iconColorIsDefault = iconColor === DEFAULT_ICON_COLOR;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>
          {existing ? 'Edit Profile' : 'Add Profile'}
        </Text>

        <Text style={styles.label}>Name</Text>
        <Text style={styles.hint}>Private — never shown on the calendar</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="rgba(255,255,255,0.3)"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Calendar display</Text>
        <Text style={styles.hint}>
          Choose a color or an icon — this is how they appear on the calendar
        </Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, displayChoice === 'color' && styles.tabActive]}
            onPress={() => setDisplayChoice('color')}
          >
            <Text style={[styles.tabText, displayChoice === 'color' && styles.tabTextActive]}>
              Color
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, displayChoice === 'icon' && styles.tabActive]}
            onPress={() => setDisplayChoice('icon')}
          >
            <Text style={[styles.tabText, displayChoice === 'icon' && styles.tabTextActive]}>
              Icon
            </Text>
          </TouchableOpacity>
        </View>

        {displayChoice === 'color' ? (
          <View style={styles.colorRow}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorBtn,
                  { backgroundColor: c },
                  color === c && styles.colorBtnActive,
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        ) : (
          <>
            <View style={styles.iconGrid}>
              {PARTNER_ICONS.map((entry) => {
                const Icon = entry.component;
                const isSelected = iconKey === entry.key;
                return (
                  <TouchableOpacity
                    key={entry.key}
                    style={[
                      styles.iconBtn,
                      isSelected && styles.iconBtnActive,
                    ]}
                    onPress={() => setIconKey(entry.key)}
                  >
                    <Icon
                      size={24}
                      color={isSelected ? iconColor : 'rgba(255,255,255,0.3)'}
                      weight={isSelected ? 'fill' : 'regular'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>Icon color (optional)</Text>
            <View style={styles.tintRow}>
              <TouchableOpacity
                style={[
                  styles.tintBtn,
                  { backgroundColor: DEFAULT_ICON_COLOR },
                  iconColorIsDefault && styles.tintBtnActive,
                ]}
                onPress={() => setIconColor(DEFAULT_ICON_COLOR)}
              />
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.tintBtn,
                    { backgroundColor: c },
                    iconColor === c && styles.tintBtnActive,
                  ]}
                  onPress={() => setIconColor(c)}
                />
              ))}
            </View>
          </>
        )}

        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Preview:</Text>
          {displayChoice === 'color' ? (
            <View style={[styles.previewDot, { backgroundColor: color }]} />
          ) : (
            (() => {
              const PreviewIcon = getIconComponent(iconKey);
              return PreviewIcon ? (
                <PreviewIcon size={28} color={iconColor} weight="fill" />
              ) : null;
            })()
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: CrimsonColors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#0A0A0A',
  },
  closeBtn: {
    position: 'absolute',
    top: 58,
    right: 24,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 22, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  form: { gap: 16, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: '800', marginBottom: 8, color: '#F5F5F7' },
  label: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  hint: { fontSize: 12, marginTop: -8, color: 'rgba(255,255,255,0.35)' },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#F5F5F7',
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  tabTextActive: { color: '#F5F5F7' },
  colorRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  colorBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  colorBtnActive: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    borderColor: CrimsonColors.primary,
  },
  tintRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  tintBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tintBtnActive: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  previewLabel: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  previewDot: { width: 24, height: 24, borderRadius: 12 },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
