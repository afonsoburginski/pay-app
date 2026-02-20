import * as WebBrowser from 'expo-web-browser';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

// Necessário para completar sessão OAuth no retorno (ex.: web)
WebBrowser.maybeCompleteAuthSession();

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
