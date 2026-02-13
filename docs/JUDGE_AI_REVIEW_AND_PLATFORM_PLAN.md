# CaseCraft Judge AI Review & Platform Plan

**Date:** February 13, 2026
**Case Reference:** Tree Farm LLC v. Salt Lake County (Case No. 220903418)
**Authors:** Jesse Hawkins-Munoz (Testing), Kassidy J. Wallin (Legal), Platform Architect, Senior Software Architect

---

## Executive Summary

Four independent agents reviewed the CaseCraft Judge AI and multi-agent architecture:

| Agent | Focus | Overall Grade |
|-------|-------|---------------|
| Jesse (Business Owner) | Statute knowledge, key dates, verbatim accuracy | **B+** |
| Kass (Attorney) | Legal sophistication, doctrinal precision | **B+** |
| Platform Architect | Judge enablement across jurisdictions | Design Complete |
| Software Architect | Multi-agent architecture scalability | Critical Gaps Identified |

**Key Finding:** The Judge AI has solid foundational training on Utah mining law but needs enhancements for production-ready litigation support.

---

## Part 1: Jesse's Test Report (Business Owner Perspective)

### 15 Critical Test Questions

#### Question 1: Verbatim Definition of "Mine Operator"
**Q:** "What's the EXACT definition of 'mine operator' under Utah Code? Quote it verbatim."

**Expected Answer:**
> "Mine operator" means a natural person, corporation, association, partnership, receiver, trustee, executor, administrator, guardian, fiduciary, agent, or other organization or representative, either public or private, including a SUCCESSOR, ASSIGN, AFFILIATE, SUBSIDIARY, and RELATED PARENT COMPANY, that, ON OR BEFORE JANUARY 1, 2019:
> (a) owns, controls, or manages a mining use under a large mine permit; AND
> (b) has produced commercial quantities of a mineral deposit.

**Source:** § 17-41-101(13) / § 17-81-101(13)

#### Question 2: January 1, 2019 Significance
**Q:** "What happened on January 1, 2019 and why does it matter?"

**Expected Answer:**
- **Anchor date** for mine operator qualification
- ONE-TIME THRESHOLD, not ongoing requirement
- Added by HB288 (effective May 14, 2019)
- Once crossed, status is **permanent**
- Continuous operations NOT required

#### Question 3: Portland Cement → Tree Farm Vesting Analysis
**Q:** "If Portland Cement was mining in the 1890s and Tree Farm bought in 2020, does Tree Farm have vested rights?"

**Expected 4-Step Analysis:**
1. **Pre-dates zoning:** Mining 1800s → County regulation 1975 ✓
2. **Mine operator exists:** Large permit (1996) + commercial quantities (90,000+ tons 1994) ✓
3. **Vested mining use:** Conclusively presumed under § 17-41-501(1)(a) ✓
4. **Runs with land:** Transfers automatically to Tree Farm ✓

#### Question 4: Burden of Proof
**Q:** "Who has the burden? What standard?"

**Expected Answer:**
- **CHALLENGER** (Salt Lake County) has burden
- Standard: **CLEAR AND CONVINCING EVIDENCE**
- Tree Farm doesn't prove vesting; County must disprove it
- **Source:** § 17-41-501(1)(b)

#### Question 5-15: Additional Critical Tests
| # | Question | Key Elements Expected |
|---|----------|----------------------|
| 5 | Recorded declaration effect | Constructive notice, compliance with § 17-41-501(4) |
| 6 | Section crosswalk (17-41-501) | Now § 17-81-401 (Nov 6, 2025) |
| 7 | Gaps in operations | Do NOT terminate vesting (separate abandonment provision) |
| 8 | Conclusive presumption meaning | Cannot be rebutted, strongest form |
| 9 | Expansion rights | § 17-41-502: progress, extend, enlarge, grow, expand |
| 10 | Permit boundary limits | Do NOT limit vested rights per § 17-41-501(3) |
| 11 | Preemption language | "may not" = mandatory prohibition |
| 12 | Critical infrastructure materials | Sand, gravel, rock = protected under HB288 |
| 13 | Amendment timeline | 2009 (created) → 2019 (HB288) → 2025 (recodification) |
| 14 | Gibbons & Reed doctrine | Diminishing assets, extractive expansion rights |
| 15 | What County must prove | No large mine permit OR no commercial quantities before Jan 1, 2019 |

