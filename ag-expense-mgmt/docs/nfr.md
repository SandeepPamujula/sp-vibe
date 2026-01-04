# Non-Functional Requirements (NFR)

This document outlines the usage, performance, and quality standards for the Expense Management System.

## 1. Performance
*   **Response Time**:
    *   API Read Operations: < 200ms (P95).
    *   API Write Operations: < 500ms (P95).
    *   File Upload (Start): < 1s.
*   **Frontend**:
    *   Largest Contentful Paint (LCP): < 2.5s.
    *   First Input Delay (FID): < 100ms.
    *   Cumulative Layout Shift (CLS): < 0.1.
*   **Throughput**: Support simultaneous expense submissions from 100+ concurrent users per tenant without degradation.

## 2. Security & Compliance
*   **Data Encryption**:
    *   **At Rest**: AES-256 for MongoDB Atlas and S3 Buckets.
    *   **In Transit**: TLS 1.3 for all HTTP traffic.
*   **Auth**: Token expiry < 1 hour; Refresh token rotation enabled.
*   **Input Sanitization**: All inputs validated via Zod; strict CSP headers configured.
*   **Audit**: 100% of write operations (Create/Update/Delete/Approve/Reject) must be logged in the Audit Trail.

## 3. Reliability & Availability
*   **Availability Target**: 99.9% uptime during business hours.
*   **Disaster Recovery**:
    *   **RPO (Recovery Point Objective)**: 1 hour (MongoDB Atlas Snapshots).
    *   **RTO (Recovery Time Objective)**: 4 hours.
*   **Fault Tolerance**: Stateless compute (Lambda/Serverless) deployed across multiple Availability Zones (AZs) by default.

## 4. Scalability (Multi-tenancy)
*   **Isolation**: Logical isolation enforcing `tenantId` on ALL queries.
*   **Storage**: S3 keys partitioned by tenant to allow future migration to separate buckets if needed (`tenants/{tenantId}/...`).
*   **Database**: Indexed by `{ tenantId: 1, ... }` to ensure performant queries as data grows.

## 5. Observability
*   **Logging**: Structured JSON logging for all Server Actions and API routes (request ID, tenant ID, user ID, latency).
*   **Tracing**: Distributed tracing (e.g., AWS X-Ray or OpenTelemetry) to track request flow from Edge -> Lambda -> DB.
*   **Alerting**: Alerts for:
    *   API Error Rate > 1%.
    *   Latency P95 > 1s.
    *   Lambda Throttling.

## 6. Usability & Accessibility
*   **Accessibility**: WCAG 2.1 AA Compliance. All interactive elements must have aria-labels and keyboard navigation support.
*   **Responsiveness**: Fully functional on Mobile (iOS/Android browsers) and Desktop.
*   **Internationalization (i18n)**: Ready for future currency/date format support (initially USD/ISO dates).

## 7. Maintainability
*   **Code Coverage**: Target > 80% coverage on Business Logic (Models + Services).
*   **Documentation**: API Spec and Architecture docs kept in sync with code via CI check (if possible) or manual review gates.
