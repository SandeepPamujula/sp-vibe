/**
 * Database Seed Script
 *
 * Seeds the database with test data for a single tenant:
 * - Tenant (Acme Corporation)
 * - Users (admin and approver roles)
 * - GL codes (expense categories)
 * - Workflows (petty, internet)
 * - Sample expenses (various statuses)
 * - Expense approvals and history
 *
 * Run with: pnpm db:seed
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  tenants,
  users,
  glCodes,
  expenseWorkflows,
  workflowSteps,
  expenses,
  expenseApprovals,
  expenseHistory,
  expenseAttachments,
  type NewTenant,
  type NewUser,
  type NewGlCode,
  type NewExpenseWorkflow,
  type NewWorkflowStep,
  type NewExpense,
  type NewExpenseApproval,
  type NewExpenseHistory,
} from './schema';

// Database connection URL
const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://expense:expense123@localhost:5433/expense_mgmt';

// Create postgres client for seeding
const client = postgres(DATABASE_URL);
const db = drizzle(client);

// ============================================================================
// Seed Data - Single Tenant (Acme Corporation)
// ============================================================================

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

/**
 * Test tenant
 */
const tenantData: NewTenant[] = [
  {
    id: TENANT_ID,
    name: 'Acme Corporation',
    slug: 'acme',
    isActive: true,
  },
];

/**
 * Test users
 */
const userData: NewUser[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    tenantId: TENANT_ID,
    email: 'sandeeppamujula@gmail.com',
    name: 'Sandeep Admin',
    role: 'admin',
    isActive: true,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    tenantId: TENANT_ID,
    email: 'reachsandeepkp@gmail.com',
    name: 'SP Approver',
    role: 'approver',
    isActive: true,
  },
];

/**
 * GL codes
 */
const glCodeData: NewGlCode[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    tenantId: TENANT_ID,
    code: '5100',
    description: 'Office Supplies',
    isActive: true,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    tenantId: TENANT_ID,
    code: '5200',
    description: 'Travel & Transportation',
    isActive: true,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    tenantId: TENANT_ID,
    code: '5300',
    description: 'Meals & Entertainment',
    isActive: true,
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    tenantId: TENANT_ID,
    code: '5400',
    description: 'Software & Subscriptions',
    isActive: true,
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    tenantId: TENANT_ID,
    code: '5500',
    description: 'Equipment & Hardware',
    isActive: true,
  },
];

/**
 * Expense Workflows (single-level approval)
 */
const workflowData: NewExpenseWorkflow[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    tenantId: TENANT_ID,
    name: 'Petty Cash',
    code: 'petty',
    description: 'Small cash expenses for office supplies, meals, transportation',
    isActive: true,
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    tenantId: TENANT_ID,
    name: 'Internet Expense',
    code: 'internet',
    description: 'Online purchases, subscriptions, cloud services',
    isActive: true,
  },
];

/**
 * Workflow Steps - Single approval step per workflow
 */
const workflowStepData: NewWorkflowStep[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    workflowId: 'a1111111-1111-1111-1111-111111111111',
    stepOrder: 1,
    name: 'Approver Review',
    description: 'Single-level approval by approver role',
    approverRole: 'approver',
    isFinal: true,
    isActive: true,
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    workflowId: 'a2222222-2222-2222-2222-222222222222',
    stepOrder: 1,
    name: 'Approver Review',
    description: 'Single-level approval by approver role',
    approverRole: 'approver',
    isFinal: true,
    isActive: true,
  },
];

/**
 * Helper to get dates relative to today
 */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0] as string;
}

/**
 * Sample expenses
 */
