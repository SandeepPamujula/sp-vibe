# Building a Multi-Tenant Expense Management System: An Agentic Approach
**Target Audience**: Software Architects & Engineering Leads
**Date**: January 2026

---

## 1. Executive Summary

We designed `ag-expense-mgmt`, a scalable, multi-tenant Expense Management System, leveraging **Antigravity** (Advanced Agentic AI) to accelerate the Design and Planning phases.
The system allows Facility Admins to manage expenses with complex approval workflows, backed by a robust Serverless architecture.

**Key Outcome**: Reduced planning time from weeks to hours while maintaining high compliance and security standards.

---

## 2. Solution Architecture

We adopted a **Cloud-Native Serverless** (AWS) approach for scalability and cost-efficiency.

### **Tech Stack**
*   **Frontend/Backend**: Next.js (App Router) - "Backend for Frontend" pattern with Server Actions.
*   **Database**: MongoDB Atlas (Multi-tenant, Indexed by `tenantId`).
*   **Infrastructure**: AWS CDK (Infrastructure as Code).
*   **Storage**: Amazon S3 (Partitioned by Tenant).
*   **Notifications**: Amazon SES.

### **High-Level Design (HLD)**
*(Refer to `docs/HLD.md`)*
*   **Traffic Flow**: CloudFront -> Lambda (Next.js) -> MongoDB / S3.
*   **Security**: Azure Entra ID (OIDC) for SSO.

---

## 3. The "Antigravity" Design Process

We didn't just write code; we architected the system iteratively using an Agentic Workflow.

### **Phase 1: Intent to Spec**
*   **Input**: High-level user stories ("As a facility admin...").
*   **Agentic Action**: Generated extensive Design Artifacts:
    *   `api-specification.md`: Strongly typed Zod schemas.
    *   `security-matrix.md`: RBAC and Tenant Isolation rules.
    *   `nfr.md`: Non-functional requirements (Performance, Observability).

### **Phase 2: "Security & Quality First"**
*   **NFR Integration**: We defined NFRs *before* writing code.
    *   **Observability**: Structured JSON logging mandated in Milestone 1.
    *   **Accessibility**: Storybook A11y tests mandated in Milestone 1.
    *   **Security**: Strict CSP and Headers mandated in Milestone 1.

### **Phase 3: Iterative Refinement & Collaboration**
*   **The Dialogue**: The design wasn't static; it evolved through rigorous questioning.
    *   **User Challenge**: *"Expense types... will be back filled"* -> **Adaptation**: We removed unused API endpoints to reduce attack surface and added Seeding Scripts.
    *   **User Challenge**: *"Any user with approver role should be able to see all..."* -> **Adaptation**: We pivoted from a rigid "Assigned Step" model to an "Open Approval" model for flexibility.
    *   **User Request**: *"Think of NFR"* -> **Adaptation**: We proactively created observability and performance standards, injecting them into the milestones.
    *   **User Request**: *"Add storybook tests for UI components"* -> **Adaptation**: We enhanced the Testing Strategy to include interaction testing.

---

## 4. Key Architectural Decisions

### **4.1. Multi-tenancy Strategy**
*   **Decision**: Logical Isolation (Shared Database, Separate Data).
*   **Implementation**:
    *   Every Mongoose Schema has `tenantId` (indexed).
    *   Server Actions explicitly validate `tenantId` from the Session (not Client Input).

### **4.2. "Open" Approval Model**
*   **Challenge**: Strict role-based steps were too rigid for the client's operation.
*   **Solution**: Decoupled "Steps" from "Specific Roles". Any user with the global `Approver` role can act on pending expenses.
*   **Benefit**: Improved operational velocity; reduced bottlenecks.

### **4.3. Backfilling vs. API**
*   **Decision**: Removed `Create/Update` APIs for Reference Data (GL Codes/Expense Types).
*   **Rationale**: These are static configurations. Managing them via code/scripts prevents "App Config Drift" and simplifies the UI surface area.

---

## 5. Roadmap & Milestones

*   **Milestone 1**: Foundation (Repo, Infra, Mock Auth, Observability).
*   **Milestone 2**: Core Services (Config, Seeding, Audit Log).
*   **Milestone 3**: Submission Flow (S3 Uploads, Workflow Engine).

---

## 6. Conclusion

By partnering with **Antigravity**, we achieved a "Shift Left" on architectural rigor. We have a complete blueprint—Specs, Test Plans, Security Matrix, and NFRs—ready before the first line of production code is written.

**Next Steps**: Execute Milestone 1.
