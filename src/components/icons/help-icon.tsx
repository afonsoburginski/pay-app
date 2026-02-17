/**
 * Help / circle-help icon (lucide-animated style). Ported to RN with react-native-svg.
 */

import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface HelpIconProps {
  size?: number;
  color?: string;
}

export function HelpIcon({ size = 24, color = 'currentColor' }: HelpIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <Path d="M12 17h.01" />
      </Svg>
    </View>
  );
}
