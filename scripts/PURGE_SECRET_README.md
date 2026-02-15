# Purge leaked `.env` / secret from Git history

Warning: these operations rewrite Git history. Coordinate with your team and ensure everyone clones/pulls fresh after the forced push.

Preferred tool: `git-filter-repo` (fast, recommended). Alternative: BFG Repo-Cleaner (Java required).

1) Safety checklist
- Backup your repo (clone to another folder):

```bash
git clone --mirror . ../repo-backup.git
```

- Ensure you have pushed all local branches you care about or saved them elsewhere.

2) Using git-filter-repo to remove the file `.env` entirely from history

Install (if needed):

```bash
# on Windows (with Python installed)
pip install git-filter-repo

# or follow https://github.com/newren/git-filter-repo installation notes
```

Run filter (from repo root):

```bash
git filter-repo --invert-paths --paths .env
```

This removes `.env` from all commits. After success:

```bash
# force push all refs (branches & tags)
git push origin --force --all
git push origin --force --tags
```

3) Using BFG to remove `.env` (alternative)

Install BFG: https://rtyley.github.io/bfg-repo-cleaner/

```bash
# create a mirror clone first
git clone --mirror <repo-url> repo.git
cd repo.git
# remove .env
bfg --delete-files .env
# follow-up cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

4) Replace a specific secret string across history (git-filter-repo)

Create `replacements.txt` with a line like:

```
# lines beginning with # are comments
OLD_SECRET==>REDACTED_SECRET
```

Then run:

```bash
git filter-repo --replace-text replacements.txt
git push origin --force --all
git push origin --force --tags
```

5) Post-clean steps
- Ask collaborators to reclone the repo (`git clone`), or run local commands to align with rewritten history:

```bash
# if they want to repair local clones (advanced)
git fetch origin --prune
git reset --hard origin/main
```

- Rotate any leaked keys immediately (see next section).

6) Rotate Supabase service key (manual)
- Go to Supabase dashboard → Project Settings → API → Service Role
- Click **Regenerate** for the service role key.
- Update the new key in all deployment environments / CI / secrets stores and restart services.

7) Optional: scan push logs to verify old secret no longer present

You can search commit history for the old key (if known) or `.env` references to confirm removal.

---
If you want, I can create a PowerShell script that wraps `git-filter-repo` and performs the mirror/replace/push steps (you must review before running). Reply `make script` to have me add it.
