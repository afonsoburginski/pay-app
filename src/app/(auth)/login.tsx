import { useAuth } from '@/components/auth-provider';
import { useI18n } from '@/components/i18n-provider';
import { AppleIcon, GoogleIcon } from '@/components/icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { signInWithOAuth } from '@/lib/auth-helpers';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/theme/colors';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

const BRAND_GREEN = '#16a34a';
const AUTH_BG_GREEN = '#15803d';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const { refreshSession } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = useCallback(async () => {
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) {
        setError(err.message);
        return;
      }
      await refreshSession();
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  }, [email, password, refreshSession, router]);

  const handleOAuth = useCallback(async (provider: 'google' | 'apple') => {
    setError(null);
    setOauthLoading(provider);
    try {
      const { error: err } = await signInWithOAuth(provider);
      if (err) {
        setError(err.message);
        return;
      }
      await refreshSession();
      router.replace('/(tabs)');
    } finally {
      setOauthLoading(null);
    }
  }, [refreshSession, router]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 48,
              paddingBottom: insets.bottom + 40,
              paddingHorizontal: 28,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t('signIn')}</Text>
          <Text style={styles.subtitle}>{t('signInSubtitle')}</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.socialStack}>
            <TouchableOpacity
              style={[styles.socialBtn, oauthLoading && styles.socialBtnDisabled]}
              onPress={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              activeOpacity={0.7}
            >
              {oauthLoading === 'google' ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <>
                  <GoogleIcon size={22} />
                  <Text style={styles.socialBtnLabel}>{t('continueWithGoogle')}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialBtn, styles.socialBtnApple, oauthLoading && styles.socialBtnDisabled]}
              onPress={() => handleOAuth('apple')}
              disabled={!!oauthLoading}
              activeOpacity={0.7}
            >
              {oauthLoading === 'apple' ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <AppleIcon size={22} color="#fff" />
                  <Text style={[styles.socialBtnLabel, styles.socialBtnLabelApple]}>{t('continueWithApple')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
            <View style={styles.dividerLine} />
          </View>

            <TextInput
              style={styles.input}
              placeholder={t('email')}
              placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(null); }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!loading}
          />
            <TextInput
              style={styles.input}
              placeholder={t('password')}
              placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={(t) => { setPassword(t); setError(null); }}
            secureTextEntry
            autoComplete="password"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleEmailSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryBtnLabel}>{t('signInWithEmail')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => router.push('/(auth)/sign-up')}
            activeOpacity={0.7}
          >
            <Text style={styles.footerLinkText}>{t('dontHaveAccount')}</Text>
            <Text style={styles.footerLinkBold}>{t('createOne')}</Text>
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
    backgroundColor: AUTH_BG_GREEN,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.destructive,
  },
  socialStack: {
    gap: 12,
    marginBottom: 28,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 0,
    minHeight: 54,
  },
  socialBtnApple: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  socialBtnDisabled: {
    opacity: 0.6,
  },
  socialBtnLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  socialBtnLabelApple: {
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dividerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 0,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 8,
  },
  primaryBtnLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND_GREEN,
  },
  primaryBtnDisabled: {
    opacity: 0.8,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerLinkText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
  footerLinkBold: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  });
}
