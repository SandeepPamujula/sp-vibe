# Invoice Cursor - Workflow Diagrams

## High-Level State Diagram

### Invoice Lifecycle State Machine


### Simplified Invoice State Flow V1

```mermaid
graph LR
    Start([Upload Invoice]) --> Draft[Draft State]
    Draft -->|Admin Submits| Under-Review[UNDER_REVIEW State]
    
    Under-Review -->|Accountant<br/>Approves| Approved[APPROVED State]
    Under-Review -->|Accountant<br/>Rejects| Rejected[REJECTED State]
    
    Approved --> End1([Process Complete])
    Rejected --> End2([Process Complete])
    
    style Draft fill:#e1f5ff
    style Under-Review fill:#fff4e1
    style Approved fill:#e8f5e9
    style Rejected fill:#ffebee
    style Start fill:#f3e5f5
    style End1 fill:#f3e5f5
    style End2 fill:#f3e5f5
```

### Simplified Invoice State Flow V2 (With Resubmission)

```mermaid
graph LR
    Start([Upload Invoice]) --> Draft[Draft State]
    Draft -->|Admin Submits| Under-Review[UNDER_REVIEW State]
    
    Under-Review -->|Accountant<br/>Approves| Approved[APPROVED State]
    Under-Review -->|Accountant<br/>Rejects| Rejected[REJECTED State]
    
    Rejected -->|Admin Updates<br/>Invoice| Draft
    
    Approved --> End1([Process Complete])
    
    style Draft fill:#e1f5ff
    style Under-Review fill:#fff4e1
    style Approved fill:#e8f5e9
    style Rejected fill:#ffebee
    style Start fill:#f3e5f5
    style End1 fill:#f3e5f5
```

**Note:** When an invoice is in REJECTED state, the Admin can:
- Update invoice details
- Upload new file
- Resubmit for review (transitions back to Draft, then to Under-Review)

