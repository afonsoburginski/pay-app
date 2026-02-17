import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChartIcon,
  HelpIcon,
  PlusIcon,
  SendIcon,
  UserIcon,
} from '@/components/icons';
import {
  accountQueryKey,
  dollarPriceQueryKey,
  transactionsQueryKey,
  useAccountBalance,
  useDollarPrice,
  useTransactions,
} from '@/hooks/use-account-data';

const BRAND_GREEN = '#16a34a';

/** Single horizontal padding for header content, balance, buttons and cards. Change here to align everything. */
const CONTENT_PADDING = 20;

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: balance = 0 } = useAccountBalance();
  const { data: transactions = [] } = useTransactions();
  const { data: dollarPrice = null } = useDollarPrice();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: sync from API and write to DB; depois invalidate
      await Promise.all([
        queryClient.refetchQueries({ queryKey: accountQueryKey }),
        queryClient.refetchQueries({ queryKey: transactionsQueryKey }),
        queryClient.refetchQueries({ queryKey: dollarPriceQueryKey }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <View style={styles.container}>
      {/* Green strip behind scroll so pull-to-refresh area is green, not white */}
      <View style={styles.pullRefreshGreen} pointerEvents="none" />
      {/* Overlay verde ao refreshar: esconde o spinner nativo (que no cold start fica no topo) e mostra só o nosso em posição fixa */}
      {refreshing && (
        <View style={styles.refreshOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#fff" style={styles.refreshSpinner} />
        </View>
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 60 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#fff']}
            progressViewOffset={9999}
          />
        }
      >
        {/* Green header - full width, no padding; content inside contentContainer */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={[styles.contentContainer]}>
            <View style={styles.headerRow}>
              <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <UserIcon size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Account</Text>
              <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <HelpIcon size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.heroSection}>
              <Text style={styles.balanceAmount}>
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <View style={styles.balanceBadge}>
                <Text style={styles.balanceLabelText}>Balance in USDC</Text>
                <Text style={styles.flag}>🇺🇸</Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                  <PlusIcon size={22} color="#fff" />
                  <Text style={styles.actionButtonText}>Reload</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]} activeOpacity={0.8}>
                  <SendIcon size={20} color="#fff" focused={false} />
                  <Text style={styles.actionButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Cards inside same contentContainer so they align with header; wrapper overlaps green */}
        <View style={[styles.contentContainer, styles.firstCardOverlap, styles.cardsWrapper]}>
          <View style={styles.card}>
            {transactions.map((tx, index) => (
            <View
              key={tx.id}
              style={[
                styles.transactionRow,
                index === transactions.length - 1 && styles.transactionRowLast,
              ]}
            >
              <View style={[styles.txIcon, { backgroundColor: tx.iconBg }]}>
                <Text style={styles.txIconText}>{tx.iconLabel}</Text>
              </View>
              <View style={styles.txContent}>
                <Text style={styles.txName}>{tx.name}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <View style={styles.txAmounts}>
                <Text style={[styles.txAmountUsdc, tx.amountUsdc.startsWith('+') && styles.txAmountPositive]}>
                  {tx.amountUsdc}
                </Text>
                <Text style={styles.txAmountFiat}>{tx.amountFiat}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.viewAllLink} activeOpacity={0.7}>
            <Text style={styles.viewAllLinkText}>View all transactions</Text>
          </TouchableOpacity>
          </View>

          <View style={styles.card}>
          <Text style={styles.cardTitle}>DIGITAL DOLLAR PRICE</Text>
          <View style={styles.dollarRow}>
            <View style={styles.chartIcon}>
              <ChartIcon size={28} color={BRAND_GREEN} />
            </View>
            <View style={styles.dollarBlock}>
              <Text style={styles.dollarValue}>{dollarPrice?.buy ?? '—'}</Text>
              <Text style={styles.dollarLabel}>Buy</Text>
            </View>
            <View style={styles.dollarBlock}>
              <Text style={styles.dollarValue}>{dollarPrice?.sell ?? '—'}</Text>
              <Text style={styles.dollarLabel}>Sell</Text>
            </View>
          </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: BRAND_GREEN,
    paddingBottom: 56,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  pullRefreshGreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: BRAND_GREEN,
    zIndex: 0,
  },
  refreshOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: BRAND_GREEN,
    zIndex: 2,
    paddingTop: 56,
    alignItems: 'center',
  },
  refreshSpinner: {},
  contentContainer: {
    paddingHorizontal: CONTENT_PADDING,
  },
  cardsWrapper: {
    gap: 16,
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
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  balanceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  balanceLabelText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  flag: {
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  actionButtonPrimary: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    gap: 16,
  },
  firstCardOverlap: {
    marginTop: -48,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txIconText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  txContent: {
    flex: 1,
  },
  txName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  txDate: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  txAmounts: {
    alignItems: 'flex-end',
  },
  txAmountUsdc: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  txAmountPositive: {
    color: BRAND_GREEN,
  },
  txAmountFiat: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  transactionRowLast: {
    borderBottomWidth: 0,
  },
  viewAllLink: {
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  viewAllLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND_GREEN,
    textDecorationLine: 'underline',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  dollarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  chartIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dollarBlock: {
    flex: 1,
  },
  dollarValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  dollarLabel: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
});
