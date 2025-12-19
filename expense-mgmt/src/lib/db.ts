/**
 * Database Client
 *
 * Drizzle ORM client configured for PostgreSQL.
 * Singleton pattern ensures only one connection pool is created.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../../drizzle/schema';

import { databaseConfig } from './config';

/**
 * Create PostgreSQL connection pool
 */
const connectionString = databaseConfig.url;

// Create postgres client with connection pool settings
const client = postgres(connectionString, {
  max: databaseConfig.pool.max,
  idle_timeout: 20,
  connect_timeout: 10,
});

/**
 * Drizzle ORM database client
 *
 * Use this for all database operations throughout the application.
 *
 * @example
 * import { db } from '@/lib/db';
 * import { users } from '../../drizzle/schema';
 *
 * const allUsers = await db.select().from(users);
 */
export const db = drizzle(client, {
  schema,
  logger: databaseConfig.logging,
});

/**
 * Database client type for use in type definitions
 */
export type Database = typeof db;
