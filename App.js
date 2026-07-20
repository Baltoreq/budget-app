import { useState } from 'react';
import { Image, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { fontFamilies, radii, themeColors } from './theme';

const onboardingHero = require('./assets/onboarding-bg.png');
const logoMark = require('./assets/logo.png');
const incomeIcon = require('./assets/money-increase.png');
const expenseIcon = require('./assets/decline_chart.png');
const analyticsIcon = require('./assets/analytics_report.png');

function AppLink({ label, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}>
      <Text style={styles.linkButtonText}>{label}</Text>
    </Pressable>
  );
}

function HomeScreen({ onOpenOnboarding }) {
  return (
    <SafeAreaView style={styles.homeScreen}>
      <View style={styles.homeGlowTop} />
      <View style={styles.homeGlowBottom} />

      <View style={styles.homeContent}>
        <View style={styles.homeBrandRow}>
          <Image source={logoMark} style={styles.homeBrandIcon} resizeMode="contain" />
          <View style={styles.homeBrandTextWrap}>
            <Text style={styles.homeBrandName}>
              <Text style={styles.homeBrandNameDark}>Home</Text>
              <Text style={styles.homeBrandNameBlue}>Budget</Text>
            </Text>
            <Text style={styles.homeBrandTagline}>Ekran startowy aplikacji</Text>
          </View>
        </View>

        <View style={styles.homeCard}>
          <Text style={styles.homeCardTitle}>Wejdź do onboarding&apos;u</Text>
          <Text style={styles.homeCardText}>Otwórz ekran powitalny, aby zobaczyć układ przygotowany dokładnie pod załączony projekt.</Text>
          <AppLink label="Otwórz onboarding" onPress={onOpenOnboarding} />
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function FeatureCard({ icon, title, titleColor, description, cardHeight, iconSize, titleSize, descriptionSize }) {
  return (
    <View style={[styles.featureCard, { minHeight: cardHeight }]}>
      <Image source={icon} style={[styles.featureIcon, { width: iconSize, height: iconSize }]} resizeMode="contain" />
      <Text style={[styles.featureTitle, { color: titleColor, fontSize: titleSize, lineHeight: Math.round(titleSize * 1.28) }]}>{title}</Text>
      <Text style={[styles.featureDescription, { fontSize: descriptionSize, lineHeight: Math.round(descriptionSize * 1.45) }]}>{description}</Text>
    </View>
  );
}

function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.72, Math.min(1, height / 920));
  const heroWidth = Math.min(width - 32, 700);
  const heroHeight = Math.round(Math.min(width * 0.68, 300) * scale);
  const titleFontSize = Math.round(40 * scale);
  const titleLineHeight = Math.round(46 * scale);
  const subtitleFontSize = Math.round(19 * scale);
  const subtitleLineHeight = Math.round(26 * scale);
  const featureCardHeight = Math.round(216 * scale);
  const featureIconSize = Math.round(64 * scale);
  const featureTitleFontSize = Math.round(16 * scale);
  const featureDescriptionFontSize = Math.round(13 * scale);
  const primaryButtonHeight = Math.round(68 * scale);
  const primaryButtonFontSize = Math.round(28 * scale);

  return (
    <SafeAreaView style={styles.onboardingScreen}>
      <View style={styles.onboardingBackground}>
        <View style={styles.onboardingBlobTopLeft} />
        <View style={styles.onboardingBlobTopRight} />
        <View style={styles.onboardingBlobMid} />
        <View style={styles.onboardingBlobBottom} />
      </View>

      <View style={styles.onboardingContent}>
        <View style={styles.onboardingBrandRow}>
          <Image source={logoMark} style={styles.onboardingBrandIcon} resizeMode="contain" />
          <Text style={styles.onboardingBrandName}>
            <Text style={styles.homeBrandNameDark}>Home</Text>
            <Text style={styles.homeBrandNameBlue}>Budget</Text>
          </Text>
        </View>

        <View style={[styles.heroFrame, { width: heroWidth, height: heroHeight }]}>
          <Image source={onboardingHero} style={styles.heroImage} resizeMode="contain" />
        </View>

        <View style={styles.titleWrap}>
          <Text style={[styles.title, { fontSize: titleFontSize, lineHeight: titleLineHeight }]}>{'Zadbaj o swój\ndomowy budżet'}</Text>
          <Text style={[styles.subtitle, { fontSize: subtitleFontSize, lineHeight: subtitleLineHeight }]}>
            {'Śledź wpływy i wydatki, twórz własne\nkategorie i kontroluj każdy miesiąc\nw jednym miejscu.'}
          </Text>
        </View>

        <View style={styles.featureRow}>
          <FeatureCard icon={incomeIcon} title="Wpływy" titleColor="#2ca63c" description={['Rejestruj dochody', 'i miej je pod kontrolą.'].join('\n')} cardHeight={featureCardHeight} iconSize={featureIconSize} titleSize={featureTitleFontSize} descriptionSize={featureDescriptionFontSize} />
          <FeatureCard icon={expenseIcon} title="Wydatki" titleColor="#ff6a1a" description={['Kategoryzuj wydatki', 'i nie przekraczaj limitów.'].join('\n')} cardHeight={featureCardHeight} iconSize={featureIconSize} titleSize={featureTitleFontSize} descriptionSize={featureDescriptionFontSize} />
          <FeatureCard icon={analyticsIcon} title="Analiza" titleColor="#2468f2" description={['Sprawdzaj raporty', 'i podejmuj lepsze decyzje.'].join('\n')} cardHeight={featureCardHeight} iconSize={featureIconSize} titleSize={featureTitleFontSize} descriptionSize={featureDescriptionFontSize} />
        </View>

        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.primaryButton, { minHeight: primaryButtonHeight }, pressed && styles.primaryButtonPressed]}>
          <Text style={[styles.primaryButtonText, { fontSize: primaryButtonFontSize, lineHeight: Math.round(primaryButtonFontSize * 1.15) }]}>Zacznij</Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');

  return screen === 'home' ? <HomeScreen onOpenOnboarding={() => setScreen('onboarding')} /> : <OnboardingScreen />;
}

