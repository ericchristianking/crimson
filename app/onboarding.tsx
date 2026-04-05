import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useApp } from '@/src/context/AppContext';
import { usePurchases, PAYWALL_RESULT } from '@/src/context/PurchasesContext';
import { buildPredictedCalendar } from '@/src/services/cyclePrediction';
import { buildTodayInfo } from '@/src/utils/todayInfo';
import type { PhaseKey } from '@/src/utils/todayInfo';
import { toDateOnly, addDays } from '@/src/utils/date';
import { PHASE_BACKGROUNDS, CRIMSON_LOGO, CRIMSON_C } from '@/src/constants/backgrounds';
import { PARTNER_ICONS } from '@/src/constants/partnerIcons';
import { CrimsonColors, Fonts } from '@/constants/theme';
import {
  EyeSlashIcon,
  WifiSlashIcon,
  ShieldCheckIcon,
  LockSimpleIcon,
  CaretLeftIcon,
} from 'phosphor-react-native';

const PHASE_ACCENT: Record<PhaseKey, string> = {
  regular: 'rgba(255,255,255,0.85)',
  period: '#E40118',
  pms: '#CA903C',
  fertile: CrimsonColors.fertile,
  ovulation: CrimsonColors.ovulation,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PRESET_COLORS = ['#F5D69D', '#ED2F17', '#9D0615', '#702887', '#005AFF', '#00AEBF'];
type Step =
  | 'hook'
  | 'pain'
  | 'whatitis'
  | 'useCase'
  | 'security'
  | 'profile'
  | 'periodQuestion'
  | 'periodInput'
  | 'proxyQ1'
  | 'proxyQ2'
  | 'calculating'
  | 'whatYouGet'
  | 'proxyResult'
  | 'paywall';

export default function OnboardingScreen() {
  const { addPartner, logPeriodStart, setOnboardingComplete, setActivePartner, setMultiProfile } = useApp();

  const [step, setStep] = useState<Step>('hook');
  const [useCaseChoice, setUseCaseChoice] = useState<'single' | 'multiple' | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileIconKey, setProfileIconKey] = useState(PARTNER_ICONS[0].key);
  const [profileIconColor, setProfileIconColor] = useState(PRESET_COLORS[0]);
  const [createdPartnerId, setCreatedPartnerId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEstimated, setIsEstimated] = useState(false);
  const [proxyQ1Answer, setProxyQ1Answer] = useState<string | null>(null);
  const [proxyQ2Answer, setProxyQ2Answer] = useState<string | null>(null);

  const historyRef = useRef<Step[]>([]);

  const goTo = useCallback((next: Step) => {
    historyRef.current.push(step);
    setStep(next);
  }, [step]);

  const goBack = useCallback(() => {
    const prev = historyRef.current.pop();
    if (prev) setStep(prev);
  }, []);

  const handleProfileSave = useCallback(() => {
    const trimmed = profileName.trim();
    if (!trimmed) return;
    if (useCaseChoice === 'multiple') setMultiProfile(true);
    const id = addPartner({ name: trimmed, color: profileIconColor, icon: profileIconKey });
    setCreatedPartnerId(id);
    setActivePartner(id);
    goTo('periodQuestion');
  }, [profileName, profileIconKey, profileIconColor, useCaseChoice, addPartner, setActivePartner, setMultiProfile, goTo]);

  const handlePeriodLog = useCallback((date: string) => {
    if (!createdPartnerId) return;
    setIsEstimated(false);
    setSelectedDate(date);
    logPeriodStart(createdPartnerId, date);
    goTo('calculating');
  }, [createdPartnerId, logPeriodStart, goTo]);

  const handleProxySubmit = useCallback(() => {
    setIsEstimated(true);
    if (proxyQ2Answer === 'Genuinely no idea') {
      goTo('calculating');
      return;
    }
    const daysAgo =
      proxyQ2Answer === 'Less than a week'  ? 3  :
      proxyQ2Answer === '1–2 weeks ago'     ? 10 :
      proxyQ2Answer === '3–4 weeks ago'     ? 24 :
      proxyQ2Answer === 'Over a month ago'  ? 35 : 14;
    const estimatedStart = toDateOnly(addDays(new Date(), -daysAgo));
    setSelectedDate(estimatedStart);
    if (createdPartnerId) logPeriodStart(createdPartnerId, estimatedStart);
    goTo('calculating');
  }, [proxyQ2Answer, createdPartnerId, logPeriodStart, goTo]);

  const predictions = useMemo(() => {
    if (!createdPartnerId || !selectedDate) return {};
    const fakeLog = { id: 'temp', partnerId: createdPartnerId, startDate: selectedDate, periodLengthDays: 5, confirmedDays: [selectedDate] };
    return buildPredictedCalendar([fakeLog], createdPartnerId, true, true, true, 7);
  }, [createdPartnerId, selectedDate]);

  const todayInfo = useMemo(() => {
    if (!selectedDate || !createdPartnerId) return null;
    const fakeLog = { id: 'temp', partnerId: createdPartnerId, startDate: selectedDate, periodLengthDays: 5, confirmedDays: [selectedDate] };
    return buildTodayInfo(predictions, [fakeLog]);
  }, [predictions, selectedDate, createdPartnerId]);

  const dateOptions = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 45 }, (_, i) => {
      const d = addDays(today, -(44 - i));
      return {
        date: toDateOnly(d),
        dayNum: d.getDate(),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
      };
    });
  }, []);

  const renderStep = () => {
    switch (step) {
      case 'hook':         return <HookScreen onContinue={() => goTo('pain')} />;
      case 'pain':         return <PainScreen onContinue={() => goTo('whatitis')} />;
      case 'whatitis':     return <WhatItIsScreen onContinue={() => goTo('useCase')} />;
      case 'useCase':      return <UseCaseScreen selected={useCaseChoice} onSelect={setUseCaseChoice} onContinue={() => goTo('security')} />;
      case 'security':     return <SecurityScreen onContinue={() => goTo('profile')} />;
      case 'profile':      return <ProfileScreen name={profileName} onNameChange={setProfileName} iconKey={profileIconKey} onIconChange={setProfileIconKey} iconColor={profileIconColor} onIconColorChange={setProfileIconColor} onContinue={handleProfileSave} />;
      case 'periodQuestion': return <PeriodQuestionScreen onYes={() => goTo('periodInput')} onNo={() => goTo('proxyQ1')} />;
      case 'periodInput':  return <PeriodInputScreen dateOptions={dateOptions} selectedDate={selectedDate} onSelectDate={setSelectedDate} onContinue={(d) => handlePeriodLog(d)} />;
      case 'proxyQ1':      return <ProxyQ1Screen answer={proxyQ1Answer} onSelect={setProxyQ1Answer} onContinue={() => goTo('proxyQ2')} />;
      case 'proxyQ2':      return <ProxyQ2Screen answer={proxyQ2Answer} onSelect={setProxyQ2Answer} onContinue={handleProxySubmit} />;
      case 'calculating':  return <CalculatingScreen onDone={() => setStep(isEstimated ? 'proxyResult' : 'whatYouGet')} />;
      case 'whatYouGet':   return <WhatYouGetScreen todayInfo={todayInfo} onContinue={() => goTo('paywall')} />;
      case 'proxyResult':  return <ProxyResultScreen todayInfo={todayInfo} proxyQ2Answer={proxyQ2Answer} onContinue={() => goTo('paywall')} />;
      case 'paywall':      return <PaywallScreen onComplete={() => setOnboardingComplete(true)} onSkip={() => setOnboardingComplete(true)} />;
      default:             return null;
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground
        source={
          (step === 'whatYouGet' ||
            (step === 'proxyResult' && proxyQ2Answer !== 'Genuinely no idea')) &&
          todayInfo && !isEstimated
            ? PHASE_BACKGROUNDS[todayInfo.phaseKey]
            : PHASE_BACKGROUNDS.regular
        }
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {step !== 'hook' && step !== 'calculating' && (
            <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.7}>
              <CaretLeftIcon size={22} color="rgba(255,255,255,0.75)" weight="bold" />
            </TouchableOpacity>
          )}
          <Animated.View key={step} entering={FadeIn.duration(280)} style={styles.stepContainer}>
            {renderStep()}
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 1 — HOOK
// ─────────────────────────────────────────
function HookScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.flexOne}>
      <View style={styles.centered}>
        <View style={styles.logoWrap}>
          <Image source={CRIMSON_LOGO} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.spacerXl} />
        <Text style={styles.headline}>Timing is everything.</Text>
        <View style={styles.spacerMd} />
        <Text style={styles.sub}>
          Her mood, energy, and desire shift throughout the month. It's not random.
        </Text>
        <View style={styles.spacerLg} />
        <View style={styles.bulletList}>
          <BulletRow emoji="🧠" text="Learn her cycle and patterns" />
          <BulletRow emoji="📅" text="Plan the right moments with confidence" />
          <BulletRow emoji="🔥" text="Know when she's most into it" />
          <BulletRow emoji="🧭" text="Know when to step up, and when to give space" />
        </View>
        <View style={styles.spacerLg} />
        <Text style={styles.footerLarge}>One cycle. Four phases. Each one changes everything.</Text>
      </View>
      <CTAButton label="See how" onPress={onContinue} />
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 2 — PAIN
// ─────────────────────────────────────────
function PainScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.screenBox}>
        <View>
          <Text style={styles.headline}>Sound familiar?</Text>
          <View style={styles.spacerLg} />
          <View style={styles.painList}>
            <PainLine text="You planned the date. Wrong week." />
            <PainLine text="You started the conversation. Wrong day." />
            <PainLine text="You said the thing. Wrong moment." />
          </View>
          <View style={styles.spacerLg} />
          <Text style={styles.bodyText}>
            It's not bad luck.{'\n'}It's bad timing.
          </Text>
          <View style={styles.spacerMd} />
          <Text style={[styles.bodyText, { color: '#FFFFFF', fontFamily: Fonts.semiBold }]}>
            Timing is everything.
          </Text>
        </View>
        <View style={styles.btnZone}>
          <CTAButton label="Show me how" onPress={onContinue} />
        </View>
      </View>
    </View>
  );
}

