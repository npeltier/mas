# MAS — Bug/Story Causality Graph (SZZ blame attribution)

_Generated 2026-09-17 · 3526 cause→fix edges from git-blame over 749 ticketed commits · generated/vendored paths excluded via `szz-ignore.txt`._

## Method

For each ticketed commit, the lines it modified/deleted are blamed against the parent (`git blame -M`); the commit that last owned those lines — and its `MWPW-xxxx` ticket — is the suspected **cause**. This is the SZZ heuristic. Type (Bug/Story) comes from a Jira cache (`meta_all.json`); 2869/3526 edges have both endpoints typed.

**Accuracy — read before trusting any single row.** Benchmarks put SZZ precision around **~40–50%** (Rosa et al., ICSE 2021; Da Costa et al., TSE 2017) — about half of edges are noise. Ours is a *simplified* SZZ (no whitespace/comment filtering, no bug-report-date sanity check, additions blamed to an adjacent line), so treat it as at or below that bar. Two mitigations: rank by **distinct downstream count** (a culprit hit by many independent fixes is likelier real than one big-line edge), and read migrations/rewrites skeptically — they own the most lines so they collect the most blame.

---

## Bug causality — which change introduced the most distinct bugs

_(fix is a Bug; cause is anything. Ranked by distinct bugs, then blamed lines.)_

