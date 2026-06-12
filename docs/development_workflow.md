# Development Workflow

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable public demo — always matches what the QR points to |
| `dev` | Active development — merge here first, test, then promote |

Never commit directly to `main`. All work goes through `dev`.

## Local development

```bash
git checkout dev

# make changes

git add .
git commit -m "Describe change"
git push
```

## Pre-deploy checklist

Before promoting `dev` to `main`, verify locally:

1. Start the backend: `cd backend && uvicorn app.main:app --reload --port 8000`
2. Start the frontend: `cd frontend && npm run dev`
3. Complete **Scenario A** (age 10, first smartphone, social media concern, high independence)
4. Verify score is **37 / 100** and readiness level is `not_ready`
5. Verify the AI-generated report section appears below the score ring
6. Verify the backend returned `POST /api/assessment 200 OK` (check terminal or browser DevTools)

All six checks must pass before promoting.

## Promote to public demo

```bash
git checkout main
git merge dev
git push
```

## Server deployment

```bash
ssh root@65.108.213.26
cd /opt/hmd-trustbridge
git checkout main
git pull
docker compose -f docker-compose.production.yml up -d --build
```

The public QR code always points to **https://trustbridge.a-c-g.fi**, which serves the `main` branch deployment. Do not change what the QR points to mid-hackathon.

## Emergency rollback

```bash
# On the server — find the last good commit
git log --oneline

# Check out that commit
git checkout <previous_good_commit>

# Rebuild and restart
docker compose -f docker-compose.production.yml up -d --build
```

## What never gets committed

```
.env
.env.*
.env.production
frontend/.env.local
backend/.env
node_modules/
backend/.venv/
```

These are all covered by `.gitignore`. If `git status` shows any of them as untracked, stop and investigate before committing.
