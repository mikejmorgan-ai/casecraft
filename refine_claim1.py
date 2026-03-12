#!/usr/bin/env python3
"""
Second-pass refinement of Claim 1 analysis.
Upgrades key documents found through manual review,
downgrades false positives, and adds proper key finding classifications.
"""
import sqlite3
import os
import re

DB_PATH = os.path.expanduser("~/tree-farm-discovery/master.db")
DATA_DIR = "/home/user/casebreak/data"

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# =====================================================================
# PHASE 1: Manual overrides for key documents identified during review
# =====================================================================

# Key documents that need specific manual classification
manual_overrides = {
    # --- THE ORDINANCE TEXT ITSELF ---
    'SLCo002565': {
        'title': 'Proposed Ordinance: Amendment to Section 19.12.030 - Prohibiting Mineral Extraction in FR Zone',
        'date': '2022',
        'type': 'ordinance',
        'summary': 'The actual ordinance text amending Salt Lake County Code to eliminate mineral extraction as conditional use and explicitly prohibit "mineral extraction and processing; mine; quarry; gravel pit; including crushers or concrete batching plants used in connection with and as a part of an operation for the removal of sand, gravel and/or rock aggregate." This is the ordinance at issue in Claim 1.',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'This IS the challenged ordinance. It explicitly prohibits "sand, gravel and/or rock aggregate" which are CIM by statutory definition under Utah Code 10-9a-901(1). This directly proves the ordinance violates 17-41-402(6).',
        'key_quote': 'The following uses are explicitly prohibited in this chapter: mineral extraction and processing; mine; quarry; gravel pit; including crushers or concrete batching plants used in connection with and as a part of an operation for the removal of sand, gravel and/or rock aggregate.',
        'key_finding': True,
        'sg_why': 'The ordinance text itself expressly prohibits "sand, gravel and/or rock aggregate" - which are the statutory definition of Critical Infrastructure Materials under Utah Code 10-9a-901(1). This proves the ordinance prohibits CIM operations in violation of 17-41-402(6).',
        'sg_use': 'Lead exhibit. Compare ordinance language to 10-9a-901(1) CIM definition. The match is exact. Then show 17-41-402(6) prohibition on adopting ordinances that prohibit CIM operations.',
    },

    # --- BATEMAN LETTER TO SHAW (Feb 11, 2022) ---
    'SLCo015177': {
        'title': 'Bateman Letter to Zach Shaw re CIM Preemption Warning',
        'date': 'February 11, 2022',
        'type': 'letter',
        'summary': 'Tree Farm attorney Brent Bateman letter to County DA Zach Shaw warning that proposed ordinances to restrict mining/extraction of CIM from Parleys Canyon properties will violate Utah Code 17-41-402(6). Cites statutory language that county "may not adopt, enact, or amend" ordinances prohibiting CIM operations. Notes Tree Farm has vested CIM operations pre-dating 1972 zoning.',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'First formal written warning to County that proposed ordinance violates 17-41-402(6). County received this warning before passing ordinance. Establishes County had actual notice of preemption issue.',
        'key_quote': 'Utah Code 17-41-402(6) reads: A county, city, or town may not: adopt, enact, or amend an existing land use regulation, ordinance, or regulation that would prohibit, restrict, regulate, or otherwise limit critical infrastructure materials operations... Salt Lake County cannot legally adopt new ordinances that will restrict extraction of critical infrastructure materials on my client\'s property.',
        'key_finding': True,
        'sg_why': 'Written preemption warning to County before ordinance passed. County ignored this warning and proceeded anyway. Shows County acted with full knowledge of illegality.',
        'sg_use': 'Show County had actual notice of preemption issue before passing ordinance. Pair with DA response (SLCo003697) showing County deflected rather than addressing merits.',
    },

    # --- BATEMAN LETTER TO COUNTY COUNCIL (April 5, 2022) ---
    'SLCo007457': {
        'title': 'Bateman Public Comment Letter to County Council re Ordinance Illegality',
        'date': 'April 5, 2022',
        'type': 'letter',
        'summary': 'Bateman submits public comment to County Council on day of vote. States ordinance is "blatantly contrary to Utah Code 17-41-402(6)." Notes that despite styling as prohibiting "mineral extraction," the text expressly prohibits "sand, gravel and/or rock aggregate" which ARE CIM. States no one at County has bothered to explain how ordinance complies with state code.',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'Second warning to County on day of vote. Specifically points out that ordinance text prohibits CIM materials regardless of how it is styled. County Council proceeded to vote anyway. Shows predetermined outcome.',
        'key_quote': 'This ordinance is blatantly contrary to Utah Code 17-41-402(6)... "Critical infrastructure materials" means sand, gravel, or rock aggregate. Utah Code 10-9a-901(1). Although I have pointed this out, no one at the County has bothered to explain to me how this ordinance complies with this state code section... the text of the ordinance expressly prohibits extraction of "sand, gravel and/or rock aggregate." Thus, where it was not prohibited before, this ordinance clearly prohibits critical infrastructure materials. Thus, it is illegal.',
        'key_finding': True,
        'sg_why': 'Direct public comment to Council on day of vote demonstrating ordinance text expressly prohibits CIM. Council ignored this and voted unanimously to pass. Proves predetermined outcome and willful disregard of state law.',
        'sg_use': 'Pair with ordinance text (SLCo002565) and vote record. Show Council received this warning, had it read into the record, then voted unanimously anyway. Proves bad faith.',
    },

    # --- DA LETTER TO OMBUDSMAN (April 7, 2022) ---
    'SLCo003697': {
        'title': 'DA Bywater Letter to Property Rights Ombudsman re Tree Farm Mediation',
        'date': 'April 7, 2022',
        'type': 'letter',
        'summary': 'Deputy DA Timothy Bywater writes to Ombudsman Jordan Cullimore. Claims "proposed amendments do not include any reference to critical infrastructure materials or critical infrastructure materials operations." Argues this means ordinance does not conflict with 17-41-406. This is a false/misleading statement because the ordinance expressly prohibits "sand, gravel and/or rock aggregate" which IS the CIM definition.',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'DA made false statement to Ombudsman. Claimed ordinance contains no reference to CIM, when it expressly prohibits "sand, gravel and/or rock aggregate" - the statutory definition of CIM. DA deflects preemption argument by focusing on label rather than substance. Never addresses whether sand/gravel/rock aggregate ARE CIM.',
        'key_quote': 'However, the proposed amendments do not include any reference to critical infrastructure materials or critical infrastructure materials operations, as defined by those statutes. As such, the proposed changes do not conflict with Utah Code 17-41-406.',
        'key_finding': True,
        'sg_why': 'False statement to Ombudsman. DA claims ordinance has no CIM reference while it explicitly prohibits "sand, gravel and/or rock aggregate" - the exact statutory CIM definition. Shows bad faith and deceptive legal strategy.',
        'sg_use': 'Compare DA letter claim ("no reference to CIM") with actual ordinance text (prohibits "sand, gravel and/or rock aggregate"). Then show 10-9a-901(1) definition: "Critical infrastructure materials means sand, gravel, or rock aggregate." The deception is on its face.',
    },
    # Duplicate of DA letter in discovery-0004
    'SLCo011022': {
        'title': 'DA Bywater Letter to Property Rights Ombudsman re Tree Farm Mediation (duplicate)',
        'date': 'April 7, 2022',
        'type': 'letter',
        'summary': 'Duplicate of SLCo003697. DA letter to Ombudsman falsely claiming ordinance has no CIM reference.',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'Duplicate of SLCo003697. DA false statement to Ombudsman about CIM content of ordinance.',
        'key_quote': 'However, the proposed amendments do not include any reference to critical infrastructure materials or critical infrastructure materials operations, as defined by those statutes.',
        'key_finding': True,
        'sg_why': 'Duplicate - see SLCo003697 analysis.',
        'sg_use': 'Same as SLCo003697.',
    },

    # --- "LONG PROHIBITED" TALKING POINTS (April 4, 2022) ---
    'SLCo011049': {
        'title': 'General Talking Points on Mining Ordinance Amendment - Deputy Mayor',
        'date': 'April 4, 2022',
        'type': 'talking_points',
        'summary': 'Internal talking points document dated 4/4/2022 for responding to questions about legality of the mining ordinance amendment. States "new gravel pits within our Forestry and Recreation Zone (FR) and Foothills and Canyon Overlay Zone (FCOZ) have been long prohibited." Contains edited text showing "restrictprohibit" (redlined word change). Instructs: "I can\'t comment on hypothetical legal cases" when asked about Tree Farm lawsuits.',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'Contains false "long prohibited" talking point. Gravel pits were NOT "long prohibited" - mineral extraction was a conditional use before this ordinance. Shows coordinated messaging to mislead public about ordinance content. Also shows predetermined avoidance of legal questions.',
        'key_quote': 'While new gravel pits within our Forestry and Recreation Zone (FR) and Foothills and Canyon Overlay Zone (FCOZ) have been long prohibited, the council last week amended our ordinances to restrictprohibit future mineral extraction and mining. We are confident in the legality of this amendment and will fight to enforce it.',
        'key_finding': True,
        'sg_why': 'False "long prohibited" talking point. Mineral extraction was actually a permitted conditional use before this ordinance. Shows county officials creating false narrative to justify ordinance. Edit marks ("restrictprohibit") show deliberate word choice to strengthen prohibition language.',
        'sg_use': 'Compare with pre-amendment ordinance text (Section 19.12.030 listed mineral extraction as conditional use J). Show gravel pits were NOT "long prohibited" - this was fabricated.',
    },

    # --- DEPUTY MAYOR KANTER EMAIL (April 4, 2022) ---
    'SLCo010971': {
        'title': 'Deputy Mayor Kanter Email - "Long Prohibited" False Talking Point',
        'date': 'April 4, 2022',
        'type': 'email',
        'summary': 'Deputy Mayor Catherine Kanter email containing the "long prohibited" talking point: "While new gravel pits within our Forestry and Recreation & Foothills and Canyon Overlay zones have been long prohibited, today we have amended our ordinances to prohibit mineral extraction and mining. We are confident the legality of this amendment, and will fight to enforce it."',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'Deputy Mayor distributing false "long prohibited" talking point. Gravel pits were a conditional use, not "long prohibited." Shows coordinated false messaging from senior County officials.',
        'key_quote': 'While new gravel pits within our Forestry and Recreation & Foothills and Canyon Overlay zones have been long prohibited, today we have amended our ordinances to prohibit mineral extraction and mining. We are confident the legality of this amendment, and will fight to enforce it.',
        'key_finding': True,
        'sg_why': 'Senior County official (Deputy Mayor) disseminating false claim that gravel pits were "long prohibited" when they were actually a conditional use. Shows bad faith and coordinated false messaging.',
        'sg_use': 'Show Deputy Mayor asserting "long prohibited" then compare to actual pre-amendment code showing mineral extraction was conditional use J in Section 19.12.030.',
    },

    # --- OMBUDSMAN REQUEST FOR MEDIATION (March 23, 2022) ---
    'SLCo003588': {
        'title': 'Ombudsman Mediation Request - Tree Farm LLC',
        'date': 'March 23, 2022',
        'type': 'letter',
        'summary': 'Property Rights Ombudsman office letter to Salt Lake County forwarding Tree Farm LLC request for mediation/arbitration. Tree Farm claims County is considering/has passed zoning legislation to restrict mining and extraction of CIM.',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'Formal Ombudsman process initiated before ordinance finalized. Shows Tree Farm raised CIM preemption issue through proper channels. County subsequently sent false/misleading response.',
        'key_quote': 'Mr. Bateman indicates that Tree Farm is mining and extracting critical infrastructure materials from various properties, owned by Tree Farm, in Parley\'s Canyon. Mr. Bateman claims SLCO is considering and has recently passed zoning legislation to restrict further mining and extraction.',
        'key_finding': False,
    },

    # --- STAFF REPORT (Feb 3, 2022 Meeting) ---
    'SLCo009809': {
        'title': 'Planning Staff Report - OAM2021-000494 Mineral Extraction Ordinance Amendment',
        'date': 'February 3, 2022',
        'type': 'staff_report',
        'summary': 'Comprehensive staff report for the mining ordinance amendment. Staff recommends approval of ordinance that would prohibit "mineral extraction and processing; mine; quarry; gravel pit; including crushers or concrete batching plants used in connection with and as a part of an operation for the removal of sand, gravel and/or rock aggregate." Contains proposed ordinance text with the explicit CIM prohibition language.',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'Staff report shows planning staff recommended ordinance that explicitly prohibits CIM materials (sand, gravel, rock aggregate). Staff report makes no mention of 17-41-402(6) preemption issue. Shows staff either ignored or was unaware of CIM preemption law.',
        'key_quote': 'It is proposed that section 19.12.030 be amended to eliminate mineral extraction and processing as a conditional use, and to explicitly prohibit mineral extraction and processing, mine, quarry, gravel pit, including crushers or concrete batching plants used in connection with and as a part of an operation for the removal of sand, gravel and/or rock aggregate in the FR zone.',
        'key_finding': True,
        'sg_why': 'Staff report recommended prohibition of sand/gravel/rock aggregate (CIM) without ANY analysis of 17-41-402(6) preemption. Shows systemic failure to address state law prohibition. Despite Bateman\'s Feb 11 letter, staff never revisited CIM preemption issue.',
        'sg_use': 'Show staff report recommends exactly what state law prohibits - banning CIM materials - with zero preemption analysis.',
    },
    'SLCo009924': {
        'title': 'Planning Staff Report - OAM2021-000494 (duplicate)',
        'date': 'February 3, 2022',
        'type': 'staff_report',
        'summary': 'Duplicate of SLCo009809. Staff report for mining ordinance amendment.',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'Duplicate of SLCo009809. Staff report recommending CIM prohibition without preemption analysis.',
        'key_quote': 'Staff recommends that the Planning Commission recommend approval of the ordinance as proposed to the Salt Lake County Council.',
        'key_finding': False,
    },

    # --- COUNCIL MEETING AGENDA (April 5, 2022 - Vote Day) ---
    'SLCo011775': {
        'title': 'County Council Meeting Agenda - April 5, 2022 (Ordinance Vote)',
        'date': 'April 5, 2022',
        'type': 'agenda',
        'summary': 'County Council meeting agenda for April 5, 2022, the day the mining ordinance was voted on. Includes public hearing for Ordinance Amendment of Section 19.12.030 related to Mineral Extraction and Processing in the FR Zone.',
        'relevance': 'HIGH',
        'supports': 'SUPPORTS',
        'reasoning': 'Agenda for the vote day. Shows the ordinance was brought to vote. Public hearing was noticed.',
        'key_quote': 'Public Hearing for the Ordinance Amendment of Section 19.12.030 of the Salt Lake County Code Related to Mineral Extraction and Processing in the Forestry and Recreation Zone',
        'key_finding': False,
    },

    # --- SNELGROVE "BAN IT" RESPONSE ---
    'SLCo005941': {
        'title': 'Councilman Snelgrove Response - "Happy to Make Motion to Pass Ordinance to Ban It"',
        'date': 'April 6, 2022',
        'type': 'email',
        'summary': 'Council Member Richard Snelgrove responds to constituent: "I am firmly opposed to the quarry up Parleys Canyon and was happy to make the motion to pass the ordinance that will ban it."',
        'relevance': 'HIGH',
        'supports': 'SUPPORTS',
        'reasoning': 'Council member admits ordinance purpose was to "ban" quarry. Shows predetermined opposition to Tree Farm operations specifically. Motion maker openly admits targeting Tree Farm.',
        'key_quote': 'Please know that I am firmly opposed to the quarry up Parleys Canyon and was happy to make the motion to pass the ordinance that will ban it.',
        'key_finding': False,
    },

    # --- COUNCIL WORK SESSION AGENDA (April 5, 2022) ---
    'SLCo011435': {
        'title': 'County Council Work Session Agenda - April 5, 2022',
        'date': 'April 5, 2022',
        'type': 'agenda',
        'summary': 'Work session agenda preceding the Council meeting where the mining ordinance was voted on.',
        'relevance': 'HIGH',
        'supports': 'SUPPORTS',
        'reasoning': 'Work session agenda for ordinance vote day. Shows procedural sequence.',
        'key_quote': 'Please note--a public hearing for the Ordinance Amendment of Section 19.12.030 of the Salt Lake County Code Related to Mineral Extraction and Processing in the Forestry and Recreation Zone on Mineral Extraction is set for the 4:00pm County Council meeting.',
        'key_finding': False,
    },

    # --- PLANNING COMMISSION MEETING (Feb 3, 2022) ---
    'SLCo006684': {
        'title': 'Mountainous Planning District Meeting Agenda & Minutes - Feb 3, 2022 & Oct 7, 2021',
        'date': 'February 3, 2022',
        'type': 'meeting_minutes',
        'summary': 'Meeting materials including agenda for Feb 3, 2022 planning commission meeting where OAM2021-000494 was heard, plus Oct 7, 2021 meeting minutes. Contains staff report and proposed ordinance text.',
        'relevance': 'CRITICAL',
        'supports': 'SUPPORTS',
        'reasoning': 'Planning Commission meeting materials for the mining ordinance amendment. Contains staff recommendation and proposed ordinance with explicit CIM prohibition language.',
        'key_quote': 'OAM2021-000494 - A proposed amendment of the Salt Lake County Code amending section 19.12.030 to eliminate mineral extraction and processing as a conditional use and explicitly prohibiting the same and other related uses in the forestry and recreation zones',
        'key_finding': False,
    },
}

