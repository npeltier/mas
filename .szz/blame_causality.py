#!/usr/bin/env python3
"""SZZ-style bug/story causality via git blame.

For each ticketed commit, the lines it modified/deleted are blamed against its
parent; the commit (and MWPW ticket) that last owned those lines is the cause.

INCREMENTAL BY DEFAULT: blame(commit vs its parent) is immutable, so already-
processed commits are never recomputed. Each run only processes commits not yet
in state.json and appends their edges. A full rebuild happens automatically when
szz-ignore.txt changes or cached SHAs no longer exist (history rewrite), or with
--full.

Usage:
  python3 blame_causality.py          # incremental (default)
  python3 blame_causality.py --full   # force full rebuild
"""
import subprocess, re, sys, json, collections, time, os, hashlib

REPO = "/Users/npeltier/Documents/github/mas"
SCR  = os.path.dirname(os.path.abspath(__file__)) + "/"
EDGES_F, STATE_F = SCR+"edges_v2.json", SCR+"state.json"
FULL = "--full" in sys.argv
log = lambda m: print(m, file=sys.stderr, flush=True)

def git(*a):
    return subprocess.run(["git","-C",REPO,*a], capture_output=True, text=True, errors="replace").stdout

def load_ignore(path=SCR+"szz-ignore.txt"):
    return [ln.split("#",1)[0].strip().lower() for ln in open(path)
            if ln.split("#",1)[0].strip()]
IGNORE = load_ignore()
IGNORE_SIG = hashlib.sha1("\n".join(sorted(IGNORE)).encode()).hexdigest()[:12]

def excluded(path):
    p=path.lower()
    for pat in IGNORE:
        if pat.startswith("*."):
            if p.endswith(pat[1:]): return True
        elif pat.startswith("/") and pat.endswith("/"):
            if pat in p: return True
        elif p.startswith(pat) or ("/"+pat) in p:
            return True
    return False

TICKET = re.compile(r"MWPW-(\d+)", re.I)
def ticket_of(s):
    m=TICKET.search(s or ""); return "MWPW-"+m.group(1) if m else None

# --- current ticketed commits on the first-parent main line ------------------
sha_ticket, sha_subject = {}, {}
for ln in git("log","--no-merges","--first-parent","--pretty=%H%x01%s").splitlines():
    if "\x01" not in ln: continue
    sha,subj = ln.split("\x01",1); sha_subject[sha]=subj; sha_ticket[sha]=ticket_of(subj)
ticketed = [s for s,t in sha_ticket.items() if t]

# --- decide incremental vs full ----------------------------------------------
edges = collections.Counter()
processed = set()
mode, reason = "full", "no cache" if FULL else "no cache"
if not FULL and os.path.exists(STATE_F) and os.path.exists(EDGES_F):
    st = json.load(open(STATE_F))
    if st.get("ignore_sig") != IGNORE_SIG:
        reason = "szz-ignore.txt changed since last run"
    elif not set(st.get("processed",[])) <= set(sha_ticket):
        reason = "cached commits missing (history rewrite?)"
    else:
        mode, processed = "incremental", set(st["processed"])
        for e in json.load(open(EDGES_F)):
            edges[(e["cause"], e["fix"])] = e["lines"]
elif FULL:
    reason = "--full requested"

todo = [s for s in ticketed if s not in processed]

# --- start banner ------------------------------------------------------------
def fmt(sec):
    sec=int(sec); return f"{sec//60}m{sec%60:02d}s"
EST_PER_COMMIT = 1.7
log("="*64)
log("SZZ blame-causality")
log(f"  repo            : {REPO}")
log(f"  mode            : {mode.upper()}" + (f"  (reason: {reason})" if mode=='full' else ""))
log(f"  ticketed commits: {len(ticketed)} total  |  cached {len(processed)}  |  to process {len(todo)}")
log(f"  ignore patterns : {len(IGNORE)} (sig {IGNORE_SIG}) from szz-ignore.txt")
log(f"                    {', '.join(IGNORE)}")
log(f"  est. runtime    : ~{fmt(len(todo)*EST_PER_COMMIT)} (@ ~{EST_PER_COMMIT}s/commit; refines live)")
log(f"  output          : {EDGES_F}")
if not todo:
    log("  nothing new to process — cache already up to date.")
log("  progress prints every 10 commits; first tick within a few seconds.")
log("="*64)

# --- blame pass over new commits ---------------------------------------------
HUNK = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@")
start, processed_n, total = time.time(), 0, len(todo)
for sha in todo:
    fix_ticket = sha_ticket[sha]
    diff = git("show",sha,"--unified=0","--format=","-M")
    cur=None
    for line in diff.splitlines():
        if line.startswith("+++ b/"): cur=line[6:]; continue
        if line.startswith("--- "): continue
        h=HUNK.match(line)
        if not h or not cur or excluded(cur): continue
        os_,ol = int(h.group(1)), int(h.group(2) or 1)
        a,b = (os_, os_+ol-1) if (h.group(2)!='0' and ol>0) else (max(1,os_),)*2
        for bl in git("blame","--line-porcelain",f"-L{a},{b}",f"{sha}^","--",cur).splitlines():
            if re.match(r"^[0-9a-f]{40} ",bl):
                ct=sha_ticket.get(bl.split()[0])
                if ct and ct!=fix_ticket:
                    edges[(ct,fix_ticket)] += 1
    processed.add(sha); processed_n += 1
    if processed_n<=5 or processed_n%10==0 or processed_n==total:
        el=time.time()-start; rate=el/processed_n; eta=rate*(total-processed_n)
        log(f"[{processed_n}/{total}] {100*processed_n//total}%  elapsed {fmt(el)}  "
            f"~{rate:.1f}s/commit  ETA {fmt(eta)}  edges={len(edges)}")

# --- persist -----------------------------------------------------------------
out=[{"cause":c,"fix":f,"lines":n} for (c,f),n in edges.items()]
json.dump(out, open(EDGES_F,"w"))
json.dump({"ignore_sig":IGNORE_SIG, "processed":sorted(processed),
           "updated": time.strftime("%Y-%m-%dT%H:%M:%S")}, open(STATE_F,"w"), indent=0)
log(f"DONE: {mode}, +{processed_n} commits in {fmt(time.time()-start)}, "
    f"{len(out)} total edges -> edges_v2.json (state.json updated)")
