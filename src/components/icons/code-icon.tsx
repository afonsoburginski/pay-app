/**
 * Code icon (lucide style). Ported to RN with react-native-svg.
 */

import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';

interface CodeIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function CodeIcon({ size = 24, color = 'currentColor', style }: CodeIconProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="16 18 22 12 16 6" />
        <Polyline points="8 6 2 12 8 18" />
      </Svg>
    </View>
  );
}
