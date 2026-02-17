import { useDatabase } from '@nozbe/watermelondb/react';
import { useQuery } from '@tanstack/react-query';

import type Account from '@/database/models/Account';
import type DollarPrice from '@/database/models/DollarPrice';
import type Transaction from '@/database/models/Transaction';

export const accountQueryKey = ['account', 'balance'] as const;
export const transactionsQueryKey = ['transactions'] as const;
export const dollarPriceQueryKey = ['dollarPrice'] as const;

export function useAccountBalance() {
  const database = useDatabase();
  return useQuery({
    queryKey: accountQueryKey,
    queryFn: async (): Promise<number> => {
      const accounts = await database.get<Account>('accounts').query().fetch();
      return accounts[0]?.balanceUsdc ?? 0;
    },
  });
}

export function useTransactions() {
  const database = useDatabase();
  return useQuery({
    queryKey: transactionsQueryKey,
    queryFn: async (): Promise<Transaction[]> => {
      return database.get<Transaction>('transactions').query().fetch();
    },
  });
}

export function useDollarPrice() {
  const database = useDatabase();
  return useQuery({
    queryKey: dollarPriceQueryKey,
    queryFn: async (): Promise<{ buy: string; sell: string } | null> => {
      const prices = await database.get<DollarPrice>('dollar_prices').query().fetch();
      const first = prices[0];
      return first ? { buy: first.buy, sell: first.sell } : null;
    },
  });
}
