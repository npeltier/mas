#!/usr/bin/env python3
"""Turn edges_v2.json + a cached issue-type map into the markdown report.
Usage: python3 gen_report.py > bug-causality-report.md
Inputs (same dir): edges_v2.json (from blame_v2.py), meta_all.json (key -> {type,sum}).
meta_all.json is a Jira cache; refreshing it is the only step needing Jira access."""
import json, subprocess, collections, datetime, os

SCR = os.path.dirname(os.path.abspath(__file__)) + "/"
REPO = "/Users/npeltier/Documents/github/mas"
edges = json.load(open(SCR+"edges_v2.json"))
meta  = json.load(open(SCR+"meta_all.json"))

# git subjects as fallback label/type-unknown
subj = {}
import re
for ln in subprocess.run(["git","-C",REPO,"log","--no-merges","--pretty=%s"],
                         capture_output=True,text=True).stdout.splitlines():
    m=re.search(r"MWPW-\d+", ln, re.I)
    if m: subj.setdefault(m.group(0).upper(), ln)

def typ(k): return meta.get(k,{}).get("type","?")
def lbl(k):
    s=meta.get(k,{}).get("sum") or subj.get(k,"")
    return s[:58]

def fanout(pred_cause, pred_fix):
    agg=collections.defaultdict(lambda:[0,set()])   # cause -> [lines, {fix}]
    for e in edges:
        if pred_cause(e["cause"]) and pred_fix(e["fix"]) and e["cause"]!=e["fix"]:
            agg[e["cause"]][0]+=e["lines"]; agg[e["cause"]][1].add(e["fix"])
    rows=[(c,ln,len(fx)) for c,(ln,fx) in agg.items()]
    rows.sort(key=lambda r:(-r[2],-r[1]))
    return rows

def top_edges(pred_cause, pred_fix, n=25):
    es=[e for e in edges if pred_cause(e["cause"]) and pred_fix(e["fix"]) and e["cause"]!=e["fix"]]
    es.sort(key=lambda e:-e["lines"])
    return es[:n]

isbug   = lambda k: typ(k)=="Bug"
isstory = lambda k: typ(k)=="Story"
any_    = lambda k: True

def table_fanout(rows, n, header):
    out=[f"| {header} | Bugs |" if header=="Bugs" else f"| Downstream | Lines |"]
    out=["| # down | Lines | Cause type | Cause | Summary |","|---:|---:|---|---|---|"]
    for c,ln,cnt in rows[:n]:
        out.append(f"| {cnt} | {ln} | {typ(c)} | {c} | {lbl(c)} |")
    return "\n".join(out)

def table_edges(es, n):
    out=["| Lines | Cause type | Cause → Fix | Cause summary → Fix summary |","|---:|---|---|---|"]
    for e in es[:n]:
        out.append(f"| {e['lines']} | {typ(e['cause'])} | {e['cause']} → {e['fix']} | {lbl(e['cause'])} → {lbl(e['fix'])} |")
    return "\n".join(out)

bug_fan   = fanout(any_, isbug)
bug_edges = top_edges(any_, isbug, 30)
st_fan    = fanout(isstory, isstory)
st_edges  = top_edges(isstory, isstory, 30)

known=sum(1 for e in edges if typ(e['cause'])!='?' and typ(e['fix'])!='?')
today=datetime.date.today().isoformat()

print(f"""# MAS — Bug/Story Causality Graph (SZZ blame attribution)

_Generated {today} · {len(edges)} cause→fix edges from git-blame over 749 ticketed commits · generated/vendored paths excluded via `szz-ignore.txt`._

## Method

For each ticketed commit, the lines it modified/deleted are blamed against the parent (`git blame -M`); the commit that last owned those lines — and its `MWPW-xxxx` ticket — is the suspected **cause**. This is the SZZ heuristic. Type (Bug/Story) comes from a Jira cache (`meta_all.json`); {known}/{len(edges)} edges have both endpoints typed.

**Accuracy — read before trusting any single row.** Benchmarks put SZZ precision around **~40–50%** (Rosa et al., ICSE 2021; Da Costa et al., TSE 2017) — about half of edges are noise. Ours is a *simplified* SZZ (no whitespace/comment filtering, no bug-report-date sanity check, additions blamed to an adjacent line), so treat it as at or below that bar. Two mitigations: rank by **distinct downstream count** (a culprit hit by many independent fixes is likelier real than one big-line edge), and read migrations/rewrites skeptically — they own the most lines so they collect the most blame.

---

## Bug causality — which change introduced the most distinct bugs

_(fix is a Bug; cause is anything. Ranked by distinct bugs, then blamed lines.)_

{table_fanout(bug_fan, 30, 'Bugs')}

### Strongest single bug edges (by blamed lines)

{table_edges(bug_edges, 30)}

---

## Story → story causality

_(both cause and fix are Stories — one story's code later rewritten by another story. Ranked by distinct downstream stories, then lines.)_

{table_fanout(st_fan, 30, 'Stories')}

### Strongest single story→story edges (by blamed lines)

{table_edges(st_edges, 30)}

---

## Reproduce it yourself

```sh
python3 blame_causality.py        # -> edges_v2.json  (prints progress + ETA every 25 commits)
python3 gen_report.py > bug-causality-report.md
```

- Ignore patterns live in `szz-ignore.txt` (prefix / `/substring/` / `*.ext`).
- `meta_all.json` is the Jira type cache; refreshing it (new tickets) is the only step needing Jira access.
""")
