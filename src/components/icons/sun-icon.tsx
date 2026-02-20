/**
 * Sun icon (light theme). react-native-svg.
 */

import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface SunIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function SunIcon({ size = 22, color = 'currentColor', style }: SunIconProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="4" />
        <Path d="M12 2v2" />
        <Path d="M12 20v2" />
        <Path d="m4.93 4.93 1.41 1.41" />
        <Path d="m17.66 17.66 1.41 1.41" />
        <Path d="M2 12h2" />
        <Path d="M20 12h2" />
        <Path d="m6.34 17.66-1.41 1.41" />
        <Path d="m19.07 4.93-1.41 1.41" />
      </Svg>
    </View>
  );
}
