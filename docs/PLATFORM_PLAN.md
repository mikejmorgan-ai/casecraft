# CaseCraft Platform Plan

## Executive Summary

CaseCraft is a legal AI prediction and case management platform. This document outlines the comprehensive roadmap for transforming it into a full-featured platform supporting diverse user roles from solo attorneys to enterprise legal teams.

---

## User Roles & Features

### A. Solo Attorney / Small Firm
| Feature | Priority | Description |
|---------|----------|-------------|
| Quick Case Analysis Dashboard | P1 | Redesigned dashboard with case-type-specific widgets |
| One-Click Prediction | P1 | Streamlined prediction flow from case list |
| Document Smart Upload | P1 | Auto-categorization during drag-drop upload |
| Strategy Recommendations | P2 | Post-prediction action items |
| Deadline Tracker | P2 | Timeline view with court deadlines |
| Mobile Quick Access | P3 | PWA with offline case summaries |

### B. Legal Assistant / Paralegal
| Feature | Priority | Description |
|---------|----------|-------------|
| Multi-Case Dashboard | P1 | Kanban/list view with filtering |
| Task Assignment | P1 | Assign tasks to team members |
| Document Organization | P1 | Folder structure, tagging |
| Attorney Status Reports | P2 | Exportable summaries |
| Timeline Builder | P2 | Visual case timeline editor |
| Deadline Alerts | P2 | Email/push notifications |

### C. Client (Self-Represented / Pro Se)
| Feature | Priority | Description |
|---------|----------|-------------|
| Simplified Dashboard | P1 | Jargon-free case status |
| Case Explainer Agent | P1 | "Explain like I'm not a lawyer" agent |
| Step-by-Step Guidance | P1 | Procedural checklist wizard |
| Document Templates | P2 | Pre-filled form templates |
| Court Appearance Prep | P2 | What-to-expect simulations |
| Cost Estimator | P3 | Filing fees, timeline estimates |

### D. Law Firm Administrator
| Feature | Priority | Description |
|---------|----------|-------------|
| Firm Dashboard | P1 | Multi-user analytics overview |
| User Management | P1 | Invite, roles, permissions |
| Case Assignment | P1 | Assign cases to attorneys |
| Usage Analytics | P2 | API calls, predictions, storage |
| Billing Integration | P2 | Stripe integration for seats |
| Audit Logs | P2 | Track all user actions |

### E. Legal Researcher / Academic
| Feature | Priority | Description |
|---------|----------|-------------|
| Advanced Search | P1 | Full-text + semantic search |
| Pattern Analysis | P1 | Outcome correlation tools |
| Data Export | P1 | CSV/JSON export for research |
| Citation Network | P2 | Visual case citation graph |
| Prediction Accuracy Dashboard | P2 | Historical accuracy metrics |
| API Access | P3 | REST API for bulk analysis |

---

## Feature Categories

### 1. Authentication & Security

| Feature | Priority | Status |
|---------|----------|--------|
| Email Verification | P1 | ✅ **Complete** |
| Terms Acceptance | P1 | ✅ **Complete** |
| OAuth (Google, Microsoft) | P1 | Planned |
| Forgot Password | P1 | ✅ **Complete** |
| Password Reset | P1 | ✅ **Complete** |
| Case Password Protection | P2 | Planned |
| RBAC System | P1 | ✅ **Complete** |
| Case Sharing | P2 | ✅ **Complete** |
| User Logout | P1 | ✅ **Complete** |
| Audit Logging | P2 | Planned |
| Session Management | P3 | Planned |
| 2FA/MFA | P3 | Planned |

### 2. Case Management

| Feature | Priority | Status |
|---------|----------|--------|
| Case Creation Wizard | P1 | ✅ **Complete** |
| Cases List with Search/Filter | P1 | ✅ **Complete** |
| Role-Based Dashboards | P1 | ✅ **Complete** |
| Case Detail Page | P1 | ✅ **Complete** |
| Case Predictions | P1 | ✅ **Complete** |
| Blind Testing System | P1 | ✅ **Complete** |
| Case Templates | P1 | Planned |
| Batch Case Import | P2 | Planned |
| Case Archiving | P2 | Planned |
| Case Cloning | P2 | Planned |
| Multi-Party Support | P2 | Planned |
| Case Timeline | P1 | Planned |
| Related Cases | P3 | Planned |

