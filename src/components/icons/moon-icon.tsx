/**
 * Moon icon (dark theme). react-native-svg.
 */

import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface MoonIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function MoonIcon({ size = 22, color = 'currentColor', style }: MoonIconProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </Svg>
    </View>
  );
}
