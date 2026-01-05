/** @jest-environment node */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dbConnect from '../../src/lib/mongodb';
import Tenant from '../../src/models/Tenant';
import GLCode from '../../src/models/GLCode';
import ExpenseType from '../../src/models/ExpenseType';
import Workflow from '../../src/models/Workflow';
import { UserRole } from '../../src/models/User';

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

describe('Master Data Models', () => {
    let tenantId: mongoose.Types.ObjectId;

    beforeEach(async () => {
        await dbConnect();
        // Clean up before each test
        await GLCode.deleteMany({});
        await ExpenseType.deleteMany({});
        await Workflow.deleteMany({});
        await Tenant.deleteMany({});

        // Create a dummy tenant
        const tenant = await Tenant.create({
            name: 'Test Tenant',
            slug: 'test-tenant',
        });
        tenantId = tenant._id as mongoose.Types.ObjectId;
    });

    describe('GLCode Model', () => {
        it('should create a valid GLCode', async () => {
            const glCodeData = {
                code: '1001',
                description: 'Office Supplies',
                tenantId: tenantId,
            };
            const glCode = await GLCode.create(glCodeData);
            expect(glCode.code).toBe('1001');
            expect(glCode.tenantId.toString()).toBe(tenantId.toString());
            expect(glCode._id).toBeDefined();
        });

        it('should enforce unique code per tenant', async () => {
            const glCodeData = {
                code: '1001',
                tenantId: tenantId,
            };
            await GLCode.create(glCodeData);

            await expect(GLCode.create(glCodeData)).rejects.toThrow();
        });

        it('should require tenantId', async () => {
            const invalidData = {
                code: '1002',
            };
            await expect(GLCode.create(invalidData)).rejects.toThrow();
        });
    });

    describe('ExpenseType Model', () => {
        let glCodeId: mongoose.Types.ObjectId;

        beforeEach(async () => {
            const glCode = await GLCode.create({
                code: '2001',
                tenantId: tenantId,
            });
            glCodeId = glCode._id as mongoose.Types.ObjectId;
        });

        it('should create a valid ExpenseType', async () => {
            const expenseTypeData = {
                name: 'Travel',
                description: 'Travel expenses',
                glCodeId: glCodeId,
                tenantId: tenantId,
            };
            const expenseType = await ExpenseType.create(expenseTypeData);
            expect(expenseType.name).toBe('Travel');
            expect(expenseType.glCodeId.toString()).toBe(glCodeId.toString());
            expect(expenseType.tenantId.toString()).toBe(tenantId.toString());
        });

        it('should fail if linked GLCode is missing (validation level only checks ID presence, but good to test)', async () => {
            const invalidData = {
                name: 'Missing GL',
                tenantId: tenantId,
            };
            await expect(ExpenseType.create(invalidData)).rejects.toThrow();
        });

        it('should enforce unique name per tenant', async () => {
            const expenseTypeData = {
                name: 'Meals',
                glCodeId: glCodeId,
                tenantId: tenantId,
            };
            await ExpenseType.create(expenseTypeData);
            await expect(ExpenseType.create(expenseTypeData)).rejects.toThrow();
        });
    });

    describe('Workflow Model', () => {
        it('should create a valid Workflow', async () => {
            const workflowData = {
                name: 'Standard Approval',
                tenantId: tenantId,
                steps: [
                    {
                        name: 'Manager Approval',
                        approverRole: UserRole.FACILITY_ADMIN,
                        order: 1,
                    },
                    {
                        name: 'Finance Approval',
                        approverRole: UserRole.APPROVER,
                        order: 2,
                    }
                ]
            };
            const workflow = await Workflow.create(workflowData);
            expect(workflow.name).toBe('Standard Approval');
            expect(workflow.steps).toHaveLength(2);
            expect(workflow.steps[0].approverRole).toBe(UserRole.FACILITY_ADMIN);
            expect(workflow.steps[1].order).toBe(2);
        });

        it('should validate steps', async () => {
            const invalidWorkflow = {
                name: 'Bad Workflow',
                tenantId: tenantId,
                steps: [
                    {
                        name: 'Manager',
                        // missing approverRole and order
                    }
                ]
            };
            await expect(Workflow.create(invalidWorkflow)).rejects.toThrow();
        });

        it('should enforce unique Workflow name per tenant', async () => {
            const workflowData = {
                name: 'Unique Workflow',
                tenantId: tenantId,
                steps: []
            };
            await Workflow.create(workflowData);
            await expect(Workflow.create(workflowData)).rejects.toThrow();
        });
    });
});
