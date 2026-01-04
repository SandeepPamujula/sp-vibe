import 'dotenv/config';
import dbConnect from '../lib/mongodb';
import Tenant from '../models/Tenant';
import User, { UserRole } from '../models/User';
import GLCode from '../models/GLCode';
import ExpenseType from '../models/ExpenseType';
import { logger } from '../lib/logger';

const TENANTS = [
    { name: 'Acme Corp', slug: 'acme', status: 'active' },
    { name: 'Globex Corp', slug: 'globex', status: 'active' },
];

const GL_CODES = [
    { code: 'GL-1001', description: 'Travel Expenses' },
    { code: 'GL-1002', description: 'Meals & Entertainment' },
    { code: 'GL-1003', description: 'Office Supplies' },
    { code: 'GL-1004', description: 'Marketing' },
];

const EXPENSE_TYPES = [
    { name: 'Airfare', description: 'Flights for business travel', glCode: 'GL-1001' },
    { name: 'Hotel', description: 'Accommodation during travel', glCode: 'GL-1001' },
    { name: 'Taxi/Uber', description: 'Local transport', glCode: 'GL-1001' },
    { name: 'Breakfast', description: 'Morning meals', glCode: 'GL-1002' },
    { name: 'Lunch', description: 'Mid-day meals', glCode: 'GL-1002' },
    { name: 'Dinner', description: 'Evening meals', glCode: 'GL-1002' },
    { name: 'Stationery', description: 'Pens, paper, etc.', glCode: 'GL-1003' },
    { name: 'Online Ads', description: 'Digital marketing spends', glCode: 'GL-1004' },
];

const USERS = [
    {
        email: 'sandeeppamujula@gmail.com',
        name: 'Sandeep (Admin)',
        role: UserRole.FACILITY_ADMIN,
        tenantSlug: 'acme',
    },
    {
        email: 'reachsandeepkp@gmail.com',
        name: 'Sandeep (Approver)',
        role: UserRole.APPROVER,
        tenantSlug: 'acme',
    },
];

export async function seed() {
    try {
        await dbConnect();
        logger.info('Starting database seeding...');

        // 1. Seed Tenants
        const tenantMap = new Map();
        for (const t of TENANTS) {
            const tenant = await Tenant.findOneAndUpdate(
                { slug: t.slug },
                { $set: t },
                { upsert: true, new: true }
            );
            tenantMap.set(t.slug, tenant._id);
            logger.info(`Seeded tenant: ${t.slug}`);
        }

        // 2. Seed Users
        for (const u of USERS) {
            const tenantId = tenantMap.get(u.tenantSlug);
            if (!tenantId) continue;

            await User.findOneAndUpdate(
                { email: u.email },
                {
                    $set: {
                        name: u.name,
                        role: u.role,
                        tenantId,
                        status: 'active',
                    },
                },
                { upsert: true, new: true }
            );
            logger.info(`Seeded user: ${u.email}`);
        }

        // 3. Seed GL Codes & Expense Types per Tenant
        for (const [slug, tenantId] of tenantMap.entries()) {
            const glCodeMap = new Map();

            // Seed GL Codes
            for (const gc of GL_CODES) {
                const glCode = await GLCode.findOneAndUpdate(
                    { code: gc.code, tenantId },
                    { $set: { ...gc, tenantId } },
                    { upsert: true, new: true }
                );
                glCodeMap.set(gc.code, glCode._id);
                logger.info(`Seeded GL Code: ${gc.code} for tenant ${slug}`);
            }

            // Seed Expense Types
            for (const et of EXPENSE_TYPES) {
                const glCodeId = glCodeMap.get(et.glCode);
                if (!glCodeId) continue;

                await ExpenseType.findOneAndUpdate(
                    { name: et.name, tenantId },
                    {
                        $set: {
                            name: et.name,
                            description: et.description,
                            glCodeId,
                            tenantId,
                            status: 'active',
                        },
                    },
                    { upsert: true, new: true }
                );
                logger.info(`Seeded Expense Type: ${et.name} for tenant ${slug}`);
            }
        }

        logger.info('Database seeding completed successfully.');
        return true;
    } catch (error) {
        logger.error('Error during database seeding:', error);
        throw error;
    }
}

if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
