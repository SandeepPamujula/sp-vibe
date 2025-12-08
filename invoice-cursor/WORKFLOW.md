# Invoice Cursor - Workflow Diagrams

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Admin[Admin User]
        Accountant[Accountant User]
    end
    
    subgraph "Application Layer"
        NextJS[Next.js App<br/>Lambda + API Gateway]
        API[API Routes]
    end
    
    subgraph "AWS Services"
        DynamoDB[(DynamoDB<br/>Users & Invoices)]
        S3[(S3 Bucket<br/>Invoice Files)]
        SES[Amazon SES<br/>Email Service]
    end
    
    Admin -->|Login| NextJS
    Accountant -->|Login| NextJS
    NextJS -->|API Calls| API
    API -->|Read/Write| DynamoDB
    API -->|Upload/Download| S3
    API -->|Send Emails| SES
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App as Next.js App
    participant Auth as Auth Service
    participant DB as DynamoDB UsersTable
    
    User->>App: Access Application
    App->>Auth: Check Session
    alt No Session
        App->>User: Redirect to Login
        User->>App: Enter Email
        App->>Auth: Mock SSO Login
        Auth->>DB: Verify User (email)
        DB-->>Auth: User Data (role)
        alt Valid User
            Auth->>App: Create Session
            App->>User: Redirect Based on Role
        else Invalid User
            Auth->>App: Authentication Failed
            App->>User: Show Error
        end
    else Valid Session
        App->>User: Show Dashboard
    end
```

## Admin Workflow - Invoice Submission

```mermaid
sequenceDiagram
    participant Admin
    participant UI as Admin Portal
    participant API as API Routes
    participant S3 as S3 Bucket
    participant DB as DynamoDB InvoicesTable
    participant SES as Amazon SES
    
    Admin->>UI: Access Invoice Submission Form
    UI->>Admin: Display Form
    Admin->>UI: Fill Form & Upload File
    UI->>API: POST /api/invoices/submit
    API->>API: Validate Input (Zod)
    
    alt Validation Failed
        API->>UI: Return Validation Error
        UI->>Admin: Show Error Message
    else Validation Success
        API->>S3: Upload Invoice File
        S3-->>API: Return S3 File Key
        API->>DB: Create Invoice Record
        Note over DB: invoiceId, vendorName, amount,<br/>status: 'pending', s3FileKey,<br/>submittedBy, createdAt
        DB-->>API: Invoice Created
        
        par Send Confirmation Emails
            API->>SES: Send to Admin (Confirmation)
            API->>SES: Send to Accountant (New Invoice Notification)
        end
        
        SES-->>Admin: Email: Invoice Submitted
        SES-->>Accountant: Email: New Invoice Pending
        
        API->>UI: Return Success Response
        UI->>Admin: Show Success Message
    end
```

## Accountant Workflow - Invoice Management

```mermaid
sequenceDiagram
    participant Accountant
    participant UI as Accountant Portal
    participant API as API Routes
    participant DB as DynamoDB InvoicesTable
    participant S3 as S3 Bucket
    participant SES as Amazon SES
    
    Accountant->>UI: Access Invoice List
    UI->>API: GET /api/invoices?status=pending
    API->>DB: Query Invoices (status-index)
    DB-->>API: List of Pending Invoices
    API->>UI: Return Invoice List
    UI->>Accountant: Display Invoices with Pagination
    
    Accountant->>UI: Click on Invoice
    UI->>API: GET /api/invoices/:invoiceId
    API->>DB: Get Invoice Details
    DB-->>API: Invoice Data
    API->>UI: Return Invoice Details
    UI->>Accountant: Show Invoice Details
    
    Accountant->>UI: Click Preview Invoice
    UI->>API: GET /api/invoices/:invoiceId/preview
    API->>DB: Get Invoice (s3FileKey)
    API->>S3: Get Presigned URL
    S3-->>API: Presigned URL
    API->>UI: Return Presigned URL
    UI->>Accountant: Display Invoice File
    
    Accountant->>UI: Approve/Reject Invoice
    UI->>API: POST /api/invoices/:invoiceId/approve<br/>or POST /api/invoices/:invoiceId/reject
    API->>API: Validate Action
    API->>DB: Update Invoice Status
    Note over DB: status: 'approved'/'rejected',<br/>approvedBy, approvedAt,<br/>rejectionReason (if rejected)
    DB-->>API: Invoice Updated
    
    par Send Confirmation Emails
        API->>SES: Send to Admin (Approval/Rejection)
        API->>SES: Send to Accountant (Confirmation)
    end
    
    SES-->>Admin: Email: Invoice Approved/Rejected
    SES-->>Accountant: Email: Action Confirmed
    
    API->>UI: Return Success Response
    UI->>Accountant: Show Success & Refresh List
```

## CSV Export Workflow

```mermaid
sequenceDiagram
    participant Accountant
    participant UI as Accountant Portal
    participant API as API Routes
    participant DB as DynamoDB InvoicesTable
    
    Accountant->>UI: Access CSV Export
    UI->>Accountant: Show Month Selector
    Accountant->>UI: Select Month & Status Filter
    UI->>API: GET /api/invoices/export?month=YYYY-MM&status=approved
    API->>DB: Query Invoices (status-index + date filter)
    DB-->>API: Filtered Invoice Records
    API->>API: Generate CSV Data
    API->>UI: Return CSV File (download)
    UI->>Accountant: Download CSV File
