# CaseBreak.ai Homepage Improvement Plan

## Overview Assessment

### Current State Analysis

**Homepage Location:** `/src/app/page.tsx`

**Current Structure:**
- Header with logo and Sign In/Get Started buttons
- Hero section with "Legal Simulation Platform" headline
- Features section with 4 cards (AI Legal Agents, Document RAG, Mock Proceedings, Strategy Sessions)
- CTA section with "Create Free Account" button
- Minimal footer with logo and "AI-powered legal simulation platform" text

**Current Issues Identified:**

1. **Hover State Bug:** Black font turns white on hover, creating white-on-white text
2. **Header:** Not sticky, no glass effect on scroll
3. **Tool Icons:** Nearly invisible, need royal blue neon treatment
4. **Feature Cards:** No hover animations
5. **Missing Section:** No animated section showing Judge AI workflow
6. **CTA Button:** No hover animation on "Create a free account"
7. **Footer:**
   - Missing "Powered by AIVH" branding
   - No legal disclaimers
   - No navigation links (Policy, About Us, Terms, Pricing)
8. **Authentication:** No Google OAuth setup, only email/password
9. **Dependencies:** Framer Motion not installed for animations

---

## Agent 1: Content & CTA Agent

### Responsibilities
- Review and update all public-facing content
- Improve CTAs and value propositions
- Ensure no client case data is exposed
- Add legal disclaimers and protections

### Tasks

#### 1.1 Hero Section Content
- [ ] Review headline "Legal Simulation Platform" for impact
- [ ] Update subtext to be more compelling
- [ ] Ensure CTA "Start Simulating" is action-oriented

#### 1.2 Feature Cards Content
- [ ] Review all 4 feature descriptions for clarity
- [ ] Add benefit-focused messaging
- [ ] Ensure professional legal terminology

#### 1.3 CTA Section
- [ ] Update "Ready to transform your legal practice?" headline
- [ ] Improve secondary text
- [ ] Button text review

#### 1.4 Footer Content
- [ ] Change "AI-powered legal simulation platform" to "Powered by AIVH"
- [ ] Add "All rights reserved" with current year
- [ ] Add legal disclaimer text:
  - "CaseBreak.ai is a simulation platform for educational and practice purposes only"
  - "Not a substitute for professional legal advice"
  - "No attorney-client relationship is formed"

#### 1.5 Add Footer Navigation Links
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] About Us
- [ ] Pricing
- [ ] Contact

#### 1.6 Security Review
- [ ] Audit page for any client case data exposure
- [ ] Ensure no sensitive information in public content
- [ ] Review meta tags and SEO content

---

## Agent 2: Style, UI/UX & Animations Agent

### Responsibilities
- Fix hover state issues
- Implement sticky header with glass effect
- Add royal blue neon to icons
- Create tile hover animations
- Build Framer Motion animated section
- Add button hover animations
- Ensure light/dark mode compatibility

### Tasks

#### 2.1 Dependencies
- [ ] Install framer-motion package
- [ ] Verify tw-animate-css is properly configured

#### 2.2 Fix Hover State Bug
- [ ] Fix white-on-white text issue on hover
- [ ] Ensure proper color contrast in all states
- [ ] Test in both light and dark modes

#### 2.3 Sticky Header with Glass Effect
```css
/* Example implementation */
header {
  position: sticky;
  top: 0;
  backdrop-filter: blur(12px);
  background: rgba(20, 20, 30, 0.8);
  transition: all 0.3s ease;
}
```
- [ ] Implement sticky positioning
- [ ] Add glass/blur effect on scroll
- [ ] Ensure smooth transition

#### 2.4 Icon Styling - Royal Blue Neon
- [ ] Define royal blue neon color: `#4169E1` with glow effect
- [ ] Apply to all tool icons in feature cards
- [ ] Add subtle animation on hover
```css
/* Example */
.icon-neon {
  color: #4169E1;
  filter: drop-shadow(0 0 8px rgba(65, 105, 225, 0.6));
}
```