const expenseData: NewExpense[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    tenantId: TENANT_ID,
    submittedBy: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    workflowId: 'a1111111-1111-1111-1111-111111111111',
    workflowType: 'petty',
    expenseDate: daysAgo(5),
    invoiceNumber: 'INV-2024-001',
    vendorName: 'Office Depot',
    amount: '125.50',
    natureOfExpense: 'Printer paper and supplies',
    glCodeId: 'c1111111-1111-1111-1111-111111111111',
    purpose: 'Monthly office supply restock',
    status: 'draft',
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    tenantId: TENANT_ID,
    submittedBy: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    workflowId: 'a1111111-1111-1111-1111-111111111111',
    currentStepId: 'b1111111-1111-1111-1111-111111111111',
    workflowType: 'petty',
    expenseDate: daysAgo(10),
    invoiceNumber: 'INV-2024-002',
    vendorName: 'Uber',
    amount: '45.00',
    natureOfExpense: 'Transportation to client meeting',
    glCodeId: 'c2222222-2222-2222-2222-222222222222',
    purpose: 'Client visit - Downtown office',
    status: 'submitted',
  },
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    tenantId: TENANT_ID,
    submittedBy: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    approvedBy: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    workflowId: 'a2222222-2222-2222-2222-222222222222',
    workflowType: 'internet',
    expenseDate: daysAgo(15),
    invoiceNumber: 'INV-2024-003',
    vendorName: 'AWS',
    amount: '2500.00',
    natureOfExpense: 'Cloud hosting services',
    glCodeId: 'c4444444-4444-4444-4444-444444444444',
    purpose: 'Q4 cloud infrastructure',
    status: 'approved',
  },
  {
    id: 'e4444444-4444-4444-4444-444444444444',
    tenantId: TENANT_ID,
    submittedBy: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    workflowId: 'a1111111-1111-1111-1111-111111111111',
    workflowType: 'petty',
    expenseDate: daysAgo(20),
    invoiceNumber: 'INV-2024-004',
    vendorName: 'Fine Dining Restaurant',
    amount: '350.00',
    natureOfExpense: 'Client dinner',
    glCodeId: 'c3333333-3333-3333-3333-333333333333',
    purpose: 'Dinner with potential client - ABC Corp',
    status: 'rejected',
  },
];

/**
 * Expense Approvals
 */
const expenseApprovalData: NewExpenseApproval[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    expenseId: 'e2222222-2222-2222-2222-222222222222',
    workflowStepId: 'b1111111-1111-1111-1111-111111111111',
    status: 'pending',
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    expenseId: 'e3333333-3333-3333-3333-333333333333',
    workflowStepId: 'b2222222-2222-2222-2222-222222222222',
    approverId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    status: 'approved',
    comments: 'Approved - within budget allocation',
    actedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    expenseId: 'e4444444-4444-4444-4444-444444444444',
    workflowStepId: 'b1111111-1111-1111-1111-111111111111',
    approverId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    status: 'rejected',
    comments: 'Rejected - exceeds meal allowance policy ($100 per person max)',
    actedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];

/**
 * Expense history entries
 */
const expenseHistoryData: NewExpenseHistory[] = [
  // Expense 002 - submitted
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    expenseId: 'e2222222-2222-2222-2222-222222222222',
    userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    action: 'created',
    comments: 'Expense created',
    changes: { initial: true },
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    expenseId: 'e2222222-2222-2222-2222-222222222222',
    userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    action: 'submitted',
    comments: 'Submitted for approval',
    changes: { status: { from: 'draft', to: 'submitted' } },
  },
  // Expense 003 - approved
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    expenseId: 'e3333333-3333-3333-3333-333333333333',
    userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    action: 'created',
    comments: 'Expense created',
    changes: { initial: true },
  },
  {
    id: 'f4444444-4444-4444-4444-444444444444',
    expenseId: 'e3333333-3333-3333-3333-333333333333',
    userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    action: 'submitted',
    comments: 'Submitted for Q4 infrastructure budget',
    changes: { status: { from: 'draft', to: 'submitted' } },
  },
  {
    id: 'f5555555-5555-5555-5555-555555555555',
    expenseId: 'e3333333-3333-3333-3333-333333333333',
    userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    action: 'approved',
    comments: 'Approved - within budget allocation',
    changes: { status: { from: 'submitted', to: 'approved' } },
  },
  // Expense 004 - rejected
  {
    id: 'f6666666-6666-6666-6666-666666666666',
    expenseId: 'e4444444-4444-4444-4444-444444444444',
    userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    action: 'created',
    comments: 'Expense created',
    changes: { initial: true },
  },
  {
    id: 'f7777777-7777-7777-7777-777777777777',
    expenseId: 'e4444444-4444-4444-4444-444444444444',
    userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    action: 'submitted',
    comments: 'Submitted for approval',
    changes: { status: { from: 'draft', to: 'submitted' } },
  },
  {
    id: 'f8888888-8888-8888-8888-888888888888',
    expenseId: 'e4444444-4444-4444-4444-444444444444',
    userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    action: 'rejected',
    comments: 'Rejected - exceeds meal allowance policy ($100 per person max)',
    changes: { status: { from: 'submitted', to: 'rejected' } },
  },
];

