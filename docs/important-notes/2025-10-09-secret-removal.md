# Repository Secret Removal Note

**Date:** 2025-10-09

## Summary
- The Google Cloud service account secret was fully purged from all git history using a mirror clone and `git filter-repo`.
- The cleaned repository (`McCals-Website-CLEAN`) is now the canonical, safe version.
- The original local repo (`McCals-Website`) is permanently tainted and will always be blocked by GitHub push protection.
- All future work should use the cleaned repo. Old clones must be deleted or reset.
- All collaborators must re-clone from GitHub to avoid push protection errors.

## Steps Taken
1. Created a mirror clone of the repository.
2. Ran `git filter-repo` to remove the secret file from all history, branches, and tags.
3. Verified the file was gone from all history.
4. Force-pushed all refs and tags to GitHub.
5. Confirmed push protection was resolved and the secret was purged.

## Action Items
- [ ] Ensure all collaborators re-clone the repository from GitHub.
- [ ] Delete or archive the old, tainted local repository.
- [ ] Use the cleaned repository for all future work.

---

This note is saved for future reference. If you need to repeat this process or share with collaborators, follow the steps above.
