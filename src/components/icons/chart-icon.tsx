/**
 * Trending-up / chart icon (lucide-animated style). Ported to RN with react-native-svg.
 */

import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChartIconProps {
  size?: number;
  color?: string;
}

export function ChartIcon({ size = 24, color = 'currentColor' }: ChartIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="m22 7-8.5 8.5-5-5L2 17" />
      </Svg>
    </View>
  );
}
