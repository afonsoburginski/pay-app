import { useAuth } from '@/components/auth-provider';
import { ChevronRightIcon, MoonIcon, SunIcon, UserIcon } from '@/components/icons';
import { useI18n } from '@/components/i18n-provider';
import { useAvatarUpload } from '@/hooks/use-avatar-upload';
import {
  CURRENCIES,
  LANGUAGES,
  useProfile,
} from '@/hooks/use-profile';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeMode } from '@/theme/theme-mode-context';
import { Colors } from '@/theme/colors';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND_GREEN = '#16a34a';
const CONTENT_PADDING = 20;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { t, locale, setLocale } = useI18n();
  const { pickAndUploadAvatar, uploading: avatarUploading, error: avatarError } = useAvatarUpload();

  const colorScheme = useColorScheme() ?? 'light';
  const { themeMode, setThemeMode } = useThemeMode();
  const [phoneInput, setPhoneInput] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'language' | 'currency' | null>(null);
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isDark = themeMode === 'dark';
  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  const handleSavePhone = useCallback(async () => {
    setSaving(true);
    await updateProfile({ phone: phoneInput.trim() || null });
    setSaving(false);
  }, [phoneInput, updateProfile]);

  const handleSelectLanguage = useCallback(
    async (code: 'pt' | 'en') => {
      setOpenDropdown(null);
      setSaving(true);
      await setLocale(code);
      setSaving(false);
    },
    [setLocale]
  );

  useEffect(() => {
    setPhoneInput(profile?.phone ?? '');
  }, [profile?.phone]);

  const displayName = user
    ? ((user.user_metadata?.display_name as string) ||
       (user.user_metadata?.full_name as string) ||
       user.email?.split('@')[0] ||
       'User')
    : t('guest');
  const email = user?.email ?? t('signInToSync');

  const currencyLabel = CURRENCIES.find((c) => c.code === (profile?.preferred_currency ?? 'BRL'))?.label ?? profile?.preferred_currency ?? 'BRL';
  const languageLabel = LANGUAGES.find((l) => l.code === (locale ?? 'pt'))?.label ?? 'Português';

  const handleSelectCurrency = useCallback(
    async (code: string) => {
      setOpenDropdown(null);
      setSaving(true);
      await updateProfile({ preferred_currency: code });
      setSaving(false);
    },
    [updateProfile]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.contentContainer, styles.headerRow]}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}
          >
            <ChevronRightIcon size={24} color="#fff" style={styles.backChevron} />
            <Text style={styles.headerTitle}>{t('profile')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.contentContainer, styles.heroProfile]}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={pickAndUploadAvatar}
            disabled={avatarUploading}
            activeOpacity={0.8}
          >
            {avatarUploading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <UserIcon size={48} color="#fff" />
            )}
          </TouchableOpacity>
          {avatarError ? <Text style={styles.avatarError}>{avatarError}</Text> : null}
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentContainer, styles.cardsWrapper]}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('account').toUpperCase()}</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('email')}</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {email}
              </Text>
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>{t('phone')}</Text>
              <TextInput
                style={styles.inlineInput}
                placeholder="+55 11 99999 9999"
                placeholderTextColor={colors.textMuted}
                value={phoneInput}
                onChangeText={setPhoneInput}
                onBlur={handleSavePhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                editable={!saving}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('preferences').toUpperCase()}</Text>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => setOpenDropdown(openDropdown === 'currency' ? null : 'currency')}
            >
              <Text style={styles.rowLabel}>{t('localCurrency')}</Text>
              <Text style={styles.rowValue}>{currencyLabel}</Text>
              <ChevronRightIcon
                size={18}
                color={colors.icon}
                style={[styles.dropdownChevron, openDropdown === 'currency' && styles.dropdownChevronOpen]}
              />
            </TouchableOpacity>
            {openDropdown === 'currency' && (
              <View style={styles.dropdownMenu}>
                {CURRENCIES.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={styles.dropdownOption}
                    onPress={() => handleSelectCurrency(c.code)}
                    disabled={saving}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownOptionText}>{c.label}</Text>
                    {(profile?.preferred_currency ?? 'BRL') === c.code && (
                      <Text style={styles.dropdownOptionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => setOpenDropdown(openDropdown === 'language' ? null : 'language')}
            >
              <Text style={styles.rowLabel}>{t('language')}</Text>
              <Text style={styles.rowValue}>{languageLabel}</Text>
              <ChevronRightIcon
                size={18}
                color={colors.icon}
                style={[styles.dropdownChevron, openDropdown === 'language' && styles.dropdownChevronOpen]}
              />
            </TouchableOpacity>
            {openDropdown === 'language' && (
              <View style={styles.dropdownMenu}>
                {LANGUAGES.map((l) => (
                  <TouchableOpacity
                    key={l.code}
                    style={styles.dropdownOption}
                    onPress={() => handleSelectLanguage(l.code)}
                    disabled={saving}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownOptionText}>{l.label}</Text>
                    {locale === l.code && <Text style={styles.dropdownOptionCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>{t('changeTheme')}</Text>
              <View style={styles.themeButtonSpacer} />
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                ]}
                onPress={toggleTheme}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {isDark ? (
                  <MoonIcon size={24} color={colors.icon} />
                ) : (
                  <SunIcon size={24} color={colors.icon} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    header: {
      backgroundColor: BRAND_GREEN,
      paddingBottom: 32,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    contentContainer: {
      paddingHorizontal: CONTENT_PADDING,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    backChevron: {
      transform: [{ rotate: '180deg' }],
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
    },
    heroProfile: {
      alignItems: 'center',
      paddingBottom: 8,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      overflow: 'hidden',
    },
    avatarImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
    },
    avatarError: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.9)',
      marginBottom: 8,
    },
    displayName: {
      fontSize: 22,
      fontWeight: '700',
      color: '#fff',
      marginBottom: 4,
    },
    email: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
    },
    scroll: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollContent: {
      paddingTop: 24,
      gap: 16,
    },
    cardsWrapper: {
      gap: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 8,
    },
  rowLast: {
    borderBottomWidth: 0,
  },
  inlineInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    minWidth: 0,
  },
  dropdownChevron: {},
  dropdownChevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  dropdownMenu: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: colors.text,
  },
  dropdownOptionCheck: {
    fontSize: 15,
    color: BRAND_GREEN,
    fontWeight: '700',
  },
  themeButtonSpacer: {
    flex: 1,
  },
  themeButton: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 0,
      minWidth: 80,
    },
    rowValue: {
      flex: 1,
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'right',
    },
  });
}