# Apply manual overrides
print("PHASE 1: Applying manual overrides for key documents...")
for bates, info in manual_overrides.items():
    c.execute("SELECT id FROM documents WHERE bates = ?", (bates,))
    row = c.fetchone()
    if not row:
        print(f"  WARNING: {bates} not found in database")
        continue
    doc_id = row[0]

    # Update document metadata
    c.execute("UPDATE documents SET title = ?, date = ?, type = ?, summary = ?, reviewed = 1 WHERE id = ?",
              (info['title'], info['date'], info['type'], info['summary'], doc_id))

    # Insert/update claim assignment
    c.execute("""INSERT OR REPLACE INTO claim_assignments
               (doc_id, claim_num, relevance, supports_undermines, reasoning, key_quote)
               VALUES (?, 1, ?, ?, ?, ?)""",
              (doc_id, info['relevance'], info['supports'], info['reasoning'], info['key_quote']))

    # Key finding
    if info.get('key_finding'):
        c.execute("""INSERT OR REPLACE INTO smoking_guns
                   (doc_id, claim_num, why_critical, recommended_use)
                   VALUES (?, 1, ?, ?)""",
                  (doc_id, info['sg_why'], info['sg_use']))
    else:
        # Remove if previously marked as key finding but shouldn't be
        c.execute("DELETE FROM smoking_guns WHERE doc_id = ? AND claim_num = 1", (doc_id,))

    print(f"  {bates}: {info['relevance']} / {info['supports']} - {info['title'][:60]}")

