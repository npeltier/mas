---
name: mwpw-ticket
description: Create a MWPW Jira ticket for the Cosmocats team
---

Create a MWPW Jira ticket for the Cosmocats team based on the following request:

$ARGUMENTS

Use the `corp-jira-create_jira_issue` MCP tool with these fixed values:
- project key: `MWPW`
- issuetype: `Story` (use `Bug` only if the request explicitly describes a defect)
- customfield_12900 (Team): `{"id": "34408"}` — this is always the Cosmocats team, never change it,
- if not specified in the request, pick next sprint for the `customfield_12901` (Sprint) field

Derive the `summary` and `description` from the request above. For the description, use Jira wiki markup with these sections:
- `h2. TL;DR` — one or two lines, first thing in the description, that sum up what the ticket is about in plain business language for a non-technical stakeholder. No code paths, file names, field names, error strings, or jargon — just the business impact and what will change.
- `h2. Problem` — what is broken or missing
- `h2. Proposed Solution` — what should be done
- `h2. Acceptance Criteria` — bulleted list of verifiable outcomes

After creating the ticket, reply with the ticket key and a one-line summary of what was created.
