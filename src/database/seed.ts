import { database } from './index';
import { Account, Transaction, DollarPrice } from './models';

const DEFAULT_ACCOUNT_ID = 'default-account';
const DEFAULT_PRICE_ID = 'default-price';

export async function seedIfEmpty(): Promise<void> {
  const accounts = database.get<Account>('accounts');
  const existing = await accounts.query().fetchCount();
  if (existing > 0) return;

  await database.write(async () => {
    await accounts.create((record) => {
      (record as any)._raw.id = DEFAULT_ACCOUNT_ID;
      record.balanceUsdc = 1051.33;
      record.currencySymbol = 'USD';
    });

    const transactions = database.get<Transaction>('transactions');
    await transactions.create((record) => {
      record.name = 'De Deel';
      record.date = '4 Jul 2023';
      record.amountUsdc = '+ 1,000 USDc';
      record.amountFiat = '+ 1,000 USD';
      record.iconBg = '#1e3a5f';
      record.iconLabel = 'deel';
    });
    await transactions.create((record) => {
      record.name = 'Uber';
      record.date = '28 Jun 2023';
      record.amountUsdc = '- 2.55 USDc';
      record.amountFiat = '- 45.56 MXN';
      record.iconBg = '#000000';
      record.iconLabel = 'Uber';
    });

    const prices = database.get<DollarPrice>('dollar_prices');
    await prices.create((record) => {
      (record as any)._raw.id = DEFAULT_PRICE_ID;
      record.buy = '17.87 MXN';
      record.sell = '17.87 MXN';
      record.fiatSymbol = 'MXN';
    });
  });
}
