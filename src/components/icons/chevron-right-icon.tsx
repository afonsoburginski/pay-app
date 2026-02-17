/**
 * Chevron right icon (lucide-animated style). Ported to RN with react-native-svg.
 */

import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChevronRightIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function ChevronRightIcon({ size = 18, color = 'currentColor', style }: ChevronRightIconProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="m9 18 6-6-6-6" />
      </Svg>
    </View>
  );
}
