import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export type WithdrawalMethodType = 'bank_account' | 'pix';

export type PixKeyType = 'email' | 'phone' | 'cpf' | 'random';

export type WithdrawalMethod = {
  id: string;
  user_id: string;
  currency: string;
  type: WithdrawalMethodType;
  label: string;
  bank_name: string | null;
  account_number: string | null;
  routing_number: string | null;
  branch: string | null;
  account_type: string | null;
  beneficiary: string | null;
  pix_key_type: PixKeyType | null;
  pix_key_value: string | null;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type WithdrawalMethodInsert = {
  user_id: string;
  currency: string;
  type: WithdrawalMethodType;
  label: string;
  bank_name?: string | null;
  account_number?: string | null;
  routing_number?: string | null;
  branch?: string | null;
  account_type?: string | null;
  beneficiary?: string | null;
  pix_key_type?: PixKeyType | null;
  pix_key_value?: string | null;
  is_default?: boolean;
};

const queryKey = ['withdrawal_methods'] as const;

export function useWithdrawalMethods() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: methods = [], isLoading } = useQuery({
    queryKey: [...queryKey, user?.id ?? ''],
    queryFn: async (): Promise<WithdrawalMethod[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('withdrawal_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as WithdrawalMethod[];
    },
    enabled: !!user?.id,
  });

  const methodsByCurrency = useCallback(
    (currency: string) => methods.filter((m) => m.currency === currency),
    [methods]
  );

  const addMethod = useCallback(
    async (input: Omit<WithdrawalMethodInsert, 'user_id'>) => {
      if (!user?.id) return { error: new Error('Not authenticated') };
      const { error } = await supabase.from('withdrawal_methods').insert({
        ...input,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      });
      if (error) return { error };
      await queryClient.invalidateQueries({ queryKey });
      return { error: null };
    },
    [user?.id, queryClient]
  );

  const updateMethod = useCallback(
    async (id: string, updates: Partial<Omit<WithdrawalMethod, 'id' | 'user_id' | 'created_at'>>) => {
      if (!user?.id) return { error: new Error('Not authenticated') };
      const { error } = await supabase
        .from('withdrawal_methods')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) return { error };
      await queryClient.invalidateQueries({ queryKey });
      return { error: null };
    },
    [user?.id, queryClient]
  );

  const deleteMethod = useCallback(
    async (id: string) => {
      if (!user?.id) return { error: new Error('Not authenticated') };
      const { error } = await supabase.from('withdrawal_methods').delete().eq('id', id).eq('user_id', user.id);
      if (error) return { error };
      await queryClient.invalidateQueries({ queryKey });
      return { error: null };
    },
    [user?.id, queryClient]
  );

  return {
    methods,
    methodsByCurrency,
    isLoading,
    addMethod,
    updateMethod,
    deleteMethod,
  };
}
