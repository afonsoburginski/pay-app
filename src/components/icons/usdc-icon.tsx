/**
 * Ícone USDC (USD Coin) – asset local.
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface UsdcIconProps {
  size?: number;
}

export function UsdcIcon({ size = 24 }: UsdcIconProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Image
        source={require('./usdc.png')}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  image: {
    borderRadius: 999,
  },
});
