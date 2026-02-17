import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  SendIcon,
  UserIcon,
} from '@/components/icons';

const BRAND_GREEN = '#16a34a';

const CURRENCY_ICON_SIZE = 28;

/** Send in the app is always in USDC. Options: (1) Send to another DolarApp user or (2) Withdraw to my bank (convert USDC → local currency). */
/** Official South American currencies – to withdraw USDC by converting to your currency and sending to bank. */
const WITHDRAW_CURRENCIES = [
  { id: 'cop', label: 'Colombian pesos (COP)', code: 'COP' as const },
  { id: 'ars', label: 'Argentine pesos (ARS)', code: 'ARS' as const },
  { id: 'brl', label: 'Brazilian reais (BRL)', code: 'BRL' as const },
] as const;

type WithdrawCurrency = (typeof WITHDRAW_CURRENCIES)[number];

export default function SendScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'choose' | 'amount'>('choose');
  const [isDolarAppSend, setIsDolarAppSend] = useState(false);
  const [selectedWithdrawCurrency, setSelectedWithdrawCurrency] = useState<WithdrawCurrency | null>(null);
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');

  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingBottom: insets.bottom + 60 }],
    [insets.bottom]
  );

  const headerPaddingStyle = useMemo(
    () => ({ paddingTop: insets.top + 8 }),
    [insets.top]
  );

  const handleSelectDolarApp = () => {
    setIsDolarAppSend(true);
    setSelectedWithdrawCurrency(null);
    setStep('amount');
    setAmount('');
    setToAddress('');
  };

  const handleSelectWithdraw = (currency: WithdrawCurrency) => {
    setSelectedWithdrawCurrency(currency);
    setIsDolarAppSend(false);
    setStep('amount');
    setAmount('');
    setToAddress('');
  };

  const handleBack = () => {
    setStep('choose');
    setSelectedWithdrawCurrency(null);
    setIsDolarAppSend(false);
    setAmount('');
    setToAddress('');
  };

  const handleSend = () => {
    // TODO: integrar envio real
  };

  const isAmountStep = step === 'amount';
  const isWithdraw = selectedWithdrawCurrency != null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, headerPaddingStyle]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={isAmountStep ? handleBack : undefined}
            activeOpacity={0.7}
          >
            {isAmountStep ? (
              <Text style={styles.headerBackText}>←</Text>
            ) : (
              <UserIcon size={24} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isAmountStep ? (isDolarAppSend ? 'Send USDC' : 'Withdraw to my bank') : 'Send'}
          </Text>
          <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
            <HelpIcon size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {isAmountStep
            ? isDolarAppSend
              ? 'Send USDC to another DolarApp user'
              : `Withdraw USDC → receive in ${selectedWithdrawCurrency?.label ?? ''} in your bank`
            : 'Send USDC to another user or withdraw to your bank'}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'choose' ? (
            <>
              <Text style={styles.sectionTitle}>SEND IN DOLARAPP</Text>
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.currencyRow}
                  onPress={handleSelectDolarApp}
                  activeOpacity={0.7}
                >
                  <View style={styles.dolarAppLogoWrap}>
                    <DolarAppLogoIcon width={28} height={22} color={DOLARAPP_WHITE} />
                  </View>
                  <View style={[styles.currencyContent, { marginLeft: 12 }]}>
                    <Text style={styles.currencyLabel}>In DolarApp</Text>
                    <Text style={styles.currencyBalance}>
                      Send USDC to another DolarApp user
                    </Text>
                  </View>
                  <ChevronRightIcon size={20} color="#a1a1aa" />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>WITHDRAW TO MY BANK</Text>
              <View style={styles.card}>
                {WITHDRAW_CURRENCIES.map((currency, index) => (
                  <TouchableOpacity
                    key={currency.id}
                    style={[
                      styles.currencyRow,
                      index === WITHDRAW_CURRENCIES.length - 1 && styles.currencyRowLast,
                    ]}
                    onPress={() => handleSelectWithdraw(currency)}
                    activeOpacity={0.7}
                  >
                    <CurrencyCodeIcon code={currency.code} size={CURRENCY_ICON_SIZE} />
                    <View style={[styles.currencyContent, { marginLeft: 12 }]}>
                      <Text style={styles.currencyLabel}>{currency.label}</Text>
                      <Text style={styles.currencyBalance}>
                        Convert USDC and receive in your bank account
                      </Text>
                    </View>
                    <ChevronRightIcon size={20} color="#a1a1aa" />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              {/* Balance always in USDC – single working currency */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Available balance</Text>
                <Text style={styles.balanceAmount}>1,051.33 USDC</Text>
                {isDolarAppSend && (
                  <Text style={styles.balanceNote}>Sending to another DolarApp account</Text>
                )}
                {selectedWithdrawCurrency && (
                  <Text style={styles.balanceNote}>
                    You will receive in {selectedWithdrawCurrency.label}
                  </Text>
                )}
              </View>

              {/* Amount and recipient (always in USDC) */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Amount (USDC)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#a1a1aa"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  editable
                />
                <View style={styles.inputDivider} />
                <Text style={[styles.cardLabel, styles.labelTo]}>
                  {isDolarAppSend ? 'Recipient (email or wallet address)' : 'Bank account / details'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={isDolarAppSend ? 'Email or wallet address' : 'Enter your bank account details'}
                  placeholderTextColor="#a1a1aa"
                  value={toAddress}
                  onChangeText={setToAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!amount.trim() || !toAddress.trim()) && styles.primaryButtonDisabled,
                ]}
                onPress={handleSend}
                activeOpacity={0.8}
                disabled={!amount.trim() || !toAddress.trim()}
              >
                <SendIcon size={20} color="#fff" focused={false} />
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>

              {isDolarAppSend && (
                <TouchableOpacity style={styles.linkButton} activeOpacity={0.7}>
                  <Text style={styles.linkButtonText}>Send to a contact</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  dolarAppLogoWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: BRAND_GREEN,
    borderRadius: 8,
  },
  currencyContent: {
    flex: 1,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
  },
  currencyBalance: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  currencyRowLast: {
    borderBottomWidth: 0,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181b',
  },
  balanceNote: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 6,
  },
  input: {
    fontSize: 17,
    fontWeight: '600',
    color: '#18181b',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e4e4e7',
    marginVertical: 8,
  },
  labelTo: {
    marginBottom: 8,
    marginTop: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BRAND_GREEN,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: '#a1a1aa',
    opacity: 0.8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  linkButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  linkButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND_GREEN,
    textDecorationLine: 'underline',
  },
});
