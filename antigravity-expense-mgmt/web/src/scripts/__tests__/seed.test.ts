/**
 * @jest-environment node
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seed } from '../seed';
import Tenant from '../../models/Tenant';
import User from '../../models/User';
import GLCode from '../../models/GLCode';
import ExpenseType from '../../models/ExpenseType';

// Mock the dbConnect to use memory server
jest.mock('../../lib/mongodb', () => {
    return async () => {
        // Already connected in tests
        return mongoose;
    };
});

// Mock the logger to avoid polluting test output
jest.mock('../../lib/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe('Database Seeding', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Clear all collections before each test
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    });

    it('should seed the database successfully', async () => {
        const result = await seed();
        expect(result).toBe(true);

        // Verify Tenants
        const tenants = await Tenant.find();
        expect(tenants.length).toBe(2);
        expect(tenants.map(t => t.slug)).toContain('acme');
        expect(tenants.map(t => t.slug)).toContain('globex');

        // Verify Users
        const users = await User.find();
        expect(users.length).toBe(2);
        expect(users.map(u => u.email)).toContain('sandeeppamujula@gmail.com');

        // Verify GL Codes
        const glCodes = await GLCode.find();
        expect(glCodes.length).toBe(8); // 4 codes * 2 tenants

        // Verify Expense Types
        const expenseTypes = await ExpenseType.find();
        expect(expenseTypes.length).toBe(16); // 8 types * 2 tenants (since we seed all for all tenants)
    });

    it('should support backfilling (upserting) without duplicates', async () => {
        // Run seed twice
        await seed();
        await seed();

        // Verify counts remain same
        const tenants = await Tenant.find();
        expect(tenants.length).toBe(2);

        const users = await User.find();
        expect(users.length).toBe(2);

        const glCodes = await GLCode.find();
        expect(glCodes.length).toBe(8);

        const expenseTypes = await ExpenseType.find();
        expect(expenseTypes.length).toBe(16);
    });
});
