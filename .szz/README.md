# SZZ bug/story causality

Attributes each bug/story fix to the change that last touched the lines it modified
(the SZZ heuristic), joined to Jira tickets via `MWPW-xxxx` in commit titles.

## Run

```sh
python3 blame_causality.py                 # incremental: only new commits (seconds after the first run)
python3 gen_report.py > bug-causality-report.md
```

First run processes all ~749 ticketed commits (~5–20 min) and prints a start banner
(commit count, ignore patterns, ETA) plus progress every 10 commits. Later runs are
**incremental** — blame(commit vs its parent) is immutable, so cached commits are never
recomputed; only commits new since the last run are processed and appended.

A **full rebuild** happens automatically (or with `--full`) when:
- `szz-ignore.txt` changed (edges depend on it), or
- cached commit SHAs are gone (history rewrite / rebase of main).

State lives in `state.json` (`ignore_sig` + processed SHAs). Delete it to force a rebuild.

## Files

| File | Role |
|---|---|
| `blame_causality.py` | git-blame pass over ticketed commits → `edges_v2.json` |
| `gen_report.py` | `edges_v2.json` + `meta_all.json` → markdown report |
| `szz-ignore.txt` | path patterns excluded from attribution (prefix / `/substring/` / `*.ext`) |
| `edges_v2.json` | cached edges (regenerate with blame_causality.py) |
| `state.json` | incremental-run state: `ignore_sig` + processed commit SHAs |
| `meta_all.json` | Jira issue-type cache (`key -> {type, sum}`) — the only Jira-dependent input |

## Refreshing the Jira type cache

`meta_all.json` is a snapshot. To pick up new tickets, re-query Jira
(`issuetype` + `summary` for the keys in `git log`) and rewrite it. Without a
refresh, unseen tickets show as type `?` and are excluded from the Bug/Story tables.

## Accuracy

SZZ precision is ~40–50% in the literature (Rosa et al. ICSE 2021; Da Costa et al. TSE 2017);
this is a simplified variant, so rank by distinct-downstream count and treat single rows as leads, not proof.
