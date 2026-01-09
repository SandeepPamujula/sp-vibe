/** @jest-environment node */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import Tenant from '../src/models/Tenant';
import User, { UserRole } from '../src/models/User';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Database Connection and Models', () => {
    it('should connect to the database', async () => {
        const db = await dbConnect();
        expect(db.connection.readyState).toBe(1); // 1 = connected
    });

    it('should create a tenant and a user', async () => {
        await dbConnect();

        // Create Tenant
        const tenantData = {
            name: 'Test Corp',
            slug: 'test-corp',
        };
        const tenant = await Tenant.create(tenantData);
        expect(tenant.name).toBe(tenantData.name);
        expect(tenant.slug).toBe(tenantData.slug);
        expect(tenant._id).toBeDefined();

        // Create User
        const userData = {
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.FACILITY_ADMIN,
            tenantId: tenant._id,
        };
        const user = await User.create(userData);
        expect(user.email).toBe(userData.email);
        expect(user.tenantId.toString()).toBe(tenant._id.toString());
        expect(user._id).toBeDefined();

        // Verify User can be populated
        const foundUser = await User.findOne({ email: userData.email }).populate('tenantId');
        expect(foundUser?.tenantId).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((foundUser?.tenantId as any).slug).toBe('test-corp');
    });

    it('should fail if required fields are missing', async () => {
        await dbConnect();

        // Missing slug
        const invalidTenant = new Tenant({ name: 'Invalid' });
        await expect(invalidTenant.save()).rejects.toThrow();

        // Missing tenantId for user
        const invalidUser = new User({
            email: 'invalid@example.com',
            name: 'Invalid User',
            role: UserRole.EMPLOYEE,
        });
        await expect(invalidUser.save()).rejects.toThrow();
    });
});
