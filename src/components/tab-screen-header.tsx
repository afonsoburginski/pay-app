import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HelpIcon, UserIcon } from '@/components/icons';
import { useProfile } from '@/hooks/use-profile';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const HEADER_AVATAR_SIZE = 32;

const BRAND_GREEN = '#16a34a';
const CONTENT_PADDING = 20;

export type TabScreenHeaderProps = {
  /** Conteúdo à esquerda (ex.: ícone de perfil ou botão voltar) */
  leftSlot: React.ReactNode;
  /** Título central */
  title: string;
  /** Conteúdo à direita (ex.: ícone de ajuda) */
  rightSlot: React.ReactNode;
  /** Texto opcional abaixo da linha do título */
  subtitle?: string;
  /** Conteúdo opcional abaixo do título/subtitle (ex.: hero com saldo e botões na Account) */
  children?: React.ReactNode;
};

/**
 * Header verde padrão das telas de tab (Account, Send, Receive, Cards).
 * Mesmo layout e espaçamento da tela Account para manter consistência.
 */
export function TabScreenHeader({ leftSlot, title, rightSlot, subtitle, children }: TabScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          {leftSlot}
          <Text style={styles.headerTitle}>{title}</Text>
          {rightSlot}
        </View>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: BRAND_GREEN,
    paddingBottom: 56,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  contentContainer: {
    paddingHorizontal: CONTENT_PADDING,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: -12,
    marginBottom: 4,
  },
});

/** Slots padrão: avatar do usuário (ou fallback) que leva ao profile, e ícone de ajuda */
export function useDefaultHeaderSlots() {
  const router = useRouter();
  const { profile } = useProfile();
  return {
    leftSlot: (
      <TouchableOpacity
        onPress={() => router.push('/profile')}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Avatar size={HEADER_AVATAR_SIZE}>
          <AvatarImage source={profile?.avatar_url ? { uri: profile.avatar_url } : null} />
          <AvatarFallback>
            <UserIcon size={HEADER_AVATAR_SIZE * 0.65} color="#fff" />
          </AvatarFallback>
        </Avatar>
      </TouchableOpacity>
    ),
    rightSlot: (
      <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <HelpIcon size={24} color="#fff" />
      </TouchableOpacity>
    ),
  };
}
