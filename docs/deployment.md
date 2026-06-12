# Production Deployment

## Architecture

```
Internet
   │
   ▼
System Caddy (ports 80/443, TLS managed automatically)
   ├── trustbridge.a-c-g.fi      → 127.0.0.1:3100  (Next.js container)
   └── trustbridge-api.a-c-g.fi  → 127.0.0.1:8100  (FastAPI container)

Docker Compose (backend + frontend only)
   ├── backend   127.0.0.1:8100:8000
   └── frontend  127.0.0.1:3100:3000
```

System Caddy is already installed on the server. **Do not run a second Caddy inside Docker Compose.**

## First-time setup

### 1. Clone the repo on the server

```bash
ssh root@65.108.213.26
git clone <repo-url> /opt/hmd-trustbridge
cd /opt/hmd-trustbridge
```

### 2. Create the production env file

```bash
cp .env.production.example .env.production
nano .env.production   # fill in real secrets
```

`.env.production` is listed in `.gitignore` and must never be committed.

### 3. Configure Caddy

Append the two site blocks from [caddy_host_config.md](caddy_host_config.md) to `/etc/caddy/Caddyfile`, then:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 4. Build and start containers

```bash
docker compose -f docker-compose.production.yml up -d --build
```

### 5. Verify

```bash
# Containers are running
docker compose -f docker-compose.production.yml ps

# Backend responds locally
curl http://127.0.0.1:8100/health

# Caddy is proxying correctly
curl https://trustbridge-api.a-c-g.fi/health
```

The public QR code points to **https://trustbridge.a-c-g.fi** — this is the stable `main` branch deployment and must always be accessible.

---

## Routine deploy (after `git push` to main)

```bash
ssh root@65.108.213.26
cd /opt/hmd-trustbridge
git checkout main
git pull
docker compose -f docker-compose.production.yml up -d --build
```

No Caddy restart is needed unless you changed the Caddyfile.

---

## Emergency rollback

```bash
ssh root@65.108.213.26
cd /opt/hmd-trustbridge

# Find the last good commit
git log --oneline

# Check out that commit
git checkout <previous_good_commit>

# Rebuild and restart
docker compose -f docker-compose.production.yml up -d --build
```

---

## Note on NEXT_PUBLIC_API_BASE_URL

Next.js bakes `NEXT_PUBLIC_*` variables into the JavaScript bundle at **build time**, not at runtime. The production URL (`https://trustbridge-api.a-c-g.fi`) is passed as a Docker build argument in `docker-compose.production.yml` so it is embedded correctly during `npm run build` inside the container. The `environment:` block also sets it for runtime consistency.

If you ever need to change the API URL, rebuild the frontend container — a simple restart is not enough.
