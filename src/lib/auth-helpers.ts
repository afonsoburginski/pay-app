import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

export type AuthProvider = 'google' | 'apple';

/**
 * Abre OAuth do Supabase (Google ou Apple) e completa a sessão com o redirect.
 */
export async function signInWithOAuth(provider: AuthProvider): Promise<{ error: Error | null }> {
  try {
    const redirectTo = Linking.createURL('auth/callback');

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (oauthError) return { error: oauthError };
    if (!data?.url) return { error: new Error('No OAuth URL returned') };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type !== 'success' || !result.url) {
      return { error: result.type === 'cancel' ? null : new Error('Auth was cancelled or failed') };
    }

    const err = await setSessionFromUrl(result.url);
    return { error: err };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}

/**
 * Extrai tokens da URL de redirect e define a sessão no Supabase.
 */
export async function setSessionFromUrl(url: string): Promise<Error | null> {
  try {
    const parsed = new URL(url);
    const params = parsed.hash ? new URLSearchParams(parsed.hash.slice(1)) : parsed.searchParams;
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token || !refresh_token) {
      const err = params.get('error_description') ?? params.get('error') ?? 'Missing tokens in URL';
      return new Error(String(err));
    }

    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    return error ?? null;
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e));
  }
}
