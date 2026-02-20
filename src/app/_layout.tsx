import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import 'react-native-reanimated';

import { AuthGate } from '@/components/auth-gate';
import { AuthProvider } from '@/components/auth-provider';
import { DatabaseProvider } from '@/components/database-provider';
import { I18nProvider } from '@/components/i18n-provider';
import { createQueryClient } from '@/lib/query-client';
import { ThemeModeProvider } from '@/theme/theme-mode-context';
import { ThemeProvider } from '@/theme/theme-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ThemeModeProvider>
      <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DatabaseProvider>
            <AuthGate>
              <I18nProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="add-withdrawal-method" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              </I18nProvider>
            </AuthGate>
            <StatusBar style="auto" />
          </DatabaseProvider>
        </AuthProvider>
      </QueryClientProvider>
      </ThemeProvider>
    </ThemeModeProvider>
  );
}