### 3. Document System

| Feature | Priority | Status |
|---------|----------|--------|
| Bulk Upload UI | P1 | Exists (enhance) |
| OCR Integration | P1 | Planned |
| Version Control | P2 | Planned |
| Document Templates | P2 | Planned |
| Auto-Categorization AI | P2 | Planned |
| Document Annotation | P2 | Planned |
| Redaction Tools | P3 | Planned |
| Document Comparison | P3 | Planned |

### 4. Agent System

| Feature | Priority | Status |
|---------|----------|--------|
| Custom Agent Creation | P1 | Planned |
| Agent Personality Tuning | P1 | Planned |
| Voice Chat | P2 | Planned |
| Agent Memory | P2 | Planned |
| Case-Type Specialists | P2 | Planned |
| Agent Marketplace | P3 | Planned |

### 5. Blind Test System

| Feature | Priority | Status |
|---------|----------|--------|
| User Test Creation | P1 | Exists (enhance) |
| Accuracy Dashboard | P1 | Planned |
| Leaderboard | P2 | Planned |
| A/B Strategy Testing | P2 | Planned |
| Confidence Calibration | P2 | Planned |
| Batch Predictions | P3 | Planned |

### 6. External Integrations

| Integration | Priority | Status |
|-------------|----------|--------|
| State Statute APIs | P2 | Planned |
| Court Filing (E-Filing) | P3 | Planned |
| Calendar (Google, Outlook) | P2 | Planned |
| Legal Research APIs | P3 | Planned |
| CRM (Clio, MyCase) | P3 | Planned |
| Stripe Billing | P2 | Planned |

### 7. Voice Features

| Feature | Priority | Status |
|---------|----------|--------|
| Voice-to-Text Notes | P2 | Planned |
| Voice Chat with Agents | P2 | Planned |
| Hearing Replay with TTS | P1 | Exists |
| Audio Transcription | P2 | Planned |
| Voice Commands | P3 | Planned |

### 8. Analytics & Reporting

| Feature | Priority | Status |
|---------|----------|--------|
| Case Outcome Stats | P1 | Planned |
| Prediction Accuracy | P1 | Planned |
| Time Tracking | P2 | Planned |
| Cost Estimation | P2 | Planned |
| Client Reports | P2 | Planned |
| Firm-Wide Analytics | P2 | Planned |

### 9. Collaboration

| Feature | Priority | Status |
|---------|----------|--------|
| Team Case Assignment | P1 | Planned |
| Comments/Annotations | P2 | Planned |
| Real-Time Collaboration | P3 | Planned |
| Notification System | P1 | Planned |
| Activity Feed | P2 | Planned |
| @Mentions | P2 | Planned |

### 10. Mobile Experience

| Feature | Priority | Status |
|---------|----------|--------|
| Responsive Improvements | P1 | In Progress |
| PWA Support | P2 | Planned |
| Offline Case Access | P2 | Planned |
| Push Notifications | P2 | Planned |
| Mobile-First Chat | P1 | Planned |

---

## Database Schema Additions

### New Tables Required

```sql
-- Organizations & Teams
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  billing_email VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  stripe_customer_id VARCHAR(100)
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(50) DEFAULT 'member'
);

-- Case Sharing
CREATE TABLE case_shares (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  shared_with_user_id UUID,
  permission_level VARCHAR(20) DEFAULT 'view'
);

-- Tasks
CREATE TABLE case_tasks (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  assigned_to UUID,
  title VARCHAR(255),
  due_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending'
);

-- Multi-Party Support
CREATE TABLE case_parties (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  party_type VARCHAR(50), -- plaintiff, defendant, third_party
  name VARCHAR(255),
  is_primary BOOLEAN DEFAULT false
);

-- Timeline Events
CREATE TABLE case_events (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  event_type VARCHAR(100),
  title VARCHAR(255),
  event_date TIMESTAMPTZ
);

-- Document Enhancements
CREATE TABLE document_versions (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  version_number INTEGER,
  file_path VARCHAR(500)
);

CREATE TABLE document_annotations (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  annotation_type VARCHAR(50),
  content TEXT,
  position JSONB
);

-- Agent Memory
CREATE TABLE agent_memory (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  case_id UUID REFERENCES cases(id),
  memory_type VARCHAR(50),
  content TEXT
);

-- Collaboration
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  user_id UUID,
  target_type VARCHAR(50),
  target_id UUID,
  content TEXT
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID,
  type VARCHAR(50),
  title VARCHAR(255),
  read_at TIMESTAMPTZ
);

-- Audit Logging
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  organization_id UUID,
  user_id UUID,
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB
);
```

