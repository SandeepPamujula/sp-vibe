# Requirements

## Project Overview
Invoice Cursor is an expense invoice processing application with role-based access control for admin and accountant users.

## Authentication
- SSO login with mock implementation
- Admin user: reachsandeepkp@gmail.com
- Accountant user: sandeeppamujula@gmail.com

## Admin Features
- Submit expense invoices via web portal (supports multiple invoices, max 5 per submission)
- Receive email confirmation on invoice submission
- Update rejected invoices (modify details, upload new file)
- Resubmit rejected invoices for review
- Add comments to invoices for communication with accountant (stored in unified history)
- View unified history timeline showing both comments and audit trail entries

## Accountant Features
- View list of submitted expenses with pagination
- Manual approval of expenses
- Download expense/invoice details to CSV (monthly basis)
- Receive email notifications for new invoice submissions
- Receive email confirmation on invoice approval/rejection
- Search invoices by various criteria
- Preview uploaded invoices before approval
- Add comments to invoices for communication with admin (stored in unified history)
- View unified history timeline showing both comments and audit trail entries

## Email Notifications
- Invoice submission confirmation (to admin)
- New invoice notification (to accountant)
- Invoice approval/rejection confirmation (to admin and accountant)

## Invoice State Flow (V2 - With Resubmission)

The invoice lifecycle follows a state machine with the following states and transitions:

### Invoice States
- **DRAFT**: Initial state when invoice is uploaded/created by Admin
- **UNDER_REVIEW**: Invoice is submitted and awaiting accountant review
- **APPROVED**: Invoice has been approved by accountant (final state)
- **REJECTED**: Invoice has been rejected by accountant (can be resubmitted)

### State Transitions
1. **DRAFT → UNDER_REVIEW**: When Admin submits the invoice
2. **UNDER_REVIEW → APPROVED**: When Accountant approves the invoice
3. **UNDER_REVIEW → REJECTED**: When Accountant rejects the invoice
4. **REJECTED → DRAFT**: When Admin updates a rejected invoice (resubmission flow)
5. **DRAFT → UNDER_REVIEW**: When Admin resubmits the updated invoice

### Resubmission Flow
When an invoice is in **REJECTED** state, the Admin can:
- Update invoice details (vendor, amount, description, etc.)
- Upload a new invoice file
- Resubmit for review (transitions back to DRAFT, then to UNDER_REVIEW)

**Note**: See `WORKFLOW.md` for visual state flow diagrams.

