import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Transaction extends Model {
  static table = 'transactions';

  @field('name') name!: string;
  @field('date') date!: string;
  @field('amount_usdc') amountUsdc!: string;
  @field('amount_fiat') amountFiat!: string;
  @field('icon_bg') iconBg!: string;
  @field('icon_label') iconLabel!: string;
}
