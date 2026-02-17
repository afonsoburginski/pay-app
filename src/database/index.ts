import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import schema from './schema';
import migrations from './migrations';
import { Account, Transaction, DollarPrice } from './models';

const isWeb = Platform.OS === 'web';
const isExpoGo = Constants.appOwnership === 'expo';

function createAdapter() {
  if (isWeb || isExpoGo) {
    return new LokiJSAdapter({
      schema,
      migrations,
      useWebWorker: false,
      useIncrementalIndexedDB: true,
    });
  }
  return new SQLiteAdapter({
    schema,
    migrations,
    jsi: true,
    onSetUpError: (error) => {
      console.error('WatermelonDB setup error:', error);
    },
  });
}

const adapter = createAdapter();

export const database = new Database({
  adapter,
  modelClasses: [Account, Transaction, DollarPrice],
});

export { schema, migrations };
export { Account, Transaction, DollarPrice };
