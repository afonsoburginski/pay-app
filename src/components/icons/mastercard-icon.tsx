/**
 * Ícone Mastercard (SVG oficial).
 */

import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface MastercardIconProps {
  size?: number;
}

export function MastercardIcon({ size = 32 }: MastercardIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          fill="#FF5F00"
          d="M15.245 17.831h-6.49V6.168h6.49v11.663z"
        />
        <Path
          fill="#EB001B"
          d="M9.167 12A7.404 7.404 0 0 1 12 6.169 7.417 7.417 0 0 0 0 12a7.417 7.417 0 0 0 11.999 5.831A7.406 7.406 0 0 1 9.167 12z"
        />
        <Path
          fill="#F79E1B"
          d="M24 12a7.417 7.417 0 0 1-12 5.831c1.725-1.358 2.833-3.465 2.833-5.831S13.725 7.527 12 6.169A7.417 7.417 0 0 1 24 12z"
        />
      </Svg>
    </View>
  );
}
