import { Tabs } from 'expo-router';
import React from 'react';

import {
  BanknotesIcon,
  CreditCardsIcon,
  SendIcon,
  WalletIcon,
} from '@/components/icons';
import { HapticTab } from '@/components/ui/haptic-tab';

const TAB_GREEN = '#16a34a';
const TAB_GRAY = '#71717a';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_GREEN,
        tabBarInactiveTintColor: TAB_GRAY,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => (
            <WalletIcon
              size={26}
              color={focused ? TAB_GREEN : TAB_GRAY}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'Cards',
          tabBarIcon: ({ focused }) => (
            <CreditCardsIcon
              size={26}
              color={focused ? TAB_GREEN : TAB_GRAY}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: 'Send',
          tabBarIcon: ({ focused }) => (
            <SendIcon
              size={26}
              color={focused ? TAB_GREEN : TAB_GRAY}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="receive"
        options={{
          title: 'Receive',
          tabBarIcon: ({ focused }) => (
            <BanknotesIcon
              size={26}
              color={focused ? TAB_GREEN : TAB_GRAY}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