### Gaps Identified

| Gap | Location | Impact |
|-----|----------|--------|
| Abandonment statute text missing | Only referenced, not quoted | Cannot apply abandonment analysis |
| Change of use procedure incomplete | 60-day hearing not detailed | May miss procedural requirements |
| Large mine permit threshold | "5+ acres" incomplete | Should be "5 acres OR 1,000+ tons/year" |
| Commercial quantities vague | "Production for sale" | No minimum quantity guidance |

### Jesse's Recommendations
1. Add full text of § 17-41-503 / § 17-81-403 (Abandonment)
2. Add critical infrastructure materials statutes (17-27a sections)
3. Clarify large mine permit threshold per DOGM regulations
4. Add Tree Farm-specific fact sheet with key dates
5. Add Ordinance 1895 analysis framework
6. Add explicit Carrier v. Salt Lake County distinction

---

## Part 2: Kass's Legal Test Report (Attorney Perspective)

### 12 Sophisticated Legal Questions

#### Question 1: Conclusive vs. Rebuttable Presumption
**Q:** "What is the legal effect of a 'conclusive presumption'?"

**Expected Doctrinal Answer:**
- **Conclusive presumption** = irrebuttable presumption
- Once foundational facts proven, presumed fact is CONCLUSIVE
- No contrary evidence permitted - court MUST find the presumed fact
- **Rebuttable presumption** = shifts burden but can be defeated
- Legislature chose "conclusively presumed" deliberately

#### Question 2: Four-Step Vested Mining Use Analysis

1. **Temporal Precedence:** Mining exists before restriction
2. **Mine Operator Qualification:** Large permit + commercial quantities on/before Jan 1, 2019
3. **Vested Mining Use Determination:** Mining by mine operator before restriction
4. **Succession/Transfer:** Runs with land, successor inherits

#### Question 3: Distinguishing Carrier v. Salt Lake County

**Q:** "When County argues Carrier controls, what's wrong?"

**Expected Rebuttal Framework:**
1. **Different statute:** Pre-HB288 framework (2004 vs. 2019+)
2. **Different material:** Critical infrastructure didn't exist
3. **Different preemption:** § 17-41-402(6) post-dates Carrier
4. **Different law:** 15 years of legislative amendments

**Counter:** "Carrier was decided in 2004 under a statutory scheme that no longer exists."

#### Question 4: § 17-41-402 and § 17-41-501 Relationship

**Belt and Suspenders Protection:**
- **§ 17-41-402** = PROSPECTIVE (prevents future restrictions)
- **§ 17-41-501** = RETROACTIVE (protects existing operations)
- Either way, mine operator is protected

#### Question 5: Ordinance 1895 Timing Analysis

**Timeline:**
- November 17, 2021: Tree Farm files NOI
- December 15, 2021: County passes Ordinance 1895
- **28 days apart**

**Legal Significance:**
1. Mining pre-dated ordinance → conclusively presumed vested
2. No written approval from mine operator → § 17-41-402(5) violation
3. Inference of retaliation (bad faith argument)

#### Question 6: "Successor" Language Analysis

**Statutory Text:** Definition INCLUDES "successor, assign, affiliate, subsidiary, and related parent company"

**Critical Point:** Successor IS a mine operator - not "may qualify" but "IS"
- Threshold test applies to PREDECESSOR
- No separate qualification required
- Tree Farm inherits status from Rulon Harper/Rock and Roll

#### Additional Questions 7-12

| # | Question | Key Doctrinal Points |
|---|----------|---------------------|
| 7 | "Runs with land" doctrine | Automatic transfer, like easement appurtenant |
| 8 | HB288 January 1, 2019 intent | Anti-gaming provision, protect EXISTING operations |
| 9 | Mining use vs. vested mining use | Different legal meanings (see table) |
| 10 | § 17-41-402 CUP argument | Preemption applies, cannot deny based on existence |
| 11 | Expert witness needs | DOGM production records, mining engineer |
| 12 | Appeal trajectory | Constitutional claims, "runs with land" federal |

