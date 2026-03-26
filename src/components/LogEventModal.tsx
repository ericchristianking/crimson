import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { Fonts, CrimsonColors } from '@/constants/theme';
import { parseDate } from '@/src/utils/date';
import { EVENT_CONFIG } from '@/src/constants/events';
import { CycleEvent, EventType, EventCategory } from '@/src/types';

type Props = {
  date: string;
  events: CycleEvent[];
  onToggle: (eventType: EventType, category: EventCategory) => void;
  onDismiss: () => void;
};

export function LogEventModal({ date, events, onToggle, onDismiss }: Props) {
  const formatted = parseDate(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });

  const activeTypes = useMemo(
    () => new Set(events.map((e) => e.eventType)),
    [events],
  );

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Log Event</Text>
          <Text style={styles.subtitle}>{formatted}</Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Section label="Mood" category="mood" activeTypes={activeTypes} onToggle={onToggle} />
            <Section label="Intimacy" category="intimacy" activeTypes={activeTypes} onToggle={onToggle} />
            <Section label="Energy" category="energy" activeTypes={activeTypes} onToggle={onToggle} />
            <Section label="Symptoms" category="symptom" activeTypes={activeTypes} onToggle={onToggle} />
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onDismiss} activeOpacity={0.7}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Section({
  label,
  category,
  activeTypes,
  onToggle,
}: {
  label: string;
  category: EventCategory;
  activeTypes: Set<EventType>;
  onToggle: (eventType: EventType, category: EventCategory) => void;
}) {
  const items = EVENT_CONFIG.filter((e) => e.category === category);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.grid}>
        {items.map((item) => {
          const isActive = activeTypes.has(item.type);
          return (
            <TouchableOpacity
              key={item.type}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onToggle(item.type, item.category)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipEmoji}>{item.emoji}</Text>
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
    maxWidth: 340,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: CrimsonColors.glass.border,
    backgroundColor: 'rgba(20,20,20,0.95)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
    fontFamily: Fonts.bold,
  },
  subtitle: {
    fontSize: 14,
    color: CrimsonColors.glass.textSecondary,
    fontFamily: Fonts.regular,
    marginTop: 2,
    marginBottom: 16,
  },
  scrollArea: {
    flexGrow: 0,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: CrimsonColors.glass.textTertiary,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: CrimsonColors.glass.surfaceElevated,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  chipEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 13,
    color: CrimsonColors.glass.textSecondary,
    fontFamily: Fonts.medium,
  },
  chipLabelActive: {
    color: '#F5F5F7',
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: CrimsonColors.glass.surfaceElevated,
    marginTop: 8,
  },
  doneText: {
    color: '#F5F5F7',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
  },
});