---

## Phased Roadmap

### Phase 1: Foundation (8-10 weeks)
| Week | Deliverables |
|------|--------------|
| 1-2 | Email verification, forgot password, terms acceptance |
| 3-4 | RBAC system, case sharing (view/edit permissions) |
| 5-6 | Case creation wizard, case templates |
| 7-8 | Enhanced dashboard with role-based views |
| 9-10 | Notification system, activity feed |

### Phase 2: Enhanced Features (10-12 weeks)
| Week | Deliverables |
|------|--------------|
| 1-3 | Document OCR, version control, folder organization |
| 4-6 | Custom agent builder, agent memory persistence |
| 7-9 | Voice-to-text notes, voice chat with agents |
| 10-12 | Advanced prediction modes, accuracy dashboard |

### Phase 3: Collaboration & Teams (8-10 weeks)
| Week | Deliverables |
|------|--------------|
| 1-3 | Organizations/teams, member management |
| 4-6 | Comments, @mentions, real-time updates |
| 7-8 | Task assignment, deadline tracking |
| 9-10 | Team analytics, admin dashboard |

### Phase 4: Enterprise Features (12+ weeks)
| Week | Deliverables |
|------|--------------|
| 1-4 | Stripe billing, subscription tiers |
| 5-8 | Calendar integration, CRM sync |
| 9-12 | Audit logging, compliance features |
| 13+ | E-filing integration, API access |

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Email verification | High | Low | **P1** |
| RBAC system | High | Medium | **P1** |
| Case creation wizard | High | Medium | **P1** |
| Document OCR | High | Medium | **P1** |
| Case sharing | High | Medium | **P1** |
| Notification system | Medium | Medium | **P1** |
| Custom agents | Medium | Medium | P2 |
| Voice chat | Medium | High | P2 |
| Stripe billing | High | Medium | P2 |
| Real-time collaboration | Low | High | P3 |
| E-filing integration | Medium | Very High | P3 |

---

## Progress Log

### Completed (Phase 1 - February 2026)
- ✅ Email verification flow
- ✅ Forgot password / password reset
- ✅ Terms acceptance on signup
- ✅ RBAC system (5 roles: attorney, paralegal, client, admin, researcher)
- ✅ User profiles with role selection on signup
- ✅ Case sharing with permission levels (view/comment/edit/admin)
- ✅ Role-based dashboards (different views per role)
- ✅ Case creation wizard (4-step process)
- ✅ Cases list page with search/filter
- ✅ User logout functionality
- ✅ Agent attribution fix in chat interface
- ✅ Error handling components (ErrorBoundary, ErrorAlert, SuccessAlert)
- ✅ Loading spinner components

### In Progress
- 🔄 End-to-end testing preparation
- 🔄 UI/UX polish for testing session
- 🔄 Mobile responsiveness improvements

---

## Next Steps

1. **Immediate (Testing Phase)**
   - Complete end-to-end testing with Kass and Jesse
   - Fix any bugs discovered during testing
   - Polish mock hearing experience

2. **Short Term (Next 2-4 Weeks)**
   - Document OCR integration
   - PDF export for hearings and reports
   - Email notifications
   - Notification system

3. **Medium Term (1-2 Months)**
   - Custom agent builder
   - Voice chat with agents
   - Analytics dashboard

4. **Long Term (3+ Months)**
   - Team collaboration
   - Enterprise billing
   - E-filing integration
