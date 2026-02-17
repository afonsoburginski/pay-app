/**
 * Credit cards / cards icon (lucide-animated style). Ported to RN with react-native-svg.
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

interface CreditCardsIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export function CreditCardsIcon({ size = 26, color = 'currentColor', focused = false }: CreditCardsIconProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.1 : 1, { duration: 150 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Rect x="2" y="5" width="20" height="14" rx="2" />
          <Path d="M2 10h20" />
        </Svg>
      </Animated.View>
    </View>
  );
}
