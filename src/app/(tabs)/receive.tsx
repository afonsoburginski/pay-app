import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as QRCodeLib from 'qrcode';

import {
  ChevronRightIcon,
  CurrencyCodeIcon,
  DOLARAPP_WHITE,
  DolarAppLogoIcon,
} from '@/components/icons';
import { TabScreenHeader, useDefaultHeaderSlots } from '@/components/tab-screen-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DEPOSIT_CURRENCIES, DEPOSIT_DETAILS } from '@/lib/currencies';
import { Colors } from '@/theme/colors';

const BRAND_GREEN = '#16a34a';

const PLACEHOLDER_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

const CURRENCY_ICON_SIZE = 28;

/** Request payment from another DolarApp user (they send you USDC). */
const REQUEST_PAYMENT_OPTIONS = [
  {
    id: 'dolarapp-friend',
    primary: 'In DolarApp',
    secondary: 'Request from a friend',
    useLogo: true,
  },
] as const;

/** Detalhes para receber USDC no DolarApp (mesma estrutura de cards das outras moedas). */
const REQUEST_DOLARAPP_DETAILS: { label: string; value: string }[] = [
  { label: 'Network', value: 'Polygon' },
  { label: 'Asset', value: 'USDC' },
];

type AddBalanceId = (typeof DEPOSIT_CURRENCIES)[number]['id'];
type RequestPaymentId = (typeof REQUEST_PAYMENT_OPTIONS)[number]['id'];
type SelectedMethod = { type: 'add_balance'; id: AddBalanceId } | { type: 'request'; id: RequestPaymentId } | null;

