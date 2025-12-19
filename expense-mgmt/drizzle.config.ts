import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://expense:expense123@localhost:5432/expense_mgmt',
  },
  verbose: true,
  strict: true,
});