### Kass's Doctrinal Gaps Identified

1. **Carrier distinction not explicit** - County WILL cite this case
2. **"Runs with land" needs property law context**
3. **Legislative intent could be strengthened** with anti-gaming rationale
4. **Mining use vs. vested mining use table** should be in training

### Kass's Recommendations
1. Add explicit Carrier v. Salt Lake County analysis framework
2. Add property law doctrine context for "runs with land"
3. Strengthen legislative intent with HB288 floor testimony
4. Add mining use / vested mining use comparison table
5. Include procedural posture guidance (summary judgment standard)
6. Add appellate trajectory analysis

---

## Part 3: Judge Enablement Platform Plan

### 1. Judge Configuration Model

#### Mandatory Configuration Fields

```
JUDGE CONFIGURATION FORM
========================

[ Jurisdiction Selection ]
Primary Jurisdiction:     [Dropdown: State/Federal/International]
State:                   [Dropdown: Utah, California, Texas, ...]
County:                  [Dropdown: Salt Lake, Los Angeles, ...]
Court Level:             [Dropdown: District, Appeals, Supreme]

[ Legal Domain ]
Primary Practice Area:   [Dropdown: Mining, Property, Contract, ...]
Secondary Areas:         [Multi-select checkboxes]

[ Temporal Settings ]
Case Filing Date:        [Date picker] ← Critical for statute versioning
Relevant Dates:          [Date range] ← For law-as-of-date analysis

[ Judicial Philosophy ]
[ ] Textualist (apply plain text)
[ ] Purposivist (consider legislative intent)
[ ] Originalist (historical meaning)
[x] Neutral/Mixed (default)

[ Impartiality Safeguards ]
[x] Never advocate for parties (mandatory, cannot uncheck)
[x] Quote statutes verbatim (mandatory)
[x] Cite specific section numbers
[x] Distinguish holdings from dicta
[x] Apply burden of proof correctly

[ Knowledge Sources ]
[x] Statutory text (required)
[x] Case law holdings
[x] Section crosswalks (for recodifications)
[ ] Administrative regulations
[ ] Legislative history
```

### 2. Jurisdiction Framework Design

```
JURISDICTION HIERARCHY
======================

┌─────────────────────────────────────────────────────────────┐
│                    INTERNATIONAL                             │
│  (Common Law vs. Civil Law systems)                          │
├─────────────────────────────────────────────────────────────┤
│                    FEDERAL LAW                               │
│  (Constitution, Federal Statutes, Federal Rules)             │
├──────────────────────┬──────────────────────────────────────┤
│   STATE LAW          │   STATE LAW          │   STATE LAW   │
│   (Utah)             │   (California)       │   (Texas)     │
├──────────────────────┼──────────────────────┼───────────────┤
│ County Rules         │ County Rules         │ County Rules  │
│ (Salt Lake)          │ (Los Angeles)        │ (Harris)      │
├──────────────────────┼──────────────────────┼───────────────┤
│ City Ordinances      │ City Ordinances      │ City Ord.     │
│ (SLC)                │ (LA)                 │ (Houston)     │
└──────────────────────┴──────────────────────┴───────────────┘

CONFLICT RESOLUTION RULES:
1. Federal > State (Supremacy Clause)
2. State > County > City
3. Later amendment > Earlier version
4. Specific > General
5. Constitutional > Statutory
```

### 3. Law Library Data Model

