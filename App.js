import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { baseColorTokens, brand, semanticColorTokens, themeColors, typographyTokens, usageNotes } from './theme';
import { fontFamilies } from './theme/fonts';
import { cardShadow } from './theme/shadows';

const typographyColumnFlex = [1.1, 1.5, 1.15, 0.7, 0.95, 1.15];

function SectionTitle({ index, title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {index}. {title}
      </Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function ColorCard({ token }) {
  return (
    <View style={styles.colorCard}>
      <View style={[styles.colorSwatch, { backgroundColor: token.hex }]} />
      <View style={styles.colorCardBody}>
        <Text style={styles.cardTitle}>{token.name}</Text>
        <Text style={styles.cardCode}>{token.hex}</Text>
        <Text style={styles.cardDescription}>{token.description}</Text>
      </View>
    </View>
  );
}

function TableCell({ flex, children, alignEnd = false }) {
  return <View style={[{ flex, alignItems: alignEnd ? 'flex-end' : 'flex-start' }]}>{children}</View>;
}

function TypographyRow({ token }) {
  const sampleStyle = {
    fontSize: token.size,
    lineHeight: token.lineHeight,
    fontWeight: String(token.weight),
    color: token.sampleColor ?? themeColors.textPrimary,
    fontFamily: token.fontFamily ?? fontFamilies.sans,
    fontVariant: token.numeric ? ['tabular-nums'] : undefined,
  };

  return (
    <View style={styles.typographyRow}>
      <TableCell flex={typographyColumnFlex[0]}>
        <Text style={styles.bodyText}>{token.role}</Text>
      </TableCell>
      <TableCell flex={typographyColumnFlex[1]}>
        <Text style={sampleStyle}>{token.sample}</Text>
      </TableCell>
      <TableCell flex={typographyColumnFlex[2]}>
        <Text style={styles.bodySmallText}>{token.family}</Text>
      </TableCell>
      <TableCell flex={typographyColumnFlex[3]}>
        <Text style={styles.bodySmallText}>{token.weight}</Text>
      </TableCell>
      <TableCell flex={typographyColumnFlex[4]}>
        <Text style={[styles.bodySmallText, styles.numericText]}>
          {token.size}px / {token.lineHeight}px
        </Text>
      </TableCell>
      <TableCell flex={typographyColumnFlex[5]}>
        <Text style={styles.bodySmallText}>{token.usage}</Text>
      </TableCell>
    </View>
  );
}

function TableHeader() {
  return (
    <View style={styles.tableHeader}>
      <TableCell flex={typographyColumnFlex[0]}>
        <Text style={styles.captionText}>Role</Text>
      </TableCell>
      <TableCell flex={typographyColumnFlex[1]}>
        <Text style={styles.captionText}>Sample</Text>
      </TableCell>
      <TableCell flex={typographyColumnFlex[2]}>
        <Text style={styles.captionText}>Recommended Family</Text>
      </TableCell>
      <TableCell flex={typographyColumnFlex[3]}>
        <Text style={styles.captionText}>Weight</Text>
      </TableCell>
      <TableCell flex={typographyColumnFlex[4]}>
        <Text style={styles.captionText}>Size / Line-Height</Text>
      </TableCell>
      <TableCell flex={typographyColumnFlex[5]}>
        <Text style={styles.captionText}>Usage</Text>
      </TableCell>
    </View>
  );
}

function NoteCard({ note }) {
  return (
    <View style={styles.noteCard}>
      <View style={styles.noteIconWrap}>
        <Text style={styles.noteIcon}>{note.icon}</Text>
      </View>
      <Text style={styles.noteText}>{note.text}</Text>
    </View>
  );
}

function GradientBlob({ style, color }) {
  return <View pointerEvents="none" style={[styles.blob, { backgroundColor: color }, style]} />;
}

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.backgroundLayer}>
        <GradientBlob color="rgba(79, 70, 229, 0.10)" style={styles.blobTopLeft} />
        <GradientBlob color="rgba(14, 165, 164, 0.08)" style={styles.blobTopRight} />
        <GradientBlob color="rgba(37, 99, 235, 0.08)" style={styles.blobBottom} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>{brand.mark}</Text>
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>{brand.name}</Text>
            <Text style={styles.heroSubtitle}>{brand.tagline}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <SectionTitle index={1} title="Base Colors" />
          <View style={styles.cardGrid}>
            {baseColorTokens.map((token) => (
              <ColorCard key={token.name} token={token} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle index={2} title="Semantic Colors" />
          <View style={styles.cardGrid}>
            {semanticColorTokens.map((token) => (
              <ColorCard key={token.name} token={token} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle index={3} title="Typography" subtitle="All roles are defined from the shared design tokens." />
          <View style={styles.typographyCard}>
            <TableHeader />
            {typographyTokens.map((token) => (
              <TypographyRow key={token.role} token={token} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle index={4} title="Usage Notes" />
          <View style={styles.noteGrid}>
            {usageNotes.map((note) => (
              <NoteCard key={note.text} note={note} />
            ))}
          </View>
        </View>
      </ScrollView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobTopLeft: {
    width: 260,
    height: 260,
    top: -100,
    left: -100,
  },
  blobTopRight: {
    width: 300,
    height: 300,
    top: 100,
    right: -120,
  },
  blobBottom: {
    width: 360,
    height: 360,
    bottom: -180,
    left: '50%',
    marginLeft: -180,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  hero: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  logoMark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.16)',
    backgroundColor: 'rgba(79, 70, 229, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: {
    fontSize: 24,
    lineHeight: 28,
    color: themeColors.primary,
    fontWeight: '700',
  },
  heroTextWrap: {
    alignItems: 'center',
    gap: 4,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: themeColors.textPrimary,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: themeColors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.border,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: themeColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: themeColors.textSecondary,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: themeColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 12,
    shadowColor: cardShadow.shadowColor,
    shadowOffset: cardShadow.shadowOffset,
    shadowOpacity: cardShadow.shadowOpacity,
    shadowRadius: cardShadow.shadowRadius,
    elevation: cardShadow.elevation,
  },
  colorSwatch: {
    width: 64,
    height: 80,
    borderRadius: 14,
  },
  colorCardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: themeColors.textPrimary,
  },
  cardCode: {
    fontSize: 14,
    lineHeight: 20,
    color: themeColors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: themeColors.textSecondary,
  },
  typographyCard: {
    backgroundColor: themeColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
    shadowColor: cardShadow.shadowColor,
    shadowOffset: cardShadow.shadowOffset,
    shadowOpacity: cardShadow.shadowOpacity,
    shadowRadius: cardShadow.shadowRadius,
    elevation: cardShadow.elevation,
  },
  tableHeader: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  typographyRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: themeColors.textPrimary,
  },
  bodySmallText: {
    fontSize: 14,
    lineHeight: 20,
    color: themeColors.textSecondary,
  },
  captionText: {
    fontSize: 12,
    lineHeight: 16,
    color: themeColors.textMuted,
  },
  numericText: {
    fontVariant: ['tabular-nums'],
  },
  noteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  noteCard: {
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: themeColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 16,
    gap: 12,
    shadowColor: cardShadow.shadowColor,
    shadowOffset: cardShadow.shadowOffset,
    shadowOpacity: cardShadow.shadowOpacity,
    shadowRadius: cardShadow.shadowRadius,
    elevation: cardShadow.elevation,
  },
  noteIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surfaceAlt,
  },
  noteIcon: {
    fontSize: 18,
    lineHeight: 22,
    color: themeColors.textPrimary,
    fontWeight: '700',
  },
  noteText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: themeColors.textPrimary,
  },
});