const styles = StyleSheet.create({
  homeScreen: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  homeGlowTop: {
    position: 'absolute',
    top: -140,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 9999,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
  },
  homeGlowBottom: {
    position: 'absolute',
    right: -160,
    bottom: -120,
    width: 320,
    height: 320,
    borderRadius: 9999,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  homeContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 28,
  },
  homeBrandRow: {
    alignItems: 'center',
    gap: 14,
  },
  homeBrandIcon: {
    width: 72,
    height: 72,
  },
  homeBrandTextWrap: {
    alignItems: 'center',
  },
  homeBrandName: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    textAlign: 'center',
  },
  homeBrandNameDark: {
    color: '#0f1f4d',
  },
  homeBrandNameBlue: {
    color: '#2468f2',
  },
  homeBrandTagline: {
    marginTop: 4,
    color: themeColors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fontFamilies.sans,
  },
  homeCard: {
    borderRadius: radii.card,
    backgroundColor: themeColors.surface,
    padding: 24,
    gap: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.09,
    shadowRadius: 28,
    elevation: 4,
  },
  homeCardTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    color: themeColors.textPrimary,
    textAlign: 'center',
  },
  homeCardText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamilies.sans,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
  linkButton: {
    alignSelf: 'center',
    minWidth: 180,
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1f63ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  linkButtonText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
  onboardingScreen: {
    flex: 1,
    backgroundColor: '#f7fbff',
  },
  onboardingBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  onboardingBlobTopLeft: {
    position: 'absolute',
    top: -130,
    left: -110,
    width: 360,
    height: 360,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  onboardingBlobTopRight: {
    position: 'absolute',
    top: 150,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 9999,
    backgroundColor: 'rgba(218,232,255,0.58)',
  },
  onboardingBlobMid: {
    position: 'absolute',
    top: 220,
    left: 44,
    width: 650,
    height: 420,
    borderRadius: 220,
    backgroundColor: 'rgba(227,238,255,0.62)',
  },
  onboardingBlobBottom: {
    position: 'absolute',
    bottom: -110,
    left: '8%',
    right: '8%',
    height: 170,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.84)',
  },
  onboardingContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onboardingBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 8,
  },
  onboardingBrandIcon: {
    width: 58,
    height: 58,
  },
  onboardingBrandName: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: fontFamilies.sans,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  heroFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 4,
    flexShrink: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  titleWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: 0,
  },
  title: {
    color: '#0d2a63',
    fontFamily: fontFamilies.sans,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: '#667699',
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
    maxWidth: 620,
  },
  featureRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 26,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  featureIcon: {
    marginTop: 2,
    marginBottom: 8,
  },
  featureTitle: {
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
    marginBottom: 6,
  },
  featureDescription: {
    color: '#667699',
    fontFamily: fontFamilies.sans,
    textAlign: 'center',
    minHeight: 40,
  },
  primaryButton: {
    width: '100%',
    marginTop: 4,
    borderRadius: 26,
    backgroundColor: '#1f63ef',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1f63ef',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: fontFamilies.sans,
  },
});