```sql
-- Jurisdictions table
CREATE TABLE jurisdictions (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'federal', 'state', 'county', 'city', 'international'
  parent_id UUID REFERENCES jurisdictions(id),
  iso_code VARCHAR(10), -- 'US-UT', 'US-CA', etc.
  timezone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Statutes table (with versioning)
CREATE TABLE statutes (
  id UUID PRIMARY KEY,
  jurisdiction_id UUID REFERENCES jurisdictions(id),
  section_number VARCHAR(50) NOT NULL,
  title VARCHAR(500),
  full_text TEXT NOT NULL, -- Verbatim statutory text
  effective_date DATE NOT NULL,
  repeal_date DATE, -- NULL if current
  bill_number VARCHAR(50), -- 'HB288', 'SB1006'
  version INTEGER DEFAULT 1,
  previous_section VARCHAR(50), -- For recodifications
  elements JSONB, -- Parsed legal elements
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Section crosswalks
CREATE TABLE section_crosswalks (
  id UUID PRIMARY KEY,
  jurisdiction_id UUID REFERENCES jurisdictions(id),
  old_section VARCHAR(50) NOT NULL,
  new_section VARCHAR(50) NOT NULL,
  effective_date DATE NOT NULL,
  bill_number VARCHAR(50),
  change_type VARCHAR(50) -- 'recodification', 'amendment', 'repeal'
);

-- Case law table
CREATE TABLE case_law (
  id UUID PRIMARY KEY,
  jurisdiction_id UUID REFERENCES jurisdictions(id),
  citation VARCHAR(255) NOT NULL UNIQUE,
  case_name VARCHAR(500),
  decision_date DATE,
  court_level VARCHAR(50), -- 'supreme', 'appeals', 'district'
  holding TEXT, -- Binding holding
  dicta TEXT, -- Non-binding commentary
  overruled_by UUID REFERENCES case_law(id),
  distinguishing_factors TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Judge configurations per case
CREATE TABLE judge_configurations (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  jurisdictions UUID[] NOT NULL, -- Array of jurisdiction IDs
  practice_areas VARCHAR(50)[] NOT NULL,
  judicial_philosophy VARCHAR(50) DEFAULT 'neutral',
  case_filing_date DATE,
  enabled_sources VARCHAR(50)[] DEFAULT ARRAY['statutes', 'case_law'],
  impartiality_settings JSONB DEFAULT '{"verbatim_quotes": true, "cite_sections": true}',
  custom_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Quality Assurance Framework

```
AUTOMATED TESTING MATRIX
========================

[ ] Verbatim Accuracy Tests
    - Quote statute text → Verify exact match
    - Section number → Verify crosswalk correct
    - Amendment date → Verify effective date correct

[ ] Legal Reasoning Tests
    - Element identification → All elements listed
    - Burden allocation → Correct party identified
    - Standard of proof → Correct standard cited

[ ] Impartiality Tests
    - Advocacy detection → Reject if advocating
    - Balanced analysis → Both sides considered
    - Law over preference → Apply even if disagreeable

[ ] Temporal Accuracy Tests
    - Historical queries → Correct law version returned
    - Recodification → Old section → new section mapping
    - Amendment timeline → Correct sequence
```

---

## Part 4: Architecture Review - Making CaseCraft Remarkable

### Current State Assessment

**Strengths:**
- Well-structured agent personas (Judge Stormont methodology)
- Sophisticated legal knowledge base (utah-mining-statutes.ts)
- Role-based RAG filtering
- Comprehensive RBAC system

**Critical Weaknesses:**
1. **Agents are personas, not services** - Cannot call each other
2. **No agent-to-agent communication**
3. **Hardcoded legal knowledge** - Cannot update without deployment
4. **MCP underutilized** - Only UI components configured

### Recommended Architecture

```
PROPOSED: TOOL-BASED AGENT CALLING
==================================

┌─────────────────────────────────────────────────────────────────┐
│                    JUDGE STORMONT (Primary Agent)                │
├─────────────────────────────────────────────────────────────────┤
│  TOOLS AVAILABLE:                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐     │
│  │ consult_law_    │ │ query_county_   │ │ query_dogm_     │     │
│  │ clerk(question) │ │ recorder(query) │ │ records(query)  │     │
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘     │
│           │                   │                   │              │
│           ▼                   ▼                   ▼              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐     │
│  │ UTAH LAW CLERK  │ │ COUNTY RECORDER │ │ DOGM AGENT      │     │
│  │   (Sub-Agent)   │ │   (Sub-Agent)   │ │   (Sub-Agent)   │     │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### MCP Tool Definitions