#### 2.5 Feature Card Hover Animations
- [ ] Add scale transform on hover
- [ ] Add shadow elevation effect
- [ ] Smooth border highlight animation
```css
/* Example */
.feature-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

#### 2.6 New Animated Section - "How CaseBreak.ai Works"
Using Framer Motion to show:
1. Judge AI as "The Law" (center figure)
2. Cases flow in from sides
3. Legal simulation process animated
4. Results/outcomes visualization

Components needed:
- [ ] Create `HowItWorks.tsx` component
- [ ] Implement scroll-triggered animations
- [ ] Add staggered entry animations
- [ ] Show workflow: Upload Case → Judge Analyzes → Simulation Runs → Insights Generated

#### 2.7 CTA Button Hover Animation
- [ ] Add pulse/glow effect on "Create Free Account"
- [ ] Scale transform on hover
- [ ] Color transition animation

#### 2.8 Light/Dark Mode Polish
- [ ] Verify all new styles work in both modes
- [ ] Ensure icon glow adapts to theme
- [ ] Test glass effect in both modes

---

## Agent 3: Authentication & Onboarding Agent

### Responsibilities
- Set up Google OAuth authentication
- Ensure APIs are working
- Verify database connections
- Improve user onboarding flow

### Tasks

#### 3.1 Google OAuth Setup

**Supabase Configuration:**
- [ ] Enable Google provider in Supabase Auth settings
- [ ] Add Google OAuth credentials
- [ ] Configure redirect URLs

**Code Implementation:**
- [ ] Update login page with Google Sign-In button
- [ ] Update signup page with Google Sign-Up button
- [ ] Implement Google auth handler:
```typescript
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
}
```
- [ ] Create `/auth/callback/route.ts` for OAuth callback handling

#### 3.2 Auth Callback Route
- [ ] Create callback route to handle OAuth redirects
- [ ] Exchange code for session
- [ ] Redirect to dashboard on success

#### 3.3 API Health Check
- [ ] Test `/api/cases` endpoint
- [ ] Test `/api/chat` endpoint
- [ ] Verify OpenAI API integration
- [ ] Check Pinecone connection for vector search

#### 3.4 Database Connection Verification
- [ ] Test Supabase connection
- [ ] Verify RLS policies are active
- [ ] Test user profile creation on signup

#### 3.5 User Onboarding Flow
- [ ] Review signup flow for friction points
- [ ] Add role selection improvements
- [ ] Consider welcome email setup
- [ ] Add first-case wizard consideration

#### 3.6 Environment Variables Check
Required variables:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `PINECONE_API_KEY`
- [ ] Google OAuth credentials (in Supabase dashboard)

---

## Technical Implementation Details

### New Files to Create
1. `/src/components/landing/HowItWorks.tsx` - Animated workflow section
2. `/src/components/landing/Footer.tsx` - Comprehensive footer
3. `/src/app/auth/callback/route.ts` - OAuth callback handler
4. `/src/app/(legal)/privacy/page.tsx` - Privacy policy page (stub)
5. `/src/app/(legal)/terms/page.tsx` - Terms of service page (stub)

### Files to Modify
1. `/src/app/page.tsx` - Homepage updates
2. `/src/app/globals.css` - New styles and animations
3. `/src/app/(auth)/login/page.tsx` - Add Google auth
4. `/src/app/(auth)/signup/page.tsx` - Add Google auth
5. `/package.json` - Add framer-motion

### Color Definitions
```css
:root {
  /* Royal Blue Neon */
  --color-royal-blue: #4169E1;
  --color-royal-blue-glow: rgba(65, 105, 225, 0.6);

  /* Glass Effect */
  --glass-background: rgba(20, 20, 30, 0.8);
  --glass-blur: 12px;
}
```

---

## Success Criteria

### Agent 1 Success Metrics
- [ ] All content professionally written
- [ ] Legal disclaimers in place
- [ ] No client data exposure
- [ ] Footer complete with all links

### Agent 2 Success Metrics
- [ ] No white-on-white hover bug
- [ ] Smooth sticky header with glass effect
- [ ] Icons visible with royal blue neon glow
- [ ] Feature cards animate on hover
- [ ] New "How It Works" section with Framer Motion
- [ ] CTA button has hover animation
- [ ] Both light/dark modes work

### Agent 3 Success Metrics
- [ ] Google OAuth functional
- [ ] OAuth callback working
- [ ] All APIs responding
- [ ] Database connected
- [ ] Clean onboarding flow

---

## Execution Order

1. **Parallel Phase:** All 3 agents can start simultaneously
   - Agent 1: Begin content audit and updates
   - Agent 2: Install framer-motion, fix hover bug, start styling
   - Agent 3: Begin Google OAuth setup

2. **Integration Phase:** After initial work
   - Merge all changes to homepage
   - Test interactions between components
   - Verify no conflicts

3. **Testing Phase:**
   - Full page test in both themes
   - Authentication flow test
   - Animation performance check
   - Mobile responsiveness verification

---

*Plan created: 2026-02-13*
*Branch: claude/review-repo-next-steps-Blfe0*
