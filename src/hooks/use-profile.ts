import { useAuth } from '@/components/auth-provider';
import { CURRENCIES_FOR_PROFILE } from '@/lib/currencies';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export type Profile = {
  id: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_currency: string | null;
  preferred_language: string | null;
  created_at: string;
  updated_at: string;
};

const profileQueryKey = ['profile'] as const;

/** Lista de moedas para preferência no perfil (re-export da fonte única). */
export const CURRENCIES = CURRENCIES_FOR_PROFILE;

export const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
] as const;

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: profileQueryKey,
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, phone, avatar_url, preferred_currency, preferred_language, created_at, updated_at')
        .eq('id', user.id)
        .single();
      if (error || !data) return null;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useCallback(
    async (updates: Partial<Pick<Profile, 'phone' | 'display_name' | 'avatar_url' | 'preferred_currency' | 'preferred_language'>>) => {
      if (!user?.id) return { error: new Error('Not authenticated') };
      const { error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', user.id);
      if (error) return { error };
      await queryClient.invalidateQueries({ queryKey: profileQueryKey });
      return { error: null };
    },
    [user?.id, queryClient]
  );

  return { profile, isLoading, updateProfile };
}
