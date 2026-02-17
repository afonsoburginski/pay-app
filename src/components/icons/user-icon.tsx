/**
 * User icon (lucide-animated style). Ported to RN with react-native-svg.
 */

import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface UserIconProps {
  size?: number;
  color?: string;
}

export function UserIcon({ size = 24, color = 'currentColor' }: UserIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <Circle cx="12" cy="7" r="4" />
      </Svg>
    </View>
  );
}
