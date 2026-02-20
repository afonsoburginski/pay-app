import { useRouter } from 'expo-router';
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
import { TabScreenHeader, useDefaultHeaderSlots } from '@/components/tab-screen-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { WithdrawalMethod } from '@/hooks/use-withdrawal-methods';
import { useWithdrawalMethods } from '@/hooks/use-withdrawal-methods';
import { WITHDRAW_CURRENCIES } from '@/lib/currencies';
import { Colors } from '@/theme/colors';

const BRAND_GREEN = '#16a34a';

const CURRENCY_ICON_SIZE = 28;

type WithdrawCurrency = (typeof WITHDRAW_CURRENCIES)[number];

function withdrawalMethodSummary(m: WithdrawalMethod): string {
  if (m.type === 'pix' && m.pix_key_value) return `Pix • ${m.pix_key_value}`;
  if (m.type === 'bank_account' && m.account_number) {
    const last4 = m.account_number.slice(-4);
    return m.bank_name ? `${m.bank_name} • ****${last4}` : `****${last4}`;
  }
  return m.label;
}

export default function SendScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { methodsByCurrency } = useWithdrawalMethods();

  const [step, setStep] = useState<'choose' | 'destination' | 'amount'>('choose');
  const [isDolarAppSend, setIsDolarAppSend] = useState(false);
  const [selectedWithdrawCurrency, setSelectedWithdrawCurrency] = useState<WithdrawCurrency | null>(null);
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<WithdrawalMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');

  const { leftSlot: defaultLeftSlot, rightSlot } = useDefaultHeaderSlots();
  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingBottom: insets.bottom + 60 }],
    [insets.bottom, styles.scrollContent]
  );

  const savedMethodsForCurrency = selectedWithdrawCurrency
    ? methodsByCurrency(selectedWithdrawCurrency.code)
    : [];

  const handleSelectDolarApp = () => {
    setIsDolarAppSend(true);
    setSelectedWithdrawCurrency(null);
    setSelectedWithdrawMethod(null);
    setStep('amount');
    setAmount('');
    setToAddress('');
  };

  const handleSelectWithdraw = (currency: WithdrawCurrency) => {
    setSelectedWithdrawCurrency(currency);
    setIsDolarAppSend(false);
    setSelectedWithdrawMethod(null);
    setStep('destination');
    setAmount('');
    setToAddress('');
  };

  const handleSelectDestination = (method: WithdrawalMethod | null) => {
    setSelectedWithdrawMethod(method);
    setStep('amount');
    setAmount('');
    if (!method) setToAddress('');
  };

  const handleBack = () => {
    if (step === 'amount') {
      if (selectedWithdrawCurrency && !isDolarAppSend) {
        setStep('destination');
        setAmount('');
        setToAddress('');
        setSelectedWithdrawMethod(null);
      } else {
        setStep('choose');
        setSelectedWithdrawCurrency(null);
        setIsDolarAppSend(false);
        setAmount('');
        setToAddress('');
      }
    } else if (step === 'destination') {
      setStep('choose');
      setSelectedWithdrawCurrency(null);
      setSelectedWithdrawMethod(null);
    } else {
      setStep('choose');
      setSelectedWithdrawCurrency(null);
      setIsDolarAppSend(false);
      setAmount('');
      setToAddress('');
      setSelectedWithdrawMethod(null);
    }
  };

  const handleSend = () => {
    // TODO: integrar envio real
  };

  const isAmountStep = step === 'amount';
  const isDestinationStep = step === 'destination';
  const isWithdraw = selectedWithdrawCurrency != null;
  const useManualDestination = isWithdraw && !selectedWithdrawMethod;

  const headerLeftSlot = isAmountStep || isDestinationStep ? (
    <TouchableOpacity style={styles.headerIcon} onPress={handleBack} activeOpacity={0.7}>
      <Text style={styles.headerBackText}>←</Text>
    </TouchableOpacity>
  ) : (
    defaultLeftSlot
  );

  return (
    <View style={styles.container}>
      <TabScreenHeader
        leftSlot={headerLeftSlot}
        title={
          isDestinationStep
            ? 'Withdraw to'
            : isAmountStep
              ? isDolarAppSend
                ? 'Send USDC'
                : 'Withdraw to my bank'
              : 'Send'
        }
        rightSlot={rightSlot}
        subtitle={
          isDestinationStep
            ? `Choose a saved account or Pix for ${selectedWithdrawCurrency?.label ?? ''}`
            : isAmountStep
              ? isDolarAppSend
                ? 'Send USDC to another DolarApp user'
                : `Withdraw USDC → receive in ${selectedWithdrawCurrency?.label ?? ''}`
              : 'Send USDC to another user or withdraw to your bank'
        }
      />

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
                        Convert USDC and receive in your bank or via Pix
                      </Text>
                    </View>
                    <ChevronRightIcon size={20} color="#a1a1aa" />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : step === 'destination' && selectedWithdrawCurrency ? (
            <>
              <Text style={styles.sectionTitle}>SAVED ACCOUNTS / PIX</Text>
              <View style={styles.card}>
                {savedMethodsForCurrency.length === 0 ? (
                  <Text style={styles.emptyMethodsText}>No saved account or Pix for this currency yet.</Text>
                ) : (
                  savedMethodsForCurrency.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      style={styles.currencyRow}
                      onPress={() => handleSelectDestination(method)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.currencyContent, { marginLeft: 0 }]}>
                        <Text style={styles.currencyLabel}>{method.label}</Text>
                        <Text style={styles.currencyBalance}>
                          {withdrawalMethodSummary(method)}
                        </Text>
                      </View>
                      <ChevronRightIcon size={20} color="#a1a1aa" />
                    </TouchableOpacity>
                  ))
                )}
                <TouchableOpacity
                  style={styles.currencyRow}
                  onPress={() =>
                    router.push({
                      pathname: '/add-withdrawal-method',
                      params: { currency: selectedWithdrawCurrency.code },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={[styles.currencyContent, { marginLeft: 0 }]}>
                    <Text style={[styles.currencyLabel, { color: BRAND_GREEN }]}>Add bank account or Pix</Text>
                    <Text style={styles.currencyBalance}>
                      Save a new account or Pix for future withdrawals
                    </Text>
                  </View>
                  <ChevronRightIcon size={20} color="#a1a1aa" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.currencyRow, styles.currencyRowLast]}
                  onPress={() => handleSelectDestination(null)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.currencyContent, { marginLeft: 0 }]}>
                    <Text style={styles.currencyLabel}>Enter details manually this time</Text>
                    <Text style={styles.currencyBalance}>
                      Don't save — just use once
                    </Text>
                  </View>
                  <ChevronRightIcon size={20} color="#a1a1aa" />
                </TouchableOpacity>
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
                    {selectedWithdrawMethod && ` → ${selectedWithdrawMethod.label}`}
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
                {isDolarAppSend && (
                  <>
                    <View style={styles.inputDivider} />
                    <Text style={[styles.cardLabel, styles.labelTo]}>Recipient (email or wallet address)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Email or wallet address"
                      placeholderTextColor="#a1a1aa"
                      value={toAddress}
                      onChangeText={setToAddress}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </>
                )}
                {useManualDestination && (
                  <>
                    <View style={styles.inputDivider} />
                    <Text style={[styles.cardLabel, styles.labelTo]}>Bank account / Pix details</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Account number, Pix key, or transfer details"
                      placeholderTextColor="#a1a1aa"
                      value={toAddress}
                      onChangeText={setToAddress}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </>
                )}
                {selectedWithdrawMethod && (
                  <>
                    <View style={styles.inputDivider} />
                    <Text style={[styles.cardLabel, styles.labelTo]}>Withdraw to</Text>
                    <Text style={styles.savedMethodSummary}>{withdrawalMethodSummary(selectedWithdrawMethod)}</Text>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!amount.trim() || (isDolarAppSend ? !toAddress.trim() : useManualDestination ? !toAddress.trim() : false)) &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={handleSend}
                activeOpacity={0.8}
                disabled={
                  !amount.trim() ||
                  (isDolarAppSend ? !toAddress.trim() : useManualDestination ? !toAddress.trim() : false)
                }
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
    currencyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
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
      color: colors.text,
    },
    currencyBalance: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    emptyMethodsText: {
      fontSize: 14,
      color: colors.textMuted,
      paddingVertical: 8,
    },
    savedMethodSummary: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      paddingVertical: 4,
    },
    currencyRowLast: {
      borderBottomWidth: 0,
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    balanceAmount: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    balanceNote: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 6,
    },
    input: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      paddingVertical: 12,
      paddingHorizontal: 0,
    },
    inputDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
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
      backgroundColor: colors.input,
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
}
