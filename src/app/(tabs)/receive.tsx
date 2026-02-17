import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronRightIcon,
  CurrencyCodeIcon,
  DolarAppLogoIcon,
  DOLARAPP_WHITE,
  HelpIcon,
  UserIcon,
  UsdcIcon,
} from '@/components/icons';

const BRAND_GREEN = '#16a34a';

const PLACEHOLDER_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

const CURRENCY_ICON_SIZE = 28;

/** Add balance: user deposits in one of these currencies; funds are automatically converted to USDC. */
const ADD_BALANCE_OPTIONS = [
  {
    id: 'cop',
    code: 'COP' as const,
    primary: 'Colombian pesos (COP)',
    secondary: 'Deposit in COP → converted to USDC',
    method: 'PSE or bank transfer',
  },
  {
    id: 'ars',
    code: 'ARS' as const,
    primary: 'Argentine pesos (ARS)',
    secondary: 'Deposit in ARS → converted to USDC',
    method: 'Bank transfer (ARG)',
  },
  {
    id: 'brl',
    code: 'BRL' as const,
    primary: 'Brazilian reais (BRL)',
    secondary: 'Deposit in BRL → converted to USDC',
    method: 'Pix or bank transfer',
  },
  {
    id: 'usd',
    code: 'USD' as const,
    primary: 'US dollars (USD)',
    secondary: 'Deposit in USD → credited as USDC',
    method: 'US bank transfer',
  },
] as const;

/** Request payment from another DolarApp user (they send you USDC). */
const REQUEST_PAYMENT_OPTIONS = [
  {
    id: 'dolarapp-friend',
    primary: 'In DolarApp',
    secondary: 'Request from a friend',
    useLogo: true,
  },
] as const;

/** Deposit details shown per currency (placeholder data; real data from backend later). */
const DEPOSIT_DETAILS: Record<
  string,
  { label: string; value: string }[]
> = {
  COP: [
    { label: 'Reference number', value: 'REF-COL-2024-987654' },
    { label: 'Bank / method', value: 'PSE – Any supported bank' },
    { label: 'Beneficiary', value: 'DolarApp User' },
  ],
  ARS: [
    { label: 'CBU / CVU', value: '0000003100012345678901' },
    { label: 'Bank', value: 'Banco Example AR' },
    { label: 'Beneficiary', value: 'DolarApp User' },
  ],
  BRL: [
    { label: 'Pix key (email)', value: 'user@dolarapp.com' },
    { label: 'Or bank transfer', value: 'Branch 1234 – Account 56789-0' },
    { label: 'Beneficiary', value: 'DolarApp User' },
  ],
  USD: [
    { label: 'Entity', value: 'Lineage Bank' },
    { label: 'Account number', value: '123456789' },
    { label: 'Routing number', value: '021000021' },
    { label: 'Account type', value: 'Checking' },
  ],
};

type AddBalanceId = (typeof ADD_BALANCE_OPTIONS)[number]['id'];
type RequestPaymentId = (typeof REQUEST_PAYMENT_OPTIONS)[number]['id'];
type SelectedMethod = { type: 'add_balance'; id: AddBalanceId } | { type: 'request'; id: RequestPaymentId } | null;

export default function ReceiveScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'choose' | 'details'>('choose');
  const [selectedMethod, setSelectedMethod] = useState<SelectedMethod>(null);
  const [copied, setCopied] = useState(false);

  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingBottom: insets.bottom + 60 }],
    [insets.bottom]
  );

  const headerPaddingStyle = useMemo(
    () => ({ paddingTop: insets.top + 8 }),
    [insets.top]
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
    await Clipboard.setStringAsync(PLACEHOLDER_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDetailsStep = step === 'details';
  const isRequestDolarApp = selectedMethod?.type === 'request' && selectedMethod?.id === 'dolarapp-friend';

  return (
    <View style={styles.container}>
      <View style={[styles.header, headerPaddingStyle]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={isDetailsStep ? handleBack : undefined}
            activeOpacity={0.7}
          >
            {isDetailsStep ? (
              <Text style={styles.headerBackText}>←</Text>
            ) : (
              <UserIcon size={24} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isDetailsStep ? 'Receive' : 'Receive'}
          </Text>
          <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
            <HelpIcon size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {isDetailsStep
            ? isRequestDolarApp
              ? 'Share your link or QR to receive USDC'
              : 'Deposit in the currency below. Automatically converted to USDC.'
            : 'Add balance in local currency or USD. Automatically converted to USDC.'}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {step === 'choose' ? (
          <>
            <Text style={styles.sectionTitle}>ADD BALANCE TO DOLARAPP</Text>
            <View style={styles.card}>
              {ADD_BALANCE_OPTIONS.map((opt, index) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionRow,
                    index === ADD_BALANCE_OPTIONS.length - 1 && styles.optionRowLast,
                  ]}
                  onPress={() => handleSelectAddBalance(opt.id)}
                  activeOpacity={0.7}
                >
                  {opt.code === 'USD' ? (
                    <UsdcIcon size={CURRENCY_ICON_SIZE} />
                  ) : (
                    <CurrencyCodeIcon code={opt.code} size={CURRENCY_ICON_SIZE} />
                  )}
                  <View style={[styles.optionContent, { marginLeft: 12 }]}>
                    <Text style={styles.optionPrimary}>{opt.primary}</Text>
                    <Text style={styles.optionSecondary}>{opt.secondary}</Text>
                  </View>
                  <ChevronRightIcon size={20} color="#a1a1aa" />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>REQUEST PAYMENT</Text>
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
          </>
        ) : isRequestDolarApp ? (
          <>
            <View style={styles.card}>
              <View style={styles.qrContainer}>
                <View style={styles.qrPlaceholder}>
                  <Text style={styles.qrPlaceholderText}>QR</Text>
                </View>
              </View>
              <Text style={styles.qrHint}>Scan to pay or receive USDC</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Your wallet address</Text>
              <Text style={styles.addressHint}>
                Share this address or the QR. Anyone can send you USDC here.
              </Text>
              <Text style={styles.addressText} selectable>
                {PLACEHOLDER_ADDRESS}
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
            <Text style={styles.disclaimer}>
              Only send USDC and supported assets to this address. When sending to someone else, use their email or wallet address.
            </Text>
          </>
        ) : (
          (() => {
            const addId = selectedMethod?.type === 'add_balance' ? selectedMethod.id : null;
            const option = addId ? ADD_BALANCE_OPTIONS.find((o) => o.id === addId) : null;
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: BRAND_GREEN,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
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
    color: '#71717a',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
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
    borderBottomColor: '#eee',
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
    color: '#18181b',
  },
  optionSecondary: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  convertBanner: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181b',
    lineHeight: 22,
  },
  methodNote: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#18181b',
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
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e4e4e7',
  },
  qrPlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#d4d4d4',
  },
  qrHint: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 8,
  },
  addressHint: {
    fontSize: 13,
    color: '#71717a',
    lineHeight: 18,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181b',
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
    color: '#71717a',
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