export default function ReceiveScreen() {
  const params = useLocalSearchParams<{ openConvert?: string; currency?: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [step, setStep] = useState<'choose' | 'details'>('choose');
  const [selectedMethod, setSelectedMethod] = useState<SelectedMethod>(null);
  const [copied, setCopied] = useState(false);
  const [qrSvg, setQrSvg] = useState<string | null>(null);

  useEffect(() => {
    if (params.openConvert !== '1' || !params.currency) return;
    const currencyId = params.currency.toLowerCase();
    const isValid = DEPOSIT_CURRENCIES.some((c) => c.id === currencyId);
    if (isValid) {
      setSelectedMethod({ type: 'add_balance', id: currencyId as AddBalanceId });
      setStep('details');
    }
  }, [params.openConvert, params.currency]);

  const addressToShow = useMemo(() => {
    if (!selectedMethod) return PLACEHOLDER_ADDRESS;
    if (selectedMethod.type === 'request') return PLACEHOLDER_ADDRESS;
    return `${PLACEHOLDER_ADDRESS}-${selectedMethod.id.toUpperCase()}`;
  }, [selectedMethod]);

  useEffect(() => {
    let cancelled = false;
    QRCodeLib.toString(addressToShow, { type: 'svg', width: 200, margin: 2 })
      .then((svg: string) => {
        if (!cancelled) setQrSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setQrSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [addressToShow]);

  const { leftSlot, rightSlot } = useDefaultHeaderSlots();
  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingBottom: insets.bottom + 60 }],
    [insets.bottom, styles.scrollContent]
  );

  const handleSelectAddBalance = (id: AddBalanceId) => {
    setSelectedMethod({ type: 'add_balance', id });
    setStep('details');
  };

  const handleSelectRequestPayment = (id: RequestPaymentId) => {
    setSelectedMethod({ type: 'request', id });
    setStep('details');
  };

  const handleBack = () => {
    setStep('choose');
    setSelectedMethod(null);
  };

  const copyAddress = async () => {
    await Clipboard.setStringAsync(addressToShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDetailsStep = step === 'details';
  const isRequestDolarApp = selectedMethod?.type === 'request' && selectedMethod?.id === 'dolarapp-friend';

  const headerLeftSlot = isDetailsStep ? (
    <TouchableOpacity style={styles.headerIcon} onPress={handleBack} activeOpacity={0.7}>
      <Text style={styles.headerBackText}>←</Text>
    </TouchableOpacity>
  ) : (
    leftSlot
  );

  return (
    <View style={styles.container}>
      <TabScreenHeader
        leftSlot={headerLeftSlot}
        title="Receive"
        rightSlot={rightSlot}
        subtitle={
          isDetailsStep
            ? isRequestDolarApp
              ? 'Share your link or QR to receive USDC'
              : 'Deposit in the currency below. Automatically converted to USDC.'
            : 'Add balance in local currency or USD. Automatically converted to USDC.'
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {step === 'choose' ? (
          <>
            <Text style={styles.sectionTitle}>IN DOLARAPP</Text>
            <View style={styles.card}>
              {REQUEST_PAYMENT_OPTIONS.map((opt, index) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionRow,
                    index === REQUEST_PAYMENT_OPTIONS.length - 1 && styles.optionRowLast,
                  ]}
                  onPress={() => handleSelectRequestPayment(opt.id)}
                  activeOpacity={0.7}
                >
                  {opt.useLogo ? (
                    <View style={styles.optionLogo}>
                      <DolarAppLogoIcon width={28} height={22} color={DOLARAPP_WHITE} />
                    </View>
                  ) : null}
                  <View style={[styles.optionContent, opt.useLogo ? { marginLeft: 12 } : undefined]}>
                    <Text style={styles.optionPrimary}>{opt.primary}</Text>
                    <Text style={styles.optionSecondary}>{opt.secondary}</Text>
                  </View>
                  <ChevronRightIcon size={20} color="#a1a1aa" />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>ADD BALANCE</Text>
            <View style={styles.card}>
              {DEPOSIT_CURRENCIES.map((opt, index) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionRow,
                    index === DEPOSIT_CURRENCIES.length - 1 && styles.optionRowLast,
                  ]}
                  onPress={() => handleSelectAddBalance(opt.id)}
                  activeOpacity={0.7}
                >
                  <CurrencyCodeIcon code={opt.code} size={CURRENCY_ICON_SIZE} />
                  <View style={[styles.optionContent, { marginLeft: 12 }]}>
                    <Text style={styles.optionPrimary}>{opt.primary}</Text>
                    <Text style={styles.optionSecondary}>{opt.secondary}</Text>
                  </View>
                  <ChevronRightIcon size={20} color="#a1a1aa" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : isRequestDolarApp ? (
          <>
            <View style={styles.card}>
              <View style={styles.qrContainer}>
                {qrSvg ? (
                  <SvgXml xml={qrSvg} width={200} height={200} />
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <Text style={styles.qrPlaceholderText}>QR</Text>
                  </View>
                )}
              </View>
              <Text style={styles.qrHint}>Scan to pay or receive USDC</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Your wallet address</Text>
              <Text style={styles.addressHint}>
                Share this address or the QR. Anyone can send you USDC here.
              </Text>
              <Text style={styles.addressText} selectable>
                {addressToShow}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyAddress}
                activeOpacity={0.8}
              >
                <Text style={styles.copyButtonText}>
                  {copied ? 'Copied!' : 'Copy address'}
                </Text>
              </TouchableOpacity>
            </View>
            {REQUEST_DOLARAPP_DETAILS.map((row) => (
              <View key={row.label} style={styles.card}>
                <Text style={styles.cardLabel}>{row.label}</Text>
                <Text style={styles.detailValue} selectable>{row.value}</Text>
              </View>
            ))}
            <Text style={styles.disclaimer}>
              Only send USDC and supported assets to this address. When sending to someone else, use their email or wallet address.
            </Text>
          </>
        ) : (
          (() => {
            const addId = selectedMethod?.type === 'add_balance' ? selectedMethod.id : null;
            const option = addId ? DEPOSIT_CURRENCIES.find((o) => o.id === addId) : null;
            const currencyKey = addId ? addId.toUpperCase() : '';
            const details = DEPOSIT_DETAILS[currencyKey] ?? [];
            return (
              <>
                <View style={styles.card}>
                  <Text style={styles.convertBanner}>
                    Deposit in {option?.primary ?? currencyKey}. Funds are automatically converted to USDC and added to your balance.
                  </Text>
                  {option && (
                    <Text style={styles.methodNote}>{option.method}</Text>
                  )}
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>Deposit address / reference</Text>
                  <View style={styles.qrContainer}>
                    {qrSvg ? (
                      <SvgXml xml={qrSvg} width={200} height={200} />
                    ) : (
                      <View style={styles.qrPlaceholder}>
                        <Text style={styles.qrPlaceholderText}>QR</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.qrHint}>Show QR or share the code below</Text>
                  <Text style={styles.addressText} selectable>
                    {addressToShow}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={copyAddress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.copyButtonText}>
                      {copied ? 'Copied!' : 'Copy address'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {details.map((row) => (
                  <View key={row.label} style={styles.card}>
                    <Text style={styles.cardLabel}>{row.label}</Text>
                    <Text style={styles.detailValue} selectable>{row.value}</Text>
                  </View>
                ))}
                <Text style={styles.disclaimer}>
                  Use the details above to send funds from your bank. Conversion to USDC is applied at the current rate when the transfer is received.
                </Text>
              </>
            );
          })()
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.screenBackground,
    },
    headerIcon: {
      padding: 8,
      minWidth: 40,
    },
    headerBackText: {
      fontSize: 24,
      color: '#fff',
      fontWeight: '600',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionRowLast: {
      borderBottomWidth: 0,
    },
    optionLogo: {
      width: 40,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      backgroundColor: BRAND_GREEN,
      borderRadius: 8,
    },
    optionContent: {
      flex: 1,
    },
    optionPrimary: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    optionSecondary: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    convertBanner: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 22,
    },
    methodNote: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 8,
    },
    detailValue: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    qrContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
    },
    qrPlaceholder: {
      width: 200,
      height: 200,
      borderRadius: 12,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    qrPlaceholderText: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.textMuted,
    },
    qrHint: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
    },
    addressHint: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
      marginBottom: 10,
    },
    addressText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    copyButton: {
      alignSelf: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(22, 163, 74, 0.12)',
      borderRadius: 10,
    },
    copyButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: BRAND_GREEN,
    },
    disclaimer: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 18,
      textAlign: 'center',
      paddingHorizontal: 8,
    },
  });
}
