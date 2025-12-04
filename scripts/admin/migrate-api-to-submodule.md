# Migrate `src/api` → Private repo `mccal-api` and integrate via submodule

This runbook moves the site API from `src/api` into a new private repo `McCal-Codes/mccal-api`, then links it back here via a Git submodule at `src/api`. It aligns with workspace guardrails and Cloudflare hosting.

## Prereqs

- macOS, zsh
- GitHub access to `McCal-Codes`
- Cloudflare account for `mcc-cal.com`

## Steps

### 1) Create private repo

- On GitHub, create `McCal-Codes/mccal-api` (Private). Leave it empty.

### 2) Stage API contents

```zsh
# From McCals-Website root
cd "/Users/mccal/Coding Shenanigans/McCals-Website"
mkdir -p ../mccal-api
rsync -av --exclude='node_modules' --exclude='.env' src/api/ ../mccal-api/

# Optional: copy Docker files if the API repo should build standalone
[ -f Dockerfile.api ] && cp Dockerfile.api ../mccal-api/Dockerfile
[ -f docker-compose.yml ] && cp docker-compose.yml ../mccal-api/docker-compose.yml
```

### 3) Initialize new repo

```zsh
cd ../mccal-api
git init
git remote add origin git@github.com:McCal-Codes/mccal-api.git
echo 'node_modules/' >> .gitignore
echo '.env' >> .gitignore

cat > .env.example <<'EOF'
PORT=3001
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-me
WEBHOOK_SECRET=replace-me
ALLOWED_ORIGINS=https://mccalmedia.com,https://*.squarespace.com
EOF

git add .
git commit -m "Initial import: API extracted from McCals-Website/src/api"
git branch -M main
git push -u origin main
```

### 4) Replace local API with submodule

```zsh
cd "/Users/mccal/Coding Shenanigans/McCals-Website"
# Remove old inline API
git rm -r src/api
git commit -m "Remove inline API to prepare submodule"

# Add submodule back at src/api
git submodule add -b main git@github.com:McCal-Codes/mccal-api.git src/api
git submodule update --init --recursive
git add .gitmodules src/api
git commit -m "Add mccal-api as submodule at src/api"

git push origin chore/lfs-cdn-helpers
```

### 5) Local dev

```zsh
# API repo
cd ../mccal-api
npm install
npm run dev # or your API start script

# Site repo (if you have a dev proxy)
cd "/Users/mccal/Coding Shenanigans/McCals-Website"
npm run dev:with-api
```

### 6) Cloudflare deploy

- Create a Cloudflare API token (least privilege: Workers/Pages Deploy).
- Store token in `mccal-api` repo secrets as `CLOUDFLARE_API_TOKEN`.
- Configure `api.mcc-cal.com` in Cloudflare (Routes for Workers or Custom Domain for Pages Functions).
- Bind env vars/secrets in Cloudflare: `ALLOWED_ORIGINS`, `JWT_SECRET`, `WEBHOOK_SECRET`.

### 7) CI updates in site repo

- Any workflow that needs submodules:
  - `actions/checkout@v4` with `submodules: true` and either PAT (`secrets.PRIVATE_REPO_PAT`) or SSH key (`secrets.SUBMODULE_SSH_KEY`), set `persist-credentials: false` for SSH.
- Keep widget prepublish CI focused only on widgets.

### 8) Documentation & TODO Traceability

- Update `.github/copilot-instructions.md` (integration notes, CORS/auth, CI changes).
- Add a Docs/Meta entry in `CHANGELOG.md`.
- Add `TODO:` in code and mirror entries in `updates/todo.md`.

## Optional: Preserve history via subtree

```zsh
# From McCals-Website root
git subtree split --prefix=src/api -b api-split
mkdir -p ../mccal-api
cd ../mccal-api
git init
git remote add origin git@github.com:McCal-Codes/mccal-api.git
git pull "/Users/mccal/Coding Shenanigans/McCals-Website" api-split
git push -u origin main
```

## Verification

- DNS resolves `api.mcc-cal.com` (after nameserver setup)
- API health endpoint returns 200 with proper CORS headers
- Widgets can fetch public endpoints with `ETag`/`Cache-Control`
