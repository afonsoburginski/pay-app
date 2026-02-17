/**
 * Animated Send icon (lucide-animated style).
 * Inlined from https://lucide-animated.com – no external lib.
 * Ported to React Native with react-native-reanimated + react-native-svg.
 * Lucide/Feather send – paper plane.
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface SendIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export function SendIcon({
  size = 28,
  color = 'currentColor',
  focused = false,
}: SendIconProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M22 2L11 13" />
          <Path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </Svg>
      </Animated.View>
    </View>
  );
}