function PainLine({ text }: { text: string }) {
  return (
    <View style={styles.painLine}>
      <Text style={styles.painBullet}>•</Text>
      <Text style={styles.painText}>{text}</Text>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 3 — WHAT CRIMSON IS
// ─────────────────────────────────────────
function WhatItIsScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.screenBox}>
        <View>
          <Text style={styles.headline}>A daily read on where she's at.</Text>
          <View style={styles.spacerXl} />
          <View style={styles.whatList}>
            <WhatRow text="Mood. Energy. Sensitivity. Libido." />
            <WhatRow text="What's likely coming. What that means for you." />
            <WhatRow text="Not a lecture. Not a health tracker." />
            <WhatRow text="Just the intel you actually need." highlight />
          </View>
        </View>
        <View style={styles.btnZone}>
          <CTAButton label="Continue" onPress={onContinue} />
        </View>
      </View>
    </View>
  );
}

function WhatRow({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <View style={styles.whatRow}>
      <View style={[styles.whatBullet, highlight && { backgroundColor: '#FFFFFF' }]} />
      <Text style={highlight ? styles.whatRowTextHighlight : styles.whatRowText}>{text}</Text>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 4 — USE CASE
// ─────────────────────────────────────────
function UseCaseScreen({
  selected,
  onSelect,
  onContinue,
}: {
  selected: 'single' | 'multiple' | null;
  onSelect: (v: 'single' | 'multiple') => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.screenBox}>
        <View>
          <Text style={styles.headline}>Who are you tracking?</Text>
          <View style={styles.spacerXl} />
          <TouchableOpacity
            style={[styles.optionBtn, selected === 'single' && styles.optionBtnActive]}
            onPress={() => onSelect('single')}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionTitle, selected === 'single' && styles.optionTitleActive]}>
              My partner
            </Text>
            <Text style={styles.optionSub}>One person, ongoing relationship</Text>
          </TouchableOpacity>
          <View style={styles.spacerMd} />
          <TouchableOpacity
            style={[styles.optionBtn, selected === 'multiple' && styles.optionBtnActive]}
            onPress={() => onSelect('multiple')}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionTitle, selected === 'multiple' && styles.optionTitleActive]}>
              Multiple people
            </Text>
            <Text style={styles.optionSub}>More than one — no judgment</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.btnZone}>
          <CTAButton label="Continue" onPress={onContinue} disabled={!selected} />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 5 — SECURITY
