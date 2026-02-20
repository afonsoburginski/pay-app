/**
 * Avatar with image and fallback (BNA UI style).
 * Use AvatarImage for the photo and AvatarFallback when no image or load fails.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

export type AvatarImageSource = { uri: string } | number | null | undefined;

type AvatarContextValue = {
  size: number;
  imageOk: boolean;
  setImageOk: (ok: boolean) => void;
};

const AvatarContext = createContext<AvatarContextValue | null>(null);

function useAvatarContext() {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error('AvatarImage and AvatarFallback must be used inside Avatar');
  return ctx;
}

export type AvatarProps = {
  children: React.ReactNode;
  size?: number;
  style?: ViewStyle;
};

export function Avatar({ children, size = 40, style }: AvatarProps) {
  const [imageOk, setImageOk] = useState(false);
  const value: AvatarContextValue = { size, imageOk, setImageOk };

  return (
    <AvatarContext.Provider value={value}>
      <View style={[styles.wrapper, { width: size, height: size, borderRadius: size / 2 }, style]}>
        {children}
      </View>
    </AvatarContext.Provider>
  );
}

export type AvatarImageProps = {
  source: AvatarImageSource;
  style?: ImageStyle;
};

export function AvatarImage({ source, style }: AvatarImageProps) {
  const { size, imageOk, setImageOk } = useAvatarContext();

  const onLoad = useCallback(() => setImageOk(true), []);
  const onError = useCallback(() => setImageOk(false), []);

  const hasSource = source && (typeof source !== 'object' || !('uri' in source) || source.uri);
  useEffect(() => {
    if (!hasSource) setImageOk(false);
  }, [hasSource, setImageOk]);

  if (!hasSource) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, overflow: 'hidden' }]}>
      <Image
        source={typeof source === 'object' && 'uri' in source ? source : source}
        style={[{ width: size, height: size, opacity: imageOk ? 1 : 0 }, style]}
        contentFit="cover"
        onLoad={onLoad}
        onError={onError}
      />
    </View>
  );
}

export type AvatarFallbackProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function AvatarFallback({ children, style, textStyle }: AvatarFallbackProps) {
  const { size, imageOk } = useAvatarContext();

  if (imageOk) {
    return null;
  }

  const textStyles: TextStyle[] = [styles.fallbackText, { fontSize: size * 0.4 }];
  if (textStyle) textStyles.push(textStyle);

  return (
    <View style={[StyleSheet.absoluteFill, styles.fallback, { borderRadius: size / 2 }, style]}>
      {typeof children === 'string' ? (
        <Text style={textStyles} numberOfLines={1}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  fallback: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontWeight: '600',
  },
});
