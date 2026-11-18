import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export function hasDatabaseConfig(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_DB_URL ||
      process.env.SQL_HOST
  );
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_DB_URL;
    const isVercel = Boolean(
      process.env.VERCEL ||
        process.env.VERCEL_ENV ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.NOW_REGION
    );
    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        ssl:
          connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
            ? undefined
            : { rejectUnauthorized: false },
        max: isVercel ? 5 : 10,
        idleTimeoutMillis: isVercel ? 15000 : 30000,
        connectionTimeoutMillis: 15000,
      });
    } else if (process.env.SQL_HOST) {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      global._postgresPool = new Pool({
        host: 'missing-database-url.invalid',
        connectionTimeoutMillis: 1500,
        max: 1,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
