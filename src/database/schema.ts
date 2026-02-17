import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'accounts',
      columns: [
        { name: 'balance_usdc', type: 'number' },
        { name: 'currency_symbol', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'date', type: 'string' },
        { name: 'amount_usdc', type: 'string' },
        { name: 'amount_fiat', type: 'string' },
        { name: 'icon_bg', type: 'string' },
        { name: 'icon_label', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'dollar_prices',
      columns: [
        { name: 'buy', type: 'string' },
        { name: 'sell', type: 'string' },
        { name: 'fiat_symbol', type: 'string' },
      ],
    }),
  ],
});
