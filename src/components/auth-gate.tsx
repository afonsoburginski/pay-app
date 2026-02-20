'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native';

const BRAND_GREEN = '#16a34a';

/**
 * Redireciona para (auth)/login se não houver usuário; para (tabs) se houver e estiver em auth.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoading, user, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color={BRAND_GREEN} />
      </View>
    );
  }

  return <>{children}</>;
}
