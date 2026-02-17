import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Account extends Model {
  static table = 'accounts';

  @field('balance_usdc') balanceUsdc!: number;
  @field('currency_symbol') currencySymbol!: string;
}
