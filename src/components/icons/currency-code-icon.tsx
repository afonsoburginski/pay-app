/**
 * Ícone para moedas fiduciárias (COP, ARS, BRL, USD) – código em círculo.
 * CoinMarketCap e similares não oferecem ícones para moedas comuns; este fallback evita emoji/bandeira.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CurrencyCodeIconProps {
  code: string;
  size?: number;
}

export function CurrencyCodeIcon({ code, size = 24 }: CurrencyCodeIconProps) {
  const fontSize = Math.max(10, size * 0.4);
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.code, { fontSize }]} numberOfLines={1}>
        {code.slice(0, 3)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  code: {
    fontWeight: '700',
    color: '#52525b',
    letterSpacing: -0.5,
  },
});