// ─────────────────────────────────────────
function SecurityScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.screenBox}>
        <View>
          <Text style={styles.headline}>Your eyes only.</Text>
          <View style={styles.spacerMd} />
          <Text style={styles.sub}>
            Nobody needs to know you're tracking, let alone how many.
          </Text>
          <View style={styles.spacerXl} />
          <View style={styles.featureList}>
            <FeatureRow icon={<EyeSlashIcon size={22} color="rgba(255,255,255,0.7)" weight="bold" />} text="Lock the app with Face ID or a PIN" />
            <FeatureRow icon={<WifiSlashIcon size={22} color="rgba(255,255,255,0.7)" weight="bold" />} text="All data stays on your device — nothing uploaded" />
            <FeatureRow icon={<ShieldCheckIcon size={22} color="rgba(255,255,255,0.7)" weight="bold" />} text="No account required" />
          </View>
        </View>
        <View style={styles.btnZone}>
          <CTAButton label="Continue" onPress={onContinue} />
        </View>
      </View>
    </View>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.featureRow}>
      {icon}
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 6 — PROFILE
// ─────────────────────────────────────────
function ProfileScreen({
  name, onNameChange, iconKey, onIconChange, iconColor, onIconColorChange, onContinue,
}: {
  name: string; onNameChange: (v: string) => void;
  iconKey: string; onIconChange: (v: string) => void;
  iconColor: string; onIconColorChange: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.screenWrap}>
      <View style={styles.profileLayout}>
        <View>
          <Text style={styles.headline}>Who are you tracking?</Text>
          <View style={styles.spacerSm} />
          <Text style={styles.reassuranceLg}>You can edit or add additional at any time.</Text>
          <View style={styles.spacerMd} />
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={onNameChange}
            placeholder="Her name"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="words"
            autoCorrect={false}
          />
          <View style={styles.spacerMd} />
          <Text style={styles.sectionLabel}>Icon</Text>
          <View style={styles.spacerSm} />
          <View style={styles.iconGrid}>
            {PARTNER_ICONS.slice(0, 12).map((entry) => {
              const Icon = entry.component;
              const active = iconKey === entry.key;
              return (
                <TouchableOpacity key={entry.key} style={[styles.iconBtn, active && styles.iconBtnActive]} onPress={() => onIconChange(entry.key)}>
                  <Icon size={24} color={active ? iconColor : 'rgba(255,255,255,0.3)'} weight={active ? 'fill' : 'regular'} />
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.spacerMd} />
          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.spacerSm} />
          <View style={styles.colorRow}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity key={c} style={[styles.colorBtn, { backgroundColor: c }, iconColor === c && styles.colorBtnActive]} onPress={() => onIconColorChange(c)} />
            ))}
          </View>
        </View>
        <View style={styles.btnZone}>
          <CTAButton label="Continue" onPress={onContinue} disabled={!name.trim()} />
        </View>
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────
// SCREEN 7 — PERIOD QUESTION
// ─────────────────────────────────────────
function PeriodQuestionScreen({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.screenBox}>
        <View>
          <Text style={styles.headline}>Do you know when the last period started?</Text>
          <View style={styles.spacerMd} />
          <Text style={styles.sub}>Even a rough guess helps us predict what's coming.</Text>
        </View>
        <View style={[styles.btnZone, { height: 112 }]}>
          <CTAButton label="Yes, I know" onPress={onYes} />
          <View style={styles.spacerMd} />
          <CTAButton label="Not sure" onPress={onNo} secondary />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 7A — DATE KNOWN
// ─────────────────────────────────────────
function PeriodInputScreen({
  dateOptions, selectedDate, onSelectDate, onContinue,
}: {
  dateOptions: { date: string; dayNum: number; weekday: string; month: string }[];
  selectedDate: string | null;
  onSelectDate: (d: string) => void;
  onContinue: (date: string) => void;
}) {
  const scrollRef = React.useRef<ScrollView>(null);

  return (
    <View style={styles.screenWrap}>
      <View style={styles.screenBox}>
        <View>
          <Text style={styles.headline}>When did it start?</Text>
          <View style={styles.spacerSm} />
          <Text style={styles.sub}>Approximate is fine — we'll calibrate over time.</Text>
          <View style={styles.spacerLg} />
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {dateOptions.map((d) => (
              <TouchableOpacity
                key={d.date}
                style={[styles.datePill, selectedDate === d.date && styles.datePillActive]}
                onPress={() => onSelectDate(d.date)}
                activeOpacity={0.7}
              >
                <Text style={[styles.datePillMonth, selectedDate === d.date && styles.datePillTextActive]}>{d.month}</Text>
                <Text style={[styles.datePillDay, selectedDate === d.date && styles.datePillTextActive]}>{d.dayNum}</Text>
                <Text style={[styles.datePillWeekday, selectedDate === d.date && styles.datePillTextActive]}>{d.weekday}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.btnZone}>
          <CTAButton label="See what's coming" onPress={() => selectedDate && onContinue(selectedDate)} disabled={!selectedDate} />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 7B-1 — PROXY Q1
// ─────────────────────────────────────────
const PROXY_Q1_OPTIONS = [
  'Yeah, pretty noticeably',
  'Sometimes, hard to tell',
  'Not really',
];

function ProxyQ1Screen({
  answer, onSelect, onContinue,
}: { answer: string | null; onSelect: (v: string) => void; onContinue: () => void }) {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.screenBox}>
        <View>
          <Text style={styles.headline}>Quick question.</Text>
          <View style={styles.spacerSm} />
          <Text style={styles.sub}>No right answer, just helps us get a read.</Text>
          <View style={styles.spacerLg} />
          <Text style={styles.sub}>Does she tend to get moody or low before her period?</Text>
          <View style={styles.spacerMd} />
          {PROXY_Q1_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.proxyOption, answer === opt && styles.proxyOptionActive]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.proxyOptionText, answer === opt && styles.proxyOptionTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.btnZone}>
          <CTAButton label="Next" onPress={onContinue} disabled={!answer} />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 7B-2 — PROXY Q2
// ─────────────────────────────────────────
const PROXY_Q2_OPTIONS = [
  'Less than a week',
  '1–2 weeks ago',
  '3–4 weeks ago',
  'Over a month ago',
  'Genuinely no idea',
];

function ProxyQ2Screen({
  answer, onSelect, onContinue,
}: { answer: string | null; onSelect: (v: string) => void; onContinue: () => void }) {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.screenBox}>
        <View>
          <Text style={styles.headline}>One more.</Text>
          <View style={styles.spacerLg} />
          <Text style={styles.sub}>Roughly how long ago did her last period start?</Text>
          <View style={styles.spacerMd} />
          {PROXY_Q2_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.proxyOption, answer === opt && styles.proxyOptionActive]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.proxyOptionText, answer === opt && styles.proxyOptionTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.btnZone}>
          <CTAButton label="Next" onPress={onContinue} disabled={!answer} />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 7B-4 — PROXY RESULT (a or b)
// ─────────────────────────────────────────
function ProxyResultScreen({
  todayInfo,
  proxyQ2Answer,
  onContinue,
}: {
  todayInfo: ReturnType<typeof buildTodayInfo> | null;
  proxyQ2Answer: string | null;
  onContinue: () => void;
}) {
  const noData = proxyQ2Answer === 'Genuinely no idea';
  const accent = PHASE_ACCENT[todayInfo?.phaseKey ?? 'regular'];

  if (noData) {
    // 7b-4b — zero data path
    return (
      <View style={styles.screenWrap}>
        <View style={styles.wygBox}>
          <View>
            <Text style={styles.headline}>Got it, you're{'\n'}starting from zero.</Text>
            <View style={styles.spacerSm} />
            <Text style={styles.sub}>Most guys are. Here's how this works.</Text>
            <View style={styles.spacerMd} />
            <Text style={styles.bodyText}>
              We build her profile as you go. Once you log the first period you will get full cycle predictions. The more you log, the more precise it gets.
            </Text>
            <View style={styles.spacerLg} />
            <View style={styles.glassCard}>
              <WygRow color={CrimsonColors.period}    title="Period forecast"  teaser="Predicted month by month"       locked />
              <View style={styles.divider} />
              <WygRow color={CrimsonColors.fertile}   title="Fertility window" teaser="Know her most receptive days"   locked />
              <View style={styles.divider} />
              <WygRow color={CrimsonColors.ovulation} title="Ovulation day"    teaser="The peak moment in her cycle"   locked />
              <View style={styles.divider} />
              <WygRow color={CrimsonColors.pms}       title="PMS window"       teaser="Know when to tread lightly"     locked />
            </View>
          </View>
          <View style={styles.btnZone}>
            <CTAButton label="Unlock full access" onPress={onContinue} />
          </View>
        </View>
      </View>
    );
  }

  // 7b-4a — estimated data path
  return (
    <View style={styles.screenWrap}>
      <View style={styles.wygBox}>
        <View>
          <Text style={styles.headline}>Great, that's{'\n'}enough to start.</Text>
          <View style={styles.spacerSm} />
          <Text style={styles.sub}>Log her next period and we'll map out the whole cycle.</Text>
          <View style={styles.spacerLg} />
          <View style={styles.glassCard}>
            <WygRow
              color={accent}
              title="Current phase"
              value={todayInfo?.phaseLabel ?? 'Regular'}
              valueSub="Estimated · log a real date to confirm"
              locked={false}
            />
            <View style={styles.divider} />
            <WygRow color={CrimsonColors.period}    title="Period forecast"  teaser="Predicted month by month"       locked />
            <View style={styles.divider} />
            <WygRow color={CrimsonColors.fertile}   title="Fertility window" teaser="Know her most receptive days"   locked />
            <View style={styles.divider} />
            <WygRow color={CrimsonColors.ovulation} title="Ovulation day"    teaser="The peak moment in her cycle"   locked />
            <View style={styles.divider} />
            <WygRow color={CrimsonColors.pms}       title="PMS window"       teaser="Know when to tread lightly"     locked />
          </View>
        </View>
        <View style={styles.btnZone}>
          <CTAButton label="Unlock full access" onPress={onContinue} />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 8 — CALCULATING
// ─────────────────────────────────────────
function CalculatingScreen({ onDone }: { onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const rotation = useSharedValue(0);
  const scale    = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.linear }),
      -1, false,
    );
    scale.value = withRepeat(
      withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    );
    const timer = setTimeout(() => onDoneRef.current(), 4000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spinStyle  = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.centered}>
      {/* Animated C logo mark */}
      <View style={styles.calcRing}>
        <Animated.View style={[styles.calcArc, spinStyle]} />
        <Animated.Image source={CRIMSON_C} style={[styles.calcLetterImg, pulseStyle]} resizeMode="contain" />
      </View>

      <View style={styles.spacerXl} />
      <Text style={styles.headline}>Running the{'\n'}numbers.</Text>
      <View style={styles.spacerMd} />
      <Text style={styles.sub}>Putting the cycle forecast together</Text>
    </View>
  );
}

// ─────────────────────────────────────────
// SCREEN 9 — WHAT YOU GET
// ─────────────────────────────────────────
function WygRow({
  color, title, value, valueSub, teaser, locked,
}: {
  color: string;
  title: string;
  value?: string;
  valueSub?: string;
  teaser?: string;
  locked: boolean;
}) {
  return (
    <View style={[styles.wygRow, locked && { opacity: 0.65 }]}>
      <View style={[styles.wygDot, { backgroundColor: color }]} />
      <View style={styles.wygContent}>
        <Text style={styles.wygTitle}>{title}</Text>
        {locked ? (
          <Text style={styles.wygTeaser}>{teaser}</Text>
        ) : (
          <>
            <Text style={[styles.wygValue, { color }]}>{value}</Text>
            {valueSub ? <Text style={styles.wygValueSub}>{valueSub}</Text> : null}
          </>
        )}
      </View>
      {locked && <LockSimpleIcon size={14} color="rgba(255,255,255,0.35)" weight="bold" />}
    </View>
  );
}

function WhatYouGetScreen({
  todayInfo,
  onContinue,
}: {
  todayInfo: ReturnType<typeof buildTodayInfo> | null;
  onContinue: () => void;
}) {
  const accent = PHASE_ACCENT[todayInfo?.phaseKey ?? 'regular'];
  return (
    <View style={styles.screenWrap}>
      <View style={styles.wygBox}>
        <View>
          <Text style={styles.headline}>Here's what{'\n'}we found</Text>
          <View style={styles.spacerSm} />
          <Text style={styles.sub}>Her cycle, fully mapped out.</Text>
          <View style={styles.spacerLg} />

          <View style={styles.glassCard}>
            <WygRow
              color={accent}
              title="Current phase"
              value={todayInfo?.phaseLabel ?? 'Regular'}
              valueSub={todayInfo?.bestMove}
              locked={false}
            />
            <View style={styles.divider} />
            <WygRow
              color={CrimsonColors.period}
              title="Period forecast"
              teaser="Predicted month by month"
              locked
            />
            <View style={styles.divider} />
            <WygRow
              color={CrimsonColors.fertile}
              title="Fertility window"
              teaser="Know her most receptive days"
              locked
            />
            <View style={styles.divider} />
            <WygRow
              color={CrimsonColors.ovulation}
              title="Ovulation day"
              teaser="The peak moment in her cycle"
              locked
            />
            <View style={styles.divider} />
            <WygRow
              color={CrimsonColors.pms}
              title="PMS window"
              teaser="Know when to tread lightly"
              locked
            />
          </View>
        </View>

        <View style={styles.btnZone}>
          <CTAButton label="Unlock full access" onPress={onContinue} />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// PAYWALL — powered by RevenueCat
// ─────────────────────────────────────────
function PaywallScreen({
  onComplete,
  onSkip,
}: {
  onComplete: () => void;
  onSkip: () => void;
}) {
  const { presentPaywallIfNeeded } = usePurchases();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const presented = useRef(false);

  const showPaywall = useCallback(async () => {
    setBusy(true);
    setDismissed(false);
    const result = await presentPaywallIfNeeded();
    setBusy(false);
    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
      case PAYWALL_RESULT.NOT_PRESENTED:
        onComplete();
        break;
      default:
        setDismissed(true);
        break;
    }
  }, [presentPaywallIfNeeded, onComplete]);

  useEffect(() => {
    if (presented.current) return;
    presented.current = true;
    showPaywall();
  }, [showPaywall]);

  if (!dismissed) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="rgba(255,255,255,0.5)" />
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <Text style={styles.headline}>Unlock Crimson</Text>
      <View style={styles.spacerMd} />
      <Text style={styles.sub}>Full predictions, multiple profiles, and complete calendar access.</Text>
      <View style={styles.spacerXl} />
      <CTAButton label={busy ? 'Loading…' : 'Try again'} onPress={showPaywall} disabled={busy} />
      <View style={styles.spacerMd} />
      <TouchableOpacity onPress={onSkip} activeOpacity={0.7} disabled={busy}>
        <Text style={[styles.secondaryLink, { opacity: 0.4, fontSize: 14 }]}>Maybe later</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────
// SHARED SMALL COMPONENTS
// ─────────────────────────────────────────
function BulletRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletEmoji}>{emoji}</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function CTAButton({ label, onPress, disabled, secondary }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.ctaBtn, secondary && styles.ctaBtnSecondary, disabled && styles.ctaBtnDisabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[styles.ctaText, secondary && styles.ctaTextSecondary]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' },
  stepContainer: { flex: 1, paddingTop: 80, paddingBottom: 50, paddingHorizontal: 28 },
  flexOne: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center' },
  screenWrap: { flex: 1, justifyContent: 'center' },
  screenBox: { height: 480, justifyContent: 'space-between' },
  btnZone: { height: 96 },

  backBtn: {
    position: 'absolute',
    top: 54,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoWrap: { alignSelf: 'center', backgroundColor: 'transparent' },
  logo: { width: 200, height: 56 },

  spacerSm: { height: 8 },
  spacerMd: { height: 16 },
  spacerLg: { height: 28 },
  spacerXl: { height: 44 },

  headline: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    lineHeight: 40,
  },
  sub: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 24,
  },
  bodyText: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 28,
  },
  footer: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 22,
  },
  footerLarge: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 24,
  },
  reassurance: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.45)',
  },
  reassuranceLg: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.55)',
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // Bullets
  bulletList: { gap: 16 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bulletEmoji: { fontSize: 22, width: 30, textAlign: 'center' },
  bulletText: { fontSize: 16, fontFamily: Fonts.medium, color: '#FFFFFF', flex: 1 },

  // Pain screen
  painList: { gap: 20 },
  painLine: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  painBullet: { fontSize: 18, color: CrimsonColors.period, fontFamily: Fonts.bold, lineHeight: 26 },
  painText: { fontSize: 17, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.8)', flex: 1, lineHeight: 26 },

  // What it is
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 22,
    gap: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  whatLine: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    paddingVertical: 14,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  whatList: { gap: 24 },
  whatRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  whatBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginTop: 9,
    flexShrink: 0,
  },
  whatRowText: {
    fontSize: 19,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 28,
    flex: 1,
  },
  whatRowTextHighlight: {
    fontSize: 19,
    fontFamily: Fonts.semiBold,
    color: '#FFFFFF',
    lineHeight: 28,
    flex: 1,
  },

  // Use case options
  optionBtn: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  optionBtnActive: {
    borderColor: CrimsonColors.primary,
    backgroundColor: 'rgba(155,34,38,0.15)',
  },
  optionTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  optionTitleActive: { color: '#FFFFFF' },
  optionSub: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.4)',
  },

  // Security
  featureList: { gap: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  featureText: { fontSize: 16, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.8)', flex: 1, lineHeight: 22 },

  // Profile
  profileLayout: { height: 540, justifyContent: 'space-between' },
  profileScroll: { paddingTop: 16, paddingBottom: 40 },
  nameInput: {
    borderRadius: 14,
    padding: 18,
    fontSize: 18,
    fontFamily: Fonts.regular,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#F5F5F7',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconBtn: {
    width: 48, height: 48, borderRadius: 14,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnActive: { borderColor: CrimsonColors.primary, backgroundColor: 'rgba(155,34,38,0.15)' },
  colorRow: { flexDirection: 'row', gap: 14 },
  colorBtn: { width: 40, height: 40, borderRadius: 20 },
  colorBtnActive: { borderWidth: 3, borderColor: '#FFFFFF' },

  // Date scroll (7a)
  dateScroll: { paddingVertical: 4, gap: 10 },
  datePill: {
    width: 68, height: 88, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  datePillActive: { borderColor: CrimsonColors.primary, backgroundColor: 'rgba(155,34,38,0.2)' },
  datePillMonth: { fontSize: 11, fontFamily: Fonts.medium, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  datePillDay: { fontSize: 22, fontFamily: Fonts.bold, color: 'rgba(255,255,255,0.7)' },
  datePillWeekday: { fontSize: 11, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  datePillTextActive: { color: '#FFFFFF' },

  // Duration pills (7b)
  durationPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  durationPill: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  durationPillWide: { width: 100 },
  durationPillActive: { borderColor: CrimsonColors.primary, backgroundColor: 'rgba(155,34,38,0.18)' },
  durationPillText: { fontSize: 18, fontFamily: Fonts.semiBold, color: 'rgba(255,255,255,0.5)' },
  durationPillTextActive: { color: '#FFFFFF' },

  // Calculating screen (screen 8)
  calcRing: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcArc: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: CrimsonColors.period,
    borderRightColor: CrimsonColors.period + '55',
  },
  calcLetterImg: {
    width: 68,
    height: 68,
  },

  // What you get screen (screen 9)
  wygBox: { height: 560, justifyContent: 'space-between' },
  wygRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 16,
  },
  wygDot: { width: 11, height: 11, borderRadius: 6, flexShrink: 0 },
  wygContent: { flex: 1 },
  wygTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  wygValue: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 22,
  },
  wygValueSub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  wygTeaser: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.42)',
    lineHeight: 20,
  },

  // CTA
  ctaBtn: { backgroundColor: CrimsonColors.primary, paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  ctaBtnSecondary: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  ctaBtnDisabled: { opacity: 0.35 },
  ctaText: { fontSize: 18, fontFamily: Fonts.semiBold, color: '#FFFFFF' },
  ctaTextSecondary: { color: 'rgba(255,255,255,0.75)' },

  proxyOption: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  proxyOptionActive: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  proxyOptionText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
  },
  proxyOptionTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.medium,
  },
  secondaryLink: { fontSize: 17, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },
});
