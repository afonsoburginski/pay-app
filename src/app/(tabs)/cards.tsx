import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DolarAppLogoIcon,
  DOLARAPP_WHITE,
  MastercardIcon,
} from '@/components/icons';
import { TabScreenHeader, useDefaultHeaderSlots } from '@/components/tab-screen-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/theme/colors';

const BRAND_GREEN = '#16a34a';
const CARD_GREEN = '#1e9e4f'; // Slightly lighter than app green
const CARD_BUSINESS = '#4a4a4a'; // Cinza grafite – versão Business

const virtualCard = {
  numberFull: '4242 4242 4242 4242',
  expiry: '12/28',
  holder: 'John Doe',
  cvv: '123',
};

const CARDS = [
  { id: 'default', type: 'default' as const, label: 'Personal' },
  { id: 'business', type: 'business' as const, label: 'Business' },
];

const CARD_FLIP_DURATION_MS = 180;

type CardStyles = ReturnType<typeof createThemeStyles> & typeof staticCardStyles;

/** Frente: DolarApp (topo); nome no canto inferior esquerdo; Mastercard à direita */
const CardFront = memo(function CardFront({ s }: { s: CardStyles }) {
  return (
    <View style={s.face}>
      <View style={s.cardTopRow}>
        <DolarAppLogoIcon width={26} height={20} color={DOLARAPP_WHITE} />
        <Text style={s.cardBrandName}>DolarApp</Text>
      </View>
      <View style={s.cardMiddle} />
      <View style={s.cardBottomRow}>
        <Text style={s.cardHolderName}>{virtualCard.holder}</Text>
        <MastercardIcon size={48} />
      </View>
    </View>
  );
});

/** Verso: outra face do cartão – só dados (faixa, número, validade, CVV, contato). Sem DolarApp. */
const CardBack = memo(function CardBack({ s }: { s: CardStyles }) {
  return (
    <View style={s.faceBack}>
      <View style={s.backStripe} />
      <View style={s.backContent}>
        <Text style={s.backLabel}>Card number</Text>
        <Text style={s.backNumber}>{virtualCard.numberFull}</Text>
        <View style={s.backExpCvv}>
          <Text style={s.backLabel}>EXP {virtualCard.expiry}</Text>
          <Text style={s.backCvvLabel}>CVV {virtualCard.cvv}</Text>
        </View>
      </View>
      <Text style={s.backContact}>+00 0000 0000 · www.dolarapp.com</Text>
    </View>
  );
});

/** Frente Business: DolarApp Business (topo esq.), nome e Mastercard */
const CardFrontBusiness = memo(function CardFrontBusiness({ s }: { s: CardStyles }) {
  return (
    <View style={s.faceBusiness}>
      <View style={s.cardTopRowBusiness}>
        <Text style={s.cardBrandNameBusiness}>DolarApp Business</Text>
      </View>
      <View style={s.cardMiddle} />
      <View style={s.cardBottomRow}>
        <Text style={s.cardHolderName}>{virtualCard.holder}</Text>
        <MastercardIcon size={48} />
      </View>
    </View>
  );
});

/** Verso Business: mesma estrutura, cor cinza escuro e faixa clara */
const CardBackBusiness = memo(function CardBackBusiness({ s }: { s: CardStyles }) {
  return (
    <View style={s.faceBackBusiness}>
      <View style={s.backStripeBusiness} />
      <View style={s.backContent}>
        <Text style={s.backLabel}>Card number</Text>
        <Text style={s.backNumber}>{virtualCard.numberFull}</Text>
        <View style={s.backExpCvv}>
          <Text style={s.backLabel}>EXP {virtualCard.expiry}</Text>
          <Text style={s.backCvvLabel}>CVV {virtualCard.cvv}</Text>
        </View>
      </View>
      <Text style={s.backContact}>+00 0000 0000 · www.dolarapp.com</Text>
    </View>
  );
});