```

## Search Workflow

```mermaid
sequenceDiagram
    participant Accountant
    participant UI as Accountant Portal
    participant API as API Routes
    participant DB as DynamoDB InvoicesTable
    
    Accountant->>UI: Enter Search Criteria
    Note over Accountant,UI: Search by:<br/>- Vendor Name (partial)<br/>- Invoice ID (partial)
    UI->>API: GET /api/invoices/search?query=vendorName&type=vendor
    API->>API: Parse Search Query
    
    alt Search by Vendor
        API->>DB: Query vendor-index (contains vendorName)
    else Search by Invoice ID
        API->>DB: Query InvoicesTable (invoiceId contains)
    end
    
    DB-->>API: Matching Invoice Records
    API->>UI: Return Filtered Results
    UI->>Accountant: Display Search Results
```

## Email Notification Flow

```mermaid
graph LR
    subgraph "Invoice Events"
        Submit[Invoice Submitted]
        Approve[Invoice Approved]
        Reject[Invoice Rejected]
    end
    
    subgraph "Email Service"
        SES[Amazon SES]
    end
    
    subgraph "Recipients"
        AdminEmail[Admin Email<br/>spamujula@progressresidential.com]
        AccountantEmail[Accountant Email<br/>sandeeppamujula@gmail.com]
    end
    
    Submit -->|Confirmation| AdminEmail
    Submit -->|New Invoice Alert| AccountantEmail
    
    Approve -->|Approval Notice| AdminEmail
    Approve -->|Confirmation| AccountantEmail
    
    Reject -->|Rejection Notice| AdminEmail
    Reject -->|Confirmation| AccountantEmail
    
    Submit -.->|via| SES
    Approve -.->|via| SES
    Reject -.->|via| SES
```

## Data Flow - Invoice Submission

```mermaid
graph TD
    Start[Admin Submits Invoice] --> Validate{Validate Input}
    Validate -->|Invalid| Error[Return Error]
    Validate -->|Valid| Upload[Upload File to S3]
    Upload -->|Success| GetKey[Get S3 File Key]
    GetKey --> CreateRecord[Create Invoice Record in DynamoDB]
    CreateRecord --> SetStatus[Set Status: 'pending']
    SetStatus --> SendEmails[Send Email Notifications]
    SendEmails --> Success[Return Success]
    
    Error --> End[End]
    Success --> End
```

## Data Flow - Invoice Approval

```mermaid
graph TD
    Start[Accountant Reviews Invoice] --> ViewDetails[View Invoice Details]
    ViewDetails --> Preview[Preview Invoice File from S3]
    Preview --> Decision{Approve or Reject?}
    Decision -->|Approve| UpdateApproved[Update Status: 'approved'<br/>Set approvedBy, approvedAt]
    Decision -->|Reject| UpdateRejected[Update Status: 'rejected'<br/>Set approvedBy, rejectedAt<br/>Set rejectionReason]
    UpdateApproved --> SendEmails[Send Email Notifications]
    UpdateRejected --> SendEmails
    SendEmails --> Success[Return Success]
    Success --> End[End]
```

## Complete User Journey

```mermaid
stateDiagram-v2
    [*] --> Login
    Login --> AdminDashboard: Admin Role
    Login --> AccountantDashboard: Accountant Role
    
    state AdminDashboard {
        [*] --> SubmitInvoice
        SubmitInvoice --> InvoiceSubmitted
        InvoiceSubmitted --> [*]
    }
    
    state AccountantDashboard {
        [*] --> ViewInvoices
        ViewInvoices --> SearchInvoices
        ViewInvoices --> PreviewInvoice
        PreviewInvoice --> ApproveInvoice
        PreviewInvoice --> RejectInvoice
        ApproveInvoice --> ExportCSV
        RejectInvoice --> ExportCSV
        ExportCSV --> [*]
    }
    
    AdminDashboard --> [*]
    AccountantDashboard --> [*]
```

## System Components Interaction

```mermaid
graph TB
    subgraph "Frontend"
        AdminUI[Admin UI]
        AccountantUI[Accountant UI]
    end
    
    subgraph "Backend API"
        AuthAPI[Auth API]
        InvoiceAPI[Invoice API]
        ExportAPI[Export API]
    end
    
    subgraph "Services"
        AuthService[Auth Service]
        InvoiceService[Invoice Service]
        EmailService[Email Service]
        FileService[File Service]
    end
    
    subgraph "Data Layer"
        UsersDB[(UsersTable)]
        InvoicesDB[(InvoicesTable)]
        FileStorage[(S3 Bucket)]
    end
    
    subgraph "External"
        EmailProvider[SES]
    end
    
    AdminUI --> AuthAPI
    AccountantUI --> AuthAPI
    AdminUI --> InvoiceAPI
    AccountantUI --> InvoiceAPI
    AccountantUI --> ExportAPI
    
    AuthAPI --> AuthService
    InvoiceAPI --> InvoiceService
    InvoiceAPI --> FileService
    ExportAPI --> InvoiceService
    
    AuthService --> UsersDB
    InvoiceService --> InvoicesDB
    InvoiceService --> EmailService
    FileService --> FileStorage
    EmailService --> EmailProvider
```

