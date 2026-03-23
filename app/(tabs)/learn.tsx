import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { ARTICLES } from '@/src/data/articles';
import { Fonts } from '@/constants/theme';

export default function LearnScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Knowledge</Text>
      <Text style={styles.subtitle}>
        Everything you never learned but probably should know.
      </Text>

      <View style={styles.list}>
        {ARTICLES.map((article) => (
          <TouchableOpacity
            key={article.slug}
            style={styles.card}
            onPress={() => router.push(`/article?slug=${article.slug}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, { backgroundColor: article.color }]} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{article.title}</Text>
              <Text style={styles.cardTldr} numberOfLines={2}>
                {article.tldr}
              </Text>
            </View>
            <CaretRight size={16} color="rgba(255,255,255,0.3)" weight="bold" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 76,
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    color: '#F5F5F7',
    fontFamily: Fonts.regular,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: Fonts.regular,
    marginBottom: 28,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    flexShrink: 0,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F5F5F7',
    fontFamily: Fonts.semiBold,
    lineHeight: 20,
  },
  cardTldr: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: Fonts.regular,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});
