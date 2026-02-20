import { useRouter, useLocalSearchParams } from 'expo-router';
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

import { TabScreenHeader } from '@/components/tab-screen-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PixKeyType, WithdrawalMethodInsert } from '@/hooks/use-withdrawal-methods';
import { useWithdrawalMethods } from '@/hooks/use-withdrawal-methods';
import { WITHDRAW_CURRENCIES } from '@/lib/currencies';
import { Colors } from '@/theme/colors';

const BRAND_GREEN = '#16a34a';

const PIX_KEY_TYPES: { value: PixKeyType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'cpf', label: 'CPF' },
  { value: 'random', label: 'Random key' },
];

export default function AddWithdrawalMethodScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ currency?: string }>();
  const currency = (params.currency ?? 'BRL').toUpperCase() as 'BRL' | 'COP' | 'ARS' | 'USD';

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { addMethod } = useWithdrawalMethods();

  const [type, setType] = useState<'bank_account' | 'pix'>('pix');
  const [label, setLabel] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('email');
  const [pixKeyValue, setPixKeyValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currencyLabel = WITHDRAW_CURRENCIES.find((c) => c.code === currency)?.label ?? currency;

  const canSave =
    label.trim() !== '' &&
    (type === 'pix'
      ? pixKeyValue.trim() !== ''
      : accountNumber.trim() !== '');

  const handleSave = async () => {
    if (!canSave) return;
    setError(null);
    setSaving(true);

    const insert: Omit<WithdrawalMethodInsert, 'user_id'> = {
      currency,
      type,
      label: label.trim(),
      is_default: false,
    };

    if (type === 'bank_account') {
      insert.bank_name = bankName.trim() || null;
      insert.account_number = accountNumber.trim();
      insert.routing_number = routingNumber.trim() || null;
      insert.branch = branch.trim() || null;
      insert.beneficiary = beneficiary.trim() || null;
    } else {
      insert.pix_key_type = pixKeyType;
      insert.pix_key_value = pixKeyValue.trim();
    }

    const { error: err } = await addMethod(insert);
    setSaving(false);
    if (err) {
      setError(err.message ?? 'Failed to save');
      return;
    }
    router.back();
  };

  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingBottom: insets.bottom + 24 }],
    [insets.bottom, styles.scrollContent]
  );

  return (
    <View style={styles.container}>
      <TabScreenHeader
        leftSlot={
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.headerBackText}>←</Text>
          </TouchableOpacity>
        }
        title="Add account or Pix"
        rightSlot={<View style={styles.headerIcon} />}
        subtitle={`For ${currencyLabel}`}
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
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'pix' && styles.typeButtonActive]}
                onPress={() => setType('pix')}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeButtonText, type === 'pix' && styles.typeButtonTextActive]}>Pix</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'bank_account' && styles.typeButtonActive]}
                onPress={() => setType('bank_account')}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeButtonText, type === 'bank_account' && styles.typeButtonTextActive]}>
                  Bank account
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Label (e.g. Nubank, Pix email)</Text>
            <TextInput
              style={styles.input}
              placeholder="My account"
              placeholderTextColor="#a1a1aa"
              value={label}
              onChangeText={setLabel}
              autoCapitalize="words"
            />
          </View>

          {type === 'pix' ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Pix key type</Text>
                <View style={styles.pixKeyTypeRow}>
                  {PIX_KEY_TYPES.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.pixKeyTypeChip, pixKeyType === opt.value && styles.pixKeyTypeChipActive]}
                      onPress={() => setPixKeyType(opt.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.pixKeyTypeChipText, pixKeyType === opt.value && styles.pixKeyTypeChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>
                  {pixKeyType === 'email' ? 'Email' : pixKeyType === 'phone' ? 'Phone' : pixKeyType === 'cpf' ? 'CPF' : 'Chave aleatória'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    pixKeyType === 'email'
                      ? 'email@example.com'
                      : pixKeyType === 'phone'
                        ? '+55 11 99999-9999'
                        : pixKeyType === 'cpf'
                          ? '000.000.000-00'
                          : 'Pix key value'
                  }
                  placeholderTextColor="#a1a1aa"
                  value={pixKeyValue}
                  onChangeText={setPixKeyValue}
                  keyboardType={pixKeyType === 'email' ? 'email-address' : pixKeyType === 'phone' ? 'phone-pad' : 'default'}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Bank name (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Nubank"
                  placeholderTextColor="#a1a1aa"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Account number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Account number"
                  placeholderTextColor="#a1a1aa"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="number-pad"
                />
              </View>
              {(currency === 'USD' || currency === 'COP' || currency === 'ARS') && (
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>{currency === 'USD' ? 'Routing number' : 'Routing / reference (optional)'}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Routing number"
                    placeholderTextColor="#a1a1aa"
                    value={routingNumber}
                    onChangeText={setRoutingNumber}
                    keyboardType="number-pad"
                  />
                </View>
              )}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Branch (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Branch"
                  placeholderTextColor="#a1a1aa"
                  value={branch}
                  onChangeText={setBranch}
                />
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Beneficiary name (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor="#a1a1aa"
                  value={beneficiary}
                  onChangeText={setBeneficiary}
                  autoCapitalize="words"
                />
              </View>
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, (!canSave || saving) && styles.primaryButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!canSave || saving}
          >
            <Text style={styles.primaryButtonText}>{saving ? 'Saving…' : 'Save account'}</Text>
          </TouchableOpacity>
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
    keyboardView: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 24,
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
    cardLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    input: {
      fontSize: 16,
      color: colors.text,
      paddingVertical: 12,
      paddingHorizontal: 0,
    },
    typeRow: {
      flexDirection: 'row',
      gap: 12,
    },
    typeButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colors.secondary,
      alignItems: 'center',
    },
    typeButtonActive: {
      backgroundColor: BRAND_GREEN,
    },
    typeButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    typeButtonTextActive: {
      color: '#fff',
    },
    pixKeyTypeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    pixKeyTypeChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: colors.secondary,
    },
    pixKeyTypeChipActive: {
      backgroundColor: BRAND_GREEN,
    },
    pixKeyTypeChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    pixKeyTypeChipTextActive: {
      color: '#fff',
    },
    errorText: {
      fontSize: 14,
      color: '#dc2626',
      marginBottom: 12,
    },
    primaryButton: {
      backgroundColor: BRAND_GREEN,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      marginBottom: 24,
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
  });
}