conn.commit()

# =====================================================================
# PHASE 2: Upgrade similar/duplicate documents
# =====================================================================
print("\nPHASE 2: Upgrading documents containing ordinance text and key communications...")

# Find all documents containing the ordinance prohibition language
upgrade_count = 0
c.execute("SELECT id, bates, file_path FROM documents")
all_docs = c.fetchall()

for doc_id, bates, file_path in all_docs:
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except:
        continue

    content_lower = content.lower()

    # Check for specific upgrade patterns
    upgrade_to = None
    upgrade_reasoning = None
    upgrade_quote = None
    upgrade_su = 'SUPPORTS'

    # 1. Contains the actual ordinance prohibition language
    if 'removal of sand, gravel and/or rock aggregate' in content_lower:
        if 'explicitly prohibited' in content_lower or 'prohibit' in content_lower[:1000]:
            upgrade_to = 'CRITICAL'
            upgrade_reasoning = 'Contains ordinance text explicitly prohibiting "sand, gravel and/or rock aggregate" - the statutory definition of CIM under Utah Code 10-9a-901(1)'
            # Extract the key quote
            for line in content.split('\n'):
                if 'sand, gravel and/or rock aggregate' in line.lower():
                    upgrade_quote = line.strip()[:500]
                    break

    # 2. Contains 17-41-402 citation
    if re.search(r'17[-\s]*41[-\s]*402', content):
        if upgrade_to != 'CRITICAL':
            upgrade_to = 'CRITICAL'
            upgrade_reasoning = 'References Utah Code 17-41-402 CIM preemption statute'
            for line in content.split('\n'):
                if re.search(r'17[-\s]*41[-\s]*402', line):
                    upgrade_quote = line.strip()[:500]
                    break

    # 3. "Long prohibited" false talking point
    if re.search(r'(?:have been|been)\s+long\s+prohibit', content_lower):
        upgrade_to = 'CRITICAL'
        upgrade_reasoning = 'Contains false "long prohibited" talking point regarding gravel pits (mineral extraction was actually a conditional use before this ordinance)'
        for line in content.split('\n'):
            if 'long prohibit' in line.lower():
                upgrade_quote = line.strip()[:500]
                break

    # 4. DA letter to Ombudsman (all copies)
    if 'bywater' in content_lower and 'ombudsman' in content_lower and 'tree farm' in content_lower:
        upgrade_to = 'CRITICAL'
        upgrade_reasoning = 'DA letter to Ombudsman containing false claim that ordinance has no CIM reference, when it expressly prohibits sand/gravel/rock aggregate'
        upgrade_quote = 'the proposed amendments do not include any reference to critical infrastructure materials'

    # 5. Bateman letters (all copies)
    if 'bateman' in content_lower and '17-41-402' in content and 'critical infrastructure' in content_lower:
        upgrade_to = 'CRITICAL'
        upgrade_reasoning = 'Bateman/Tree Farm letter citing 17-41-402(6) CIM preemption warning to County'

    # 6. Council member admitting ordinance is to "ban" quarry
    if re.search(r'(?:motion to pass the ordinance|motion.*ordinance.*ban)', content_lower):
        if not upgrade_to or upgrade_to != 'CRITICAL':
            upgrade_to = 'HIGH'
            upgrade_reasoning = 'Council member admitting ordinance purpose was to ban quarry operations'
            for line in content.split('\n'):
                if 'motion' in line.lower() and ('ban' in line.lower() or 'ordinance' in line.lower()):
                    upgrade_quote = line.strip()[:500]
                    break

    # 7. "Confident in legality" / "fight to enforce" messaging
    if re.search(r'confident.*legality|fight to enforce', content_lower):
        if 'mining' in content_lower or 'ordinance' in content_lower:
            if not upgrade_to or upgrade_to not in ('CRITICAL',):
                upgrade_to = 'HIGH'
                upgrade_reasoning = 'Contains County officials asserting confidence in ordinance legality despite preemption concerns'

    if upgrade_to:
        # Check current classification
        c.execute("SELECT relevance FROM claim_assignments WHERE doc_id = ? AND claim_num = 1", (doc_id,))
        existing = c.fetchone()

        relevance_order = {'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1}

        if existing:
            current_level = relevance_order.get(existing[0], 0)
            new_level = relevance_order.get(upgrade_to, 0)
            if new_level > current_level:
                c.execute("""UPDATE claim_assignments
                           SET relevance = ?, reasoning = ?, key_quote = COALESCE(?, key_quote)
                           WHERE doc_id = ? AND claim_num = 1""",
                          (upgrade_to, upgrade_reasoning, upgrade_quote, doc_id))
                upgrade_count += 1
        else:
            # New entry
            c.execute("""INSERT OR REPLACE INTO claim_assignments
                       (doc_id, claim_num, relevance, supports_undermines, reasoning, key_quote)
                       VALUES (?, 1, ?, ?, ?, ?)""",
                      (doc_id, upgrade_to, upgrade_su, upgrade_reasoning, upgrade_quote))
            upgrade_count += 1

conn.commit()
print(f"  Upgraded/added {upgrade_count} documents")

# =====================================================================
# PHASE 3: Downgrade false positives
# =====================================================================
print("\nPHASE 3: Downgrading false positives...")

# Documents that match "preempt" in casual citizen usage (not legal preemption)
downgrade_count = 0
c.execute("""SELECT ca.doc_id, d.bates, d.file_path, ca.relevance
             FROM claim_assignments ca
             JOIN documents d ON ca.doc_id = d.id
             WHERE ca.claim_num = 1 AND ca.relevance IN ('CRITICAL', 'HIGH')""")

for doc_id, bates, file_path, relevance in c.fetchall():
    # Skip manually overridden docs
    if bates in manual_overrides:
        continue

    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except:
        continue

    content_lower = content.lower()

    # Check if this is a citizen using "preempt" in non-legal context
    if 'preempt' in content_lower:
        # If citizen letter about mining opposition, "preempt" likely casual use
        if ('should preempt' in content_lower and 'money-making' in content_lower):
            # This is Bill Hanson's letter using "preempt" casually
            c.execute("""UPDATE claim_assignments
                       SET relevance = 'LOW', reasoning = 'Citizen opposition letter using "preempt" in casual (non-legal) context. Not relevant to CIM preemption claim.'
                       WHERE doc_id = ? AND claim_num = 1""",
                      (doc_id,))
            # Remove key finding if any
            c.execute("DELETE FROM smoking_guns WHERE doc_id = ? AND claim_num = 1", (doc_id,))
            downgrade_count += 1

    # Documents that are just the FR/FA horse/animal ordinance - not the mining ordinance
    if ('horse' in content_lower and 'animal' in content_lower and
        'FR/FA Ordinance Amendment' in content and
        'mineral' not in content_lower and 'mining' not in content_lower and
        'quarry' not in content_lower and 'gravel' not in content_lower):
        if relevance in ('CRITICAL', 'HIGH'):
            c.execute("""UPDATE claim_assignments
                       SET relevance = 'LOW', reasoning = 'FR/FA horse/animal ordinance amendment - not the mining ordinance at issue in Claim 1'
                       WHERE doc_id = ? AND claim_num = 1""",
                      (doc_id,))
            c.execute("DELETE FROM smoking_guns WHERE doc_id = ? AND claim_num = 1", (doc_id,))
            downgrade_count += 1

conn.commit()
print(f"  Downgraded {downgrade_count} false positives")

# =====================================================================
# PHASE 4: Properly classify the DA response as UNDERMINES
# where County argues ordinance IS legal
# =====================================================================
print("\nPHASE 4: Classifying UNDERMINES documents...")

undermines_patterns = [
    # DA argues ordinance is valid/legal
    ('proposed amendments do not include any reference to critical infrastructure', 'SUPPORTS'),  # Actually SUPPORTS our claim - shows bad faith
    # County officials asserting validity
    ('confident in the legality', 'SUPPORTS'),  # Actually SUPPORTS - shows they knew it was questionable
]

# The DA letter to Ombudsman actually SUPPORTS our claim (shows bad faith/false statements)
# But there may be other docs where County makes legitimate legal arguments

# =====================================================================
# PHASE 5: Final statistics
# =====================================================================
print("\n" + "="*80)
print("FINAL STATISTICS AFTER REFINEMENT")
print("="*80)

c.execute("SELECT COUNT(*) FROM documents WHERE reviewed = 1")
total_reviewed = c.fetchone()[0]

c.execute("SELECT COUNT(*) FROM claim_assignments WHERE claim_num = 1")
total_relevant = c.fetchone()[0]

c.execute("SELECT relevance, COUNT(*) FROM claim_assignments WHERE claim_num = 1 GROUP BY relevance ORDER BY relevance")
by_relevance = dict(c.fetchall())

c.execute("SELECT supports_undermines, COUNT(*) FROM claim_assignments WHERE claim_num = 1 GROUP BY supports_undermines")
by_su = dict(c.fetchall())

c.execute("SELECT COUNT(*) FROM smoking_guns WHERE claim_num = 1")
total_sg = c.fetchone()[0]

print(f"Total documents in database: 5576")
print(f"Total reviewed: {total_reviewed}")
print(f"Total relevant to Claim 1: {total_relevant}")
print(f"  CRITICAL: {by_relevance.get('CRITICAL', 0)}")
print(f"  HIGH: {by_relevance.get('HIGH', 0)}")
print(f"  MEDIUM: {by_relevance.get('MEDIUM', 0)}")
print(f"  LOW: {by_relevance.get('LOW', 0)}")
print(f"Supports claim: {by_su.get('SUPPORTS', 0)}")
print(f"Undermines claim: {by_su.get('UNDERMINES', 0)}")
print(f"Key findings: {total_sg}")

# Print key findings
print("\n" + "="*80)
print("KEY FINDING DOCUMENTS")
print("="*80)
c.execute("""SELECT d.bates, d.title, d.date, sg.why_critical, sg.recommended_use
             FROM smoking_guns sg
             JOIN documents d ON sg.doc_id = d.id
             WHERE sg.claim_num = 1
             ORDER BY d.bates""")
for i, (bates, title, date, why, use) in enumerate(c.fetchall(), 1):
    print(f"\n{i}. {bates} - {title}")
    print(f"   Date: {date}")
    print(f"   Why Critical: {why[:200]}")
    print(f"   Recommended Use: {use[:200]}")

# Print CRITICAL documents
print("\n" + "="*80)
print("CRITICAL DOCUMENTS (sample)")
print("="*80)
c.execute("""SELECT d.bates, d.title, d.date, ca.reasoning
             FROM claim_assignments ca
             JOIN documents d ON ca.doc_id = d.id
             WHERE ca.claim_num = 1 AND ca.relevance = 'CRITICAL'
             ORDER BY d.bates
             LIMIT 30""")
for bates, title, date, reasoning in c.fetchall():
    print(f"  {bates} | {date} | {(title or 'No title')[:50]} | {reasoning[:80]}")

conn.close()
print("\nDone.")