/** Transição suave frente/verso: crossfade de opacidade (sem flip 3D, sem bugs) */
interface CardWithTransitionProps {
  showDetails: boolean;
  type: 'default' | 'business';
  styles: CardStyles;
}

function CardWithTransition({ showDetails, type, styles: s }: CardWithTransitionProps) {
  const backVisible = useSharedValue(showDetails ? 1 : 0);

  useEffect(() => {
    backVisible.value = withTiming(showDetails ? 1 : 0, {
      duration: CARD_FLIP_DURATION_MS,
    });
  }, [showDetails, backVisible]);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - backVisible.value,
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backVisible.value,
  }));

  const isBusiness = type === 'business';

  return (
    <View style={s.cardFlipContainer}>
      <Animated.View style={[s.cardFaceLayer, frontAnimatedStyle]}>
        {isBusiness ? <CardFrontBusiness s={s} /> : <CardFront s={s} />}
      </Animated.View>
      <Animated.View style={[s.cardFaceLayer, backAnimatedStyle]}>
        {isBusiness ? <CardBackBusiness s={s} /> : <CardBack s={s} />}
      </Animated.View>
    </View>
  );
}

/** Item do carousel: memoizado para re-render só quando item ou showDetails mudam */
interface CarouselCardItemProps {
  item: (typeof CARDS)[number];
  showDetails: boolean;
  styles: CardStyles;
}