// ============================================================================
// Seed Functions
// ============================================================================

async function clearData() {
  console.log('🗑️  Clearing existing data...');
  await db.delete(expenseAttachments);
  await db.delete(expenseHistory);
  await db.delete(expenseApprovals);
  await db.delete(expenses);
  await db.delete(workflowSteps);
  await db.delete(expenseWorkflows);
  await db.delete(glCodes);
  await db.delete(users);
  await db.delete(tenants);
  console.log('   ✓ Data cleared');
}

async function seedTenants() {
  console.log('🏢 Seeding tenant...');
  await db.insert(tenants).values(tenantData);
  console.log(`   ✓ Created ${tenantData.length} tenant`);
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  await db.insert(users).values(userData);
  console.log(`   ✓ Created ${userData.length} users`);
}

async function seedGlCodes() {
  console.log('📊 Seeding GL codes...');
  await db.insert(glCodes).values(glCodeData);
  console.log(`   ✓ Created ${glCodeData.length} GL codes`);
}

async function seedWorkflows() {
  console.log('🔄 Seeding workflows...');
  await db.insert(expenseWorkflows).values(workflowData);
  console.log(`   ✓ Created ${workflowData.length} workflows`);
}

async function seedWorkflowSteps() {
  console.log('📋 Seeding workflow steps...');
  await db.insert(workflowSteps).values(workflowStepData);
  console.log(`   ✓ Created ${workflowStepData.length} workflow steps`);
}

async function seedExpenses() {
  console.log('💰 Seeding expenses...');
  await db.insert(expenses).values(expenseData);
  console.log(`   ✓ Created ${expenseData.length} expenses`);
}

async function seedExpenseApprovals() {
  console.log('✅ Seeding expense approvals...');
  await db.insert(expenseApprovals).values(expenseApprovalData);
  console.log(`   ✓ Created ${expenseApprovalData.length} approval records`);
}

async function seedExpenseHistory() {
  console.log('📝 Seeding expense history...');
  await db.insert(expenseHistory).values(expenseHistoryData);
  console.log(`   ✓ Created ${expenseHistoryData.length} history entries`);
}

/**
 * Main seed function
 */
async function seed() {
  console.log('\n🌱 Starting database seed...\n');
  console.log(`   Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

  try {
    await clearData();
    await seedTenants();
    await seedUsers();
    await seedGlCodes();
    await seedWorkflows();
    await seedWorkflowSteps();
    await seedExpenses();
    await seedExpenseApprovals();
    await seedExpenseHistory();

    console.log('\n✅ Seeding complete!\n');

    // Print summary
    console.log('📋 Summary:');
    console.log('   ─────────────────────────────────────');
    console.log(`   Tenant:    ${tenantData[0]?.name} (${tenantData[0]?.slug})`);
    console.log('   ─────────────────────────────────────');
    console.log('   Users:');
    for (const user of userData) {
      console.log(`     • ${user.name} <${user.email}> [${user.role}]`);
    }
    console.log('   ─────────────────────────────────────');
    console.log('   Workflows:');
    for (const wf of workflowData) {
      console.log(`     • ${wf.name} (${wf.code}) - 1 step`);
    }
    console.log('   ─────────────────────────────────────');
    console.log(`   GL Codes:  ${glCodeData.length}`);
    console.log(`   Expenses:  ${expenseData.length}`);
    console.log(`   Approvals: ${expenseApprovalData.length}`);
    console.log(`   History:   ${expenseHistoryData.length} entries`);
    console.log('   ─────────────────────────────────────\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run seed
seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