```json
{
  "mcpServers": {
    "shadcn": { "command": "npx", "args": ["shadcn@latest", "mcp"] },
    "utah_law_clerk": {
      "command": "node",
      "args": ["./mcp/utah-law-clerk.js"],
      "tools": [
        {
          "name": "lookup_statute",
          "description": "Look up verbatim text of a Utah statute",
          "parameters": {
            "section": "string (e.g., '17-81-401')",
            "as_of_date": "string (optional, for historical versions)"
          }
        },
        {
          "name": "get_section_crosswalk",
          "description": "Convert old section numbers to new after recodification",
          "parameters": {
            "old_section": "string"
          }
        }
      ]
    },
    "county_recorder": {
      "command": "node",
      "args": ["./mcp/county-recorder.js"],
      "tools": [
        {
          "name": "search_chain_of_title",
          "description": "Search property ownership history"
        },
        {
          "name": "find_declarations",
          "description": "Find recorded declarations by entry number"
        }
      ]
    },
    "dogm_agent": {
      "command": "node",
      "args": ["./mcp/dogm-agent.js"],
      "tools": [
        {
          "name": "lookup_permit",
          "description": "Look up mining permit by file number"
        },
        {
          "name": "get_production_records",
          "description": "Get production quantities by year"
        }
      ]
    }
  }
}
```

### 10 Remarkable Enhancements

1. **Opposing Counsel Agent** - Stress-test arguments before trial
2. **Real-time Statute API** - Live connection to le.utah.gov
3. **Document RAG with Legal Citations** - Auto-cite to case documents
4. **Case Outcome Learning** - Learn from verdicts to improve predictions
5. **Appellate Trajectory Analysis** - Predict appeal outcomes
6. **Expert Witness Finder** - Match experts to case needs
7. **Settlement Range Calculator** - Data-driven settlement analysis
8. **Timeline Generator** - Visual case timeline from documents
9. **Argument Strength Meter** - Quantify argument quality
10. **Jurisdictional Conflict Detector** - Flag law conflicts automatically

### Phased Implementation Roadmap

**Phase 1: Foundation (Weeks 1-4)**
- Implement statute versioning database
- Create jurisdiction configuration UI
- Add section crosswalk functionality

**Phase 2: Agent Communication (Weeks 5-8)**
- Implement MCP tool definitions
- Enable Judge → Specialist tool calling
- Add agent registry and discovery

**Phase 3: Scale (Weeks 9-12)**
- Namespace vector stores by case
- Add California and Texas jurisdictions
- Implement knowledge version control

**Phase 4: Remarkable (Weeks 13-16)**
- Opposing Counsel stress-testing
- Case outcome learning pipeline
- Real-time statute API integration

---

## Consolidated Recommendations

### Immediate Fixes (This Sprint)

1. **Add abandonment statute text** - § 17-41-503 / § 17-81-403
2. **Add Carrier v. Salt Lake County distinction** - Judge needs this for trial
3. **Fix large mine permit threshold** - "5 acres OR 1,000+ tons/year"
4. **Add Ordinance 1895 timeline analysis**

### Short-term Enhancements (Next 2 Sprints)

1. **Create jurisdiction configuration UI**
2. **Implement statute versioning database**
3. **Add section crosswalk lookup tool**
4. **Create automated testing matrix**

### Long-term Strategic Goals

1. **Multi-jurisdiction support** - California, Texas, Federal
2. **MCP-enabled agent communication**
3. **Real-time legal research APIs**
4. **Case outcome learning system**

---

## Files Referenced

- `/home/user/casecraft/src/lib/ai/prompts.ts` - Agent prompts
- `/home/user/casecraft/src/lib/legal/utah-mining-statutes.ts` - Statute knowledge
- `/home/user/casecraft/scripts/seed-multi-agent-system.ts` - Agent definitions
- `/home/user/casecraft/scripts/test-utah-judge.ts` - Existing test framework
- `/home/user/casecraft/.mcp.json` - MCP configuration

---

*Report generated by CaseCraft Multi-Agent Review System*
*Case: Tree Farm LLC v. Salt Lake County (No. 220903418)*