| # down | Lines | Cause type | Cause | Summary |
|---:|---:|---|---|---|
| 43 | 180 | Story | MWPW-172853 | [M@S] accelerate commerce PR lifecycle |
| 23 | 307 | Story | MWPW-183304 | [M@S Plans] Final switch from milo to mas |
| 22 | 365 | Story | MWPW-181263 | Copy latest Milo MAS feature to M@S repository |
| 18 | 525 | Sub-task | MWPW-183847 | New fragment editor experience |
| 17 | 473 | Story | MWPW-163214 | [M@S Studio] Create splash page   |
| 13 | 113 | ? | MWPW-159374 | MWPW-159374: Replace tinyMCE with Prosemirror (#79) |
| 12 | 724 | Story | MWPW-180161 | [M@S I/O] regional customization  |
| 11 | 156 | Story | MWPW-180778 | [m@s][mas/io] promo transformer |
| 11 | 140 | Story | MWPW-186821 | [Project Lingo] Mini compare Merch card variant in M@S Stu |
| 11 | 74 | Story | MWPW-194457 | [Lingo] Comp chart variation management (web component) |
| 9 | 189 | Story | MWPW-170818 | [M@S Studio] [tech debt] Placeholders code improvements |
| 9 | 104 | Story | MWPW-186984 | [M@S LOC MVP] Grouped variations |
| 9 | 61 | Story | MWPW-186777 | [M@S Promos] Promo code exception management by country |
| 8 | 73 | Story | MWPW-181856 | [M@S Promos] creating promo variations  |
| 7 | 187 | Story | MWPW-192902 | [M@S Studio Site Redesign] Wave 2 Merch Cards (Biz Pro) -  |
| 7 | 69 | Bug | MWPW-199360 | OSI override and promo code do not work |
| 7 | 48 | Story | MWPW-161897 | Due diligence: TAG support in Odin |
| 7 | 45 | Story | MWPW-181321 | [M@S Studio] Top level language selector |
| 7 | 28 | Story | MWPW-186822 | [Project Lingo] Product Merch card variant in M@S Studio |
| 7 | 27 | Bug | MWPW-199086 | [M@S Studio] [DC] Product template bugs - CTA style, aster |
| 7 | 20 | Story | MWPW-188624 | [M@S Grouped Variations] Utilize promo code on grouped var |
| 7 | 13 | Story | MWPW-186818 | [Project Lingo] Segment Merch card variant in M@S Studio |
| 7 | 12 | Story | MWPW-170520 | [M@S x Commerce] Fries recommendation template creation |
| 6 | 222 | Story | MWPW-199953 | [Promo variations] Create geo-specific promo variations |
| 6 | 23 | Story | MWPW-185901 | [M@S LOC MVP] Regional variation browsing  |
| 6 | 23 | Story | MWPW-181857 | [M@S Studio] creating regional variations |
| 6 | 17 | Story | MWPW-170463 | [M@S Studio] Tagging updates  |
| 6 | 14 | Story | MWPW-168589 | [M@S Studio] Implement a Placeholders page in Studio |
| 6 | 12 | Story | MWPW-193615 | [Lingo EN] dynamic product information in Merch card/eleme |
| 6 | 11 | Story | MWPW-185900 | [M@S LOC] Language variants in top nav |

### Strongest single bug edges (by blamed lines)

| Lines | Cause type | Cause → Fix | Cause summary → Fix summary |
|---:|---|---|---|
| 695 | Story | MWPW-180161 → MWPW-183542 | [M@S I/O] regional customization  → make stage preview works with latest source files |
| 373 | Story | MWPW-175969 → MWPW-184154 | Add legal template to OST → [M@S] Unit text toggle broken for TEAM offers |
| 311 | Sub-task | MWPW-183847 → MWPW-186621 | New fragment editor experience → [M@S Studio] Not able to remove existing mnemonic from reg |
| 309 | Story | MWPW-181068 → MWPW-183542 | [m@s][mas/io] fix & optimize fragment preview → make stage preview works with latest source files |
| 243 | Story | MWPW-163214 → MWPW-162452 | [M@S Studio] Create splash page   → [M@Sv2] CTA promo code info not rendered by OST |
| 241 | Story | MWPW-182999 → MWPW-196632 | [m@s][mas/io] create placeholder dictionary on the fly → [M@S Studio] Missing Placeholders on Publish |
| 224 | Story | MWPW-164253 → MWPW-184154 | [M@S CCD] Ublock Nala Studio tests - Move OST to non VPN l → [M@S] Unit text toggle broken for TEAM offers |
| 194 | Story | MWPW-193946 → MWPW-197395 | Implementation of Bulk versioning/revert → [Bulk Publish] Issue with bulk publish confirmation |
| 177 | Story | MWPW-181263 → MWPW-184650 | Copy latest Milo MAS feature to M@S repository → [M@S] Enable maslibs with gallery pages |
| 159 | Story | MWPW-170818 → MWPW-196632 | [M@S Studio] [tech debt] Placeholders code improvements → [M@S Studio] Missing Placeholders on Publish |
| 159 | Story | MWPW-163214 → MWPW-166929 | [M@S Studio] Create splash page   → [M@Sv2] Popover stays open when folderpicker loses focus |
| 151 | Story | MWPW-192902 → MWPW-197931 | [M@S Studio Site Redesign] Wave 2 Merch Cards (Biz Pro) -  → [M@S Studio Site Redesign] Wave 2 Merch Cards (Biz Pro) -  |
| 116 | Story | MWPW-202998 → MWPW-203591 | [M@S] Min quantity promos → New OST — Teams 'Unit' default is not applying |
| 114 | Story | MWPW-192311 → MWPW-197395 | [Bulk publish] Build bulk publish runtime IO action → [Bulk Publish] Issue with bulk publish confirmation |
| 106 | Story | MWPW-199953 → MWPW-201011 | [Promo variations] Create geo-specific promo variations → Geo-specific Promo Variations- follow up |
| 104 | Story | MWPW-180778 → MWPW-197980 | [m@s][mas/io] promo transformer → [mas/io] There should be the possibility to have more than |
| 100 | Sub-task | MWPW-164944 → MWPW-194042 | Create script to create locale tree → [MAS Express] Product names showing as placeholder values  |
| 94 | Story | MWPW-181263 → MWPW-183848 | Copy latest Milo MAS feature to M@S repository → [M@S Express] Design QA - Simplified & Full Size Cards |
| 83 | Story | MWPW-173734 → MWPW-184154 | [OST] Include the PA, Family and Arrangement Codes in OST  → [M@S] Unit text toggle broken for TEAM offers |
| 73 | Story | MWPW-186821 → MWPW-198383 | [Project Lingo] Mini compare Merch card variant in M@S Stu → mini-compare-chart-mweb: \"what's included\" toggle not re |
| 66 | Story | MWPW-183304 → MWPW-183848 | [M@S Plans] Final switch from milo to mas → [M@S Express] Design QA - Simplified & Full Size Cards |
| 57 | Story | MWPW-186984 → MWPW-188484 | [M@S LOC MVP] Grouped variations → [M@S Studio] Create variation for cloned fragment is broke |
| 57 | ? | MWPW-159374 → MWPW-163845 | MWPW-159374: Replace tinyMCE with Prosemirror (#79) → [M@S] [CCD] [Accessibility]: Interactive controls must not |
| 57 | ? | MWPW-153599 → MWPW-162614 | MWPW-153599: M@S Studio solution design (#36) → [M@Sv2] Normalize edit fields reflection on changes |
| 55 | Story | MWPW-192450 → MWPW-196632 | [M@S Studio] fix preview of placeholders on regional varia → [M@S Studio] Missing Placeholders on Publish |
| 50 | Story | MWPW-161271 → MWPW-162614 | [M@S] Updates on the merch-card editor form → [M@Sv2] Normalize edit fields reflection on changes |
| 48 | Story | MWPW-184617 → MWPW-196456 | [M@S Loc MVP] Select placeholders for loc project - MVP → [Bulk publish] Select all fragments and add Tag filter |
| 48 | Story | MWPW-183304 → MWPW-192837 | [M@S Plans] Final switch from milo to mas → [M@S Express] horizontal alignment in Express cards |
| 47 | Story | MWPW-199953 → MWPW-203864 | [Promo variations] Create geo-specific promo variations → [M@S promos] Geo tag clarity for promo variation |
| 47 | Story | MWPW-183304 → MWPW-194967 | [M@S Plans] Final switch from milo to mas → [M@S Plans Row] Extra space in between title and price on  |

---

## Story → story causality

_(both cause and fix are Stories — one story's code later rewritten by another story. Ranked by distinct downstream stories, then lines.)_

| # down | Lines | Cause type | Cause | Summary |
|---:|---:|---|---|---|
| 73 | 2724 | Story | MWPW-172853 | [M@S] accelerate commerce PR lifecycle |
| 55 | 1036 | Story | MWPW-163214 | [M@S Studio] Create splash page   |
| 42 | 783 | Story | MWPW-168446 | [M@S Studio] implementation card of collection authoring |
| 35 | 1125 | Story | MWPW-181263 | Copy latest Milo MAS feature to M@S repository |
| 33 | 1621 | Story | MWPW-168589 | [M@S Studio] Implement a Placeholders page in Studio |
| 28 | 286 | Story | MWPW-161354 | [M@S] Filter non relevant fields out for a given card vari |
| 28 | 131 | Story | MWPW-183304 | [M@S Plans] Final switch from milo to mas |
| 27 | 244 | Story | MWPW-170818 | [M@S Studio] [tech debt] Placeholders code improvements |
| 27 | 95 | Story | MWPW-172033 | [Plans Milo] Override ABM display text |
| 26 | 245 | Story | MWPW-170463 | [M@S Studio] Tagging updates  |
| 22 | 808 | Story | MWPW-180759 | [M@S Studio] Promo campaign CRUD and list view |
| 22 | 700 | Story | MWPW-161897 | Due diligence: TAG support in Odin |
| 22 | 78 | Story | MWPW-174297 | [M@S][CCD] develop mini-merch card UI component  |
| 22 | 73 | Story | MWPW-179253 | [M@S Studio] Use mas/io pipeline for displaying card conte |
| 21 | 287 | Story | MWPW-181856 | [M@S Promos] creating promo variations  |
| 21 | 258 | Story | MWPW-181321 | [M@S Studio] Top level language selector |
| 20 | 344 | Story | MWPW-170520 | [M@S x Commerce] Fries recommendation template creation |
| 20 | 178 | Story | MWPW-165538 | [M@S] placeholder content model & delivery |
| 20 | 128 | Story | MWPW-164093 | [M@S] Adobe Home - POC for Buy/Try widget card |
| 19 | 343 | Story | MWPW-194457 | [Lingo] Comp chart variation management (web component) |
| 18 | 745 | Story | MWPW-184156 | [M@S Studio] Migration to Spectrum 2 |
| 18 | 538 | Story | MWPW-186986 | [M@S LOC MVP][Grouped Variations] Ability to translate gro |
| 18 | 140 | Story | MWPW-169073 | [m@s]log m@s main action steps |
| 18 | 69 | Story | MWPW-178124 | [M@S x Express] New Simplified Pricing Card template creat |
| 16 | 1091 | Story | MWPW-184614 | [M@S Loc MVP] Add files to loc project - MVP |
| 16 | 494 | Story | MWPW-186984 | [M@S LOC MVP] Grouped variations |
| 16 | 131 | Story | MWPW-188000 | [M@S Global settings] Implement overall settings screen |
| 16 | 85 | Story | MWPW-164491 | [Plans Milo] Updates to Individuals wide key apps merch-ca |
| 16 | 66 | Story | MWPW-162398 | Ability to preview content before publish |
| 15 | 932 | Story | MWPW-194472 | Promos: add locales & fragments |

### Strongest single story→story edges (by blamed lines)

| Lines | Cause type | Cause → Fix | Cause summary → Fix summary |
|---:|---|---|---|
| 4684 | Story | MWPW-195919 → MWPW-195920 | [NPI MCS] OST monorepo — ship behind ?ost=new flag (legacy → [NPI MCS] OST monorepo — flip default to new OST and remov |
| 3259 | Story | MWPW-195920 → MWPW-201122 | [NPI MCS] OST monorepo — flip default to new OST and remov → [M@S Promos] Ability to cancel OSI substitutions |
| 3151 | Story | MWPW-200943 → MWPW-200947 | Search offer does not load the entitlements → Cancel-context is not rendering |
| 3134 | Story | MWPW-202998 → MWPW-200943 | [M@S] Min quantity promos → Search offer does not load the entitlements |
| 3083 | Story | MWPW-201122 → MWPW-202998 | [M@S Promos] Ability to cancel OSI substitutions → [M@S] Min quantity promos |
| 1578 | Story | MWPW-172853 → MWPW-181263 | [M@S] accelerate commerce PR lifecycle → Copy latest Milo MAS feature to M@S repository |
| 971 | Story | MWPW-181263 → MWPW-183304 | Copy latest Milo MAS feature to M@S repository → [M@S Plans] Final switch from milo to mas |
| 682 | Story | MWPW-168589 → MWPW-172033 | [M@S Studio] Implement a Placeholders page in Studio → [Plans Milo] Override ABM display text |
| 597 | Story | MWPW-161897 → MWPW-163214 | Due diligence: TAG support in Odin → [M@S Studio] Create splash page   |
| 546 | Story | MWPW-186445 → MWPW-186986 | [M@S Loc MVP] Selected items view-only table, and follow-u → [M@S LOC MVP][Grouped Variations] Ability to translate gro |
| 473 | Story | MWPW-184617 → MWPW-186445 | [M@S Loc MVP] Select placeholders for loc project - MVP → [M@S Loc MVP] Selected items view-only table, and follow-u |
| 418 | Story | MWPW-195920 → MWPW-202998 | [NPI MCS] OST monorepo — flip default to new OST and remov → [M@S] Min quantity promos |
| 410 | Story | MWPW-183410 → MWPW-184614 | [M@S Studio] Version: compare view → [M@S Loc MVP] Add files to loc project - MVP |
| 383 | Story | MWPW-186107 → MWPW-186984 | [M@S LOC MVP] Default Language browsing - top nav → [M@S LOC MVP] Grouped variations |
| 381 | Story | MWPW-186984 → MWPW-183499 | [M@S LOC MVP] Grouped variations → [mas][express] revisit Simplified pricing card content usa |
| 381 | Story | MWPW-186794 → MWPW-186107 | [M@S Plans] Leverage spectrum icon library for filters → [M@S LOC MVP] Default Language browsing - top nav |
| 370 | Story | MWPW-172853 → MWPW-183304 | [M@S] accelerate commerce PR lifecycle → [M@S Plans] Final switch from milo to mas |
| 367 | Story | MWPW-186041 → MWPW-186794 | [M@S Plans] Allow for authors to add icons in badges → [M@S Plans] Leverage spectrum icon library for filters |
| 354 | Story | MWPW-184614 → MWPW-186041 | [M@S Loc MVP] Add files to loc project - MVP → [M@S Plans] Allow for authors to add icons in badges |
| 342 | Story | MWPW-180759 → MWPW-182720 | [M@S Studio] Promo campaign CRUD and list view → [M@S Studio] Merge short term editor experience in M@S |
| 341 | Story | MWPW-183900 → MWPW-180759 | [M@S Studio] bulk publish → [M@S Studio] Promo campaign CRUD and list view |
| 341 | Story | MWPW-184156 → MWPW-183900 | [M@S Studio] Migration to Spectrum 2 → [M@S Studio] bulk publish |
| 338 | Story | MWPW-194472 → MWPW-200064 | Promos: add locales & fragments → [Promo variations] View promo variations in Promo project  |
| 335 | Story | MWPW-168589 → MWPW-170031 | [M@S Studio] Implement a Placeholders page in Studio → [Plans M@S Studio] Add-on checkbox functionality |
| 311 | Story | MWPW-168589 → MWPW-191570 | [M@S Studio] Implement a Placeholders page in Studio → [Performance] Implement pagination to improve M@S load tim |
| 308 | Story | MWPW-202998 → MWPW-200947 | [M@S] Min quantity promos → Cancel-context is not rendering |
| 293 | Story | MWPW-194472 → MWPW-186777 | Promos: add locales & fragments → [M@S Promos] Promo code exception management by country |
| 286 | Story | MWPW-184614 → MWPW-184617 | [M@S Loc MVP] Add files to loc project - MVP → [M@S Loc MVP] Select placeholders for loc project - MVP |
| 284 | Story | MWPW-163214 → MWPW-161354 | [M@S Studio] Create splash page   → [M@S] Filter non relevant fields out for a given card vari |
| 281 | Story | MWPW-186777 → MWPW-200064 | [M@S Promos] Promo code exception management by country → [Promo variations] View promo variations in Promo project  |

---

## Reproduce it yourself

```sh
python3 blame_causality.py        # -> edges_v2.json  (prints progress + ETA every 25 commits)
python3 gen_report.py > bug-causality-report.md
```

- Ignore patterns live in `szz-ignore.txt` (prefix / `/substring/` / `*.ext`).
- `meta_all.json` is the Jira type cache; refreshing it (new tickets) is the only step needing Jira access.

