import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ARTICLES, Block, ArticleSection } from '@/src/data/articles';
import { Fonts } from '@/constants/theme';

const BANNER_HEIGHT = 260;
const CONTENT_OVERLAP = 28;

function renderBlock(block: Block, index: number) {
  if (block.type === 'para') {
    return (
      <Text key={index} style={styles.para}>
        {block.text}
      </Text>
    );
  }
  if (block.type === 'list') {
    return (
      <View key={index} style={styles.list}>
        {block.items.map((item, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }
  return null;
}

function renderSection(section: ArticleSection, index: number) {
  const titleStyle = [
    styles.sectionTitle,
    section.titleType === 'do' && styles.doTitle,
    section.titleType === 'dont' && styles.dontTitle,
  ];

  return (
    <View key={index} style={styles.section}>
      {section.title ? (
        <Text style={titleStyle}>{section.title}</Text>
      ) : null}
      {section.blocks.map((block, bi) => renderBlock(block, bi))}
    </View>
  );
}

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Hero banner */}
      <View style={styles.bannerWrap}>
        <Image
          source={article.image}
          style={styles.banner}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay} />
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Knowledge</Text>
        </TouchableOpacity>
      </View>

      {/* Content card slides over the banner */}
      <View style={styles.contentCard}>
        <View style={[styles.accentLine, { backgroundColor: article.color }]} />
        <Text style={styles.title}>{article.title}</Text>

        <View style={styles.tldrCard}>
          <Text style={styles.tldrText}>{article.tldr}</Text>
        </View>

        {article.sections.map((section, si) => renderSection(section, si))}

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  bannerWrap: {
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: BANNER_HEIGHT,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  backText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Fonts.regular,
  },
  contentCard: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -CONTENT_OVERLAP,
    paddingTop: 28,
    paddingHorizontal: 20,
    flex: 1,
  },
  accentLine: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '400',
    color: '#F5F5F7',
    fontFamily: Fonts.regular,
    lineHeight: 34,
    marginBottom: 24,
  },
  tldrCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 32,
  },
  tldrText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Fonts.regular,
    lineHeight: 25,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F5F5F7',
    fontFamily: Fonts.semiBold,
    marginBottom: 10,
  },
  doTitle: {
    color: '#5DB075',
  },
  dontTitle: {
    color: '#E85A5F',
  },
  para: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Fonts.regular,
    lineHeight: 26,
    marginBottom: 8,
  },
  list: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 16,
    lineHeight: 26,
    width: 12,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Fonts.regular,
    lineHeight: 26,
  },
  bottomSpacer: {
    height: 40,
  },
});
