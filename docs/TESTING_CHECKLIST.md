# CaseCraft Testing Checklist

**Testers:** Kass, Jesse
**Date:** February 7, 2026
**Version:** Phase 1 Complete

---

## Pre-Testing Setup

1. Ensure Supabase database has all migrations applied (001-004)
2. Verify `.env.local` has correct Supabase credentials
3. Run `npm run dev` to start the development server
4. Access the app at `http://localhost:3000`

---

## 1. Authentication Flow

### Registration
- [ ] Navigate to `/signup`
- [ ] Verify role selection UI displays (Attorney, Paralegal, Client, Researcher)
- [ ] Verify terms acceptance checkbox is required
- [ ] Create account with valid email/password
- [ ] Verify redirect to `/verify-email` page
- [ ] Check email for verification link
- [ ] Click verification link and verify auto-login

### Login
- [ ] Navigate to `/login`
- [ ] Login with verified account
- [ ] Verify redirect to `/dashboard`
- [ ] Verify "Forgot password?" link works

### Password Reset
- [ ] Click "Forgot password?" on login page
- [ ] Enter email and submit
- [ ] Check email for reset link
- [ ] Click reset link
- [ ] Set new password
- [ ] Verify login with new password works

### Logout
- [ ] Click "Sign Out" in sidebar
- [ ] Verify redirect to `/login`
- [ ] Verify protected routes require re-login

---

## 2. Role-Based Dashboards

### Attorney Dashboard
- [ ] Login as attorney role
- [ ] Verify attorney-specific dashboard displays
- [ ] Check all stats cards render (Cases, Documents, Blind Tests, Accuracy)
- [ ] Verify quick action cards (Run Prediction, Start Simulation, Find Weaknesses)
- [ ] Verify Recent Cases and Recent Predictions sections

### Paralegal Dashboard
- [ ] Login/create account as paralegal role
- [ ] Verify paralegal-specific dashboard displays
- [ ] Check document-focused quick actions

### Client Dashboard
- [ ] Login/create account as client role
- [ ] Verify simplified dashboard (view-only focus)
- [ ] Verify limited navigation options

### Researcher Dashboard
- [ ] Login/create account as researcher role
- [ ] Verify analytics-focused dashboard

---

## 3. Navigation & Sidebar

- [ ] Verify sidebar shows correct role badge
- [ ] Verify navigation items match user role permissions
- [ ] Test sidebar collapse/expand (desktop)
- [ ] Test mobile menu toggle
- [ ] Verify theme toggle (dark/light mode)
- [ ] Test all navigation links work

---

## 4. Case Management

### Cases List (`/dashboard/cases`)
- [ ] View cases list page
- [ ] Verify stats cards (Total, Active, Drafts, Blind Tests)
- [ ] Test search functionality (by case name)
- [ ] Test status filter (all, draft, active, closed, archived)
- [ ] Test case type filter
- [ ] Verify case cards display correctly
- [ ] Click through to case detail

### Case Creation (`/dashboard/cases/new`)
- [ ] Click "New Case" button
- [ ] **Step 1 - Basic Info:**
  - [ ] Enter case name (required)
  - [ ] Select case type (required)
  - [ ] Verify validation errors show for empty fields
- [ ] **Step 2 - Parties:**
  - [ ] Enter plaintiff name (optional)
  - [ ] Enter defendant name (optional)
- [ ] **Step 3 - Details:**
  - [ ] Enter case number (optional)
  - [ ] Enter jurisdiction (optional)
  - [ ] Enter summary (optional)
  - [ ] Select initial status (draft/active)
- [ ] **Step 4 - Review:**
  - [ ] Verify all entered data displays correctly
  - [ ] Click "Create Case"
  - [ ] Verify redirect to new case detail page

### Case Detail (`/case/[id]`)
- [ ] Verify case header shows correctly
- [ ] Test Share button (if owner)
- [ ] Test Export button
- [ ] Test case actions menu

#### Overview Tab
- [ ] Verify case summary displays
- [ ] Check Quick Stats section
- [ ] Test Case Strength Meter (if documents uploaded)
- [ ] Test Turbo Simulator

#### Agents Tab
- [ ] Verify default agents created (Judge, Plaintiff Attorney, Defense Attorney)
- [ ] Test agent creation
- [ ] Test agent editing
- [ ] Test agent activation/deactivation

#### Documents Tab
- [ ] Test document upload (drag & drop)
- [ ] Test document upload (click to select)
- [ ] Upload PDF, TXT, and MD files
- [ ] Verify auto-categorization
- [ ] Test embedding documents
- [ ] Verify document list updates

#### Facts Tab
- [ ] Test adding case facts
- [ ] Test editing facts
- [ ] Test fact categories

#### Conversations Tab
- [ ] Create new conversation
- [ ] Select conversation type
- [ ] Send message to agent
- [ ] Verify agent responds
- [ ] Verify correct agent attribution

#### Hearing Tab
- [ ] Select hearing type
- [ ] Start hearing simulation
- [ ] Verify agents take turns
- [ ] Test stop button
- [ ] Test transcript download (TXT)
- [ ] Test transcript download (PDF)
- [ ] Test mute toggle

#### Predict Tab
- [ ] Run prediction on case
- [ ] Verify prediction results display
- [ ] Check confidence score
- [ ] Check key factors
- [ ] For blind test cases: test reveal functionality

---

## 5. Case Sharing

- [ ] Open case as owner
- [ ] Click "Share" button
- [ ] Enter collaborator email
- [ ] Select permission level
- [ ] Submit share
- [ ] Verify share appears in list
- [ ] Test updating permission level
- [ ] Test removing share
- [ ] Test "Copy Link" button

---

## 6. Mobile Responsiveness

Test on mobile device or browser dev tools (responsive mode):

- [ ] Login page layout
- [ ] Signup page layout
- [ ] Dashboard layout
- [ ] Sidebar mobile menu
- [ ] Cases list page
- [ ] Case creation wizard
- [ ] Case detail page
- [ ] Chat interface
- [ ] Document upload

---

## 7. Error Handling

- [ ] Test invalid login credentials
- [ ] Test form validation messages
- [ ] Test network error recovery
- [ ] Verify error boundaries catch crashes

---

## 8. Performance

- [ ] Page load times reasonable
- [ ] No console errors in browser
- [ ] Smooth scrolling
- [ ] Quick response to clicks

---

## Known Issues / Limitations

1. Google Fonts may fail to load (network TLS issue) - doesn't affect functionality
2. OAuth (Google/Microsoft) not yet implemented
3. Email notifications not yet implemented
4. PDF export for hearings uses basic formatting

---

## Bug Report Template

**Description:**
[Clear description of the bug]

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[If applicable]

**Browser/Device:**
[e.g., Chrome on Mac, Safari on iPhone]

---

## Feedback Notes

_Space for testers to add general feedback:_




