'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DatabaseProvider as WmelonProvider } from '@nozbe/watermelondb/react';
import { database } from '@/database';
import { seedIfEmpty } from '@/database/seed';
import { accountQueryKey, dollarPriceQueryKey, transactionsQueryKey } from '@/hooks/use-account-data';

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    seedIfEmpty()
      .then(() => {
        if (!cancelled) {
          queryClient.invalidateQueries({ queryKey: accountQueryKey });
          queryClient.invalidateQueries({ queryKey: transactionsQueryKey });
          queryClient.invalidateQueries({ queryKey: dollarPriceQueryKey });
          setReady(true);
        }
      })
      .catch((err) => {
        console.error('Database seed error:', err);
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return <WmelonProvider database={database}>{children}</WmelonProvider>;
}
