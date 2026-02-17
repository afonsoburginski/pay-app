/**
 * Wallet icon (lucide-animated style). Ported to RN with react-native-svg.
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface WalletIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export function WalletIcon({ size = 26, color = 'currentColor', focused = false }: WalletIconProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.1 : 1, { duration: 150 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <Path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </Svg>
      </Animated.View>
    </View>
  );
}
