import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Partner } from '@/src/types';
import { getIconComponent } from '@/src/constants/partnerIcons';

type Props = {
  partners: Partner[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

export function PartnerSwitcher({ partners, activeId, onSelect, onAdd }: Props) {
  if (partners.length === 0) return null;

  return (
    <View style={styles.row}>
      {partners.map((p) => {
        const isActive = activeId === p.id;
        const IconComp = p.icon ? getIconComponent(p.icon) : null;

        return (
          <TouchableOpacity
            key={p.id}
            style={[styles.pill, !isActive && styles.pillInactive]}
            onPress={() => onSelect(p.id)}
          >
            {IconComp ? (
              <IconComp
                size={isActive ? 28 : 22}
                color={p.color}
                weight="fill"
              />
            ) : p.icon ? (
              <Text style={isActive ? styles.emojiActive : styles.emoji}>
                {p.icon}
              </Text>
            ) : (
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: p.color },
                  isActive && styles.colorDotActive,
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 10,
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 20,
  },
  pillInactive: {
    opacity: 0.3,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  colorDotActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  emoji: {
    fontSize: 22,
  },
  emojiActive: {
    fontSize: 28,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addText: { fontSize: 18, fontWeight: '600', marginTop: -1, color: 'rgba(255,255,255,0.5)' },
});
