import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class DollarPrice extends Model {
  static table = 'dollar_prices';

  @field('buy') buy!: string;
  @field('sell') sell!: string;
  @field('fiat_symbol') fiatSymbol!: string;
}