const CarouselCardItem = memo(function CarouselCardItem({
  item,
  showDetails,
  styles: s,
}: CarouselCardItemProps) {
  return (
    <View style={[s.carouselItem, carouselItemWidthStyle]}>
      <CardWithTransition showDetails={showDetails} type={item.type} styles={s} />
    </View>
  );
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const carouselItemWidthStyle = { width: SCREEN_WIDTH };

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = useMemo(() => ({ ...staticCardStyles, ...createThemeStyles(colors) }), [colors]);
  const [detailsVisible, setDetailsVisible] = useState<boolean[]>([false, false]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);

  const updateIndex = useCallback((index: number) => {
    const clamped = Math.min(Math.max(0, index), CARDS.length - 1);
    if (currentIndexRef.current !== clamped) {
      currentIndexRef.current = clamped;
      setCurrentIndex(clamped);
    }
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / SCREEN_WIDTH);
      updateIndex(index);
    },
    [updateIndex]
  );

  const setDetailsForIndex = useCallback((index: number, value: boolean) => {
    setDetailsVisible((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleSwitchChange = useCallback(
    (value: boolean) => {
      setDetailsForIndex(currentIndexRef.current, value);
    },
    [setDetailsForIndex]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: (typeof CARDS)[number]) => item.id, []);

  const renderCardItem = useCallback(
    ({ item, index }: { item: (typeof CARDS)[number]; index: number }) => (
      <CarouselCardItem
        item={item}
        showDetails={detailsVisible[index] ?? false}
        styles={styles}
      />
    ),
    [detailsVisible, styles]
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      updateIndex(Math.round(x / SCREEN_WIDTH));
    },
    [updateIndex]
  );

  const showDetailsCurrent = useMemo(
    () => detailsVisible[currentIndex] ?? false,
    [detailsVisible, currentIndex]
  );

  const isBusiness = useMemo(
    () => CARDS[currentIndex]?.type === 'business',
    [currentIndex]
  );

  const switchTrackColor = useMemo(
    () => ({
      false: colors.input,
      true: isBusiness ? 'rgba(74, 74, 74, 0.6)' : 'rgba(22, 163, 74, 0.5)',
    }),
    [isBusiness, colors.input]
  );

  const switchThumbColor = useMemo(
    () =>
      showDetailsCurrent
        ? isBusiness
          ? CARD_BUSINESS
          : BRAND_GREEN
        : colors.secondary,
    [showDetailsCurrent, isBusiness, colors.secondary]
  );

  const switcherHintText = useMemo(
    () =>
      showDetailsCurrent
        ? 'Your card number and details are visible.'
        : 'Turn the card to reveal your number, expiry and name.',
    [showDetailsCurrent]
  );

  const { leftSlot, rightSlot } = useDefaultHeaderSlots();
  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingBottom: insets.bottom + 60 }],
    [insets.bottom, styles.scrollContent]
  );

  return (
    <View style={styles.container}>
      <TabScreenHeader
        leftSlot={leftSlot}
        title="Cards"
        rightSlot={rightSlot}
        subtitle="Your virtual card"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Carousel de cartões (horizontal, sem setas) */}
        <FlatList
          data={CARDS}
          keyExtractor={keyExtractor}
          renderItem={renderCardItem}
          horizontal
          pagingEnabled
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          style={styles.carouselList}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={getItemLayout}
        />

        {/* Indicadores (bolinhas) */}
        <View style={styles.carouselIndicators}>
          {CARDS.map((_, i) => (
            <View
              key={CARDS[i].id}
              style={[
                styles.carouselDot,
                i === currentIndex && styles.carouselDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.switcherRow}>
          <Text style={styles.switcherLabel}>Show card details</Text>
          <Switch
            value={showDetailsCurrent}
            onValueChange={handleSwitchChange}
            trackColor={switchTrackColor}
            thumbColor={switchThumbColor}
          />
        </View>
        <Text style={styles.switcherHint}>{switcherHintText}</Text>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Physical card</Text>
          <Text style={styles.footerText}>
            Order a physical card to spend your balance anywhere. Delivery in 5–7 business days.
          </Text>
          <TouchableOpacity style={styles.footerCta} activeOpacity={0.8}>
            <Text style={styles.footerCtaText}>Order card</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const staticCardStyles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 20,
    alignItems: 'center',
  },
  cardFlipContainer: {
    width: '100%',
    maxWidth: 340,
    aspectRatio: 1.586,
    position: 'relative',
  },
  cardFaceLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  face: {
    flex: 1,
    width: '100%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: CARD_GREEN,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  cardMiddle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHolderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardBrandName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  cardNumberHidden: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  faceBack: {
    flex: 1,
    width: '100%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: CARD_GREEN,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'flex-start',
  },
  faceBusiness: {
    flex: 1,
    width: '100%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: CARD_BUSINESS,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'space-between',
  },
  cardTopRowBusiness: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  cardBrandNameBusiness: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  faceBackBusiness: {
    flex: 1,
    width: '100%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: CARD_BUSINESS,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'flex-start',
  },
  backStripe: {
    height: 48,
    backgroundColor: '#d4d4d4',
    marginHorizontal: -20,
    marginTop: 12,
    marginBottom: 20,
  },
  backStripeBusiness: {
    height: 48,
    backgroundColor: '#e0e0e0',
    marginHorizontal: -20,
    marginTop: 12,
    marginBottom: 20,
  },
  backContent: {
    flex: 1,
    justifyContent: 'center',
  },
  backName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  backNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 12,
  },
  backExpCvv: {
    flexDirection: 'row',
    gap: 16,
  },
  backLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  backCvvLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  backContact: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
  },
});

function createThemeStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.screenBackground,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    carouselList: {
      marginHorizontal: -16,
      height: 224,
    },
    carouselContent: {
      paddingVertical: 8,
    },
    carouselItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    carouselIndicators: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      marginBottom: 8,
    },
    carouselDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.input,
    },
    carouselDotActive: {
      backgroundColor: BRAND_GREEN,
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    switcherRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      marginBottom: 6,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    switcherLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    switcherHint: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    footerCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    footerTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    footerText: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
      marginBottom: 12,
    },
    footerCta: {
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(22, 163, 74, 0.12)',
      borderRadius: 10,
    },
    footerCtaText: {
      fontSize: 14,
      fontWeight: '600',
      color: BRAND_GREEN,
    },
  });
}
