import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import schema from './schema';
import migrations from './migrations';
import { Account, Transaction, DollarPrice } from './models';

const isWeb = Platform.OS === 'web';

const adapter = isWeb
  ? new LokiJSAdapter({
      schema,
      useWebWorker: false,
      useIncrementalIndexedDB: true,
    })
  : new SQLiteAdapter({
      schema,
      migrations,
      jsi: true,
      onSetUpError: (error) => {
        console.error('WatermelonDB setup error:', error);
      },
    });

export const database = new Database({
  adapter,
  modelClasses: [Account, Transaction, DollarPrice],
});

export { schema, migrations };
export { Account, Transaction, DollarPrice };
