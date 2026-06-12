# Caddy Host Configuration

Append the blocks below to `/etc/caddy/Caddyfile` on the server.
Do **not** run a second Caddy inside Docker — the system Caddy handles TLS and reverse proxying.

```caddyfile
trustbridge.a-c-g.fi {
    header {
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    reverse_proxy 127.0.0.1:3100
}

trustbridge-api.a-c-g.fi {
    header {
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    reverse_proxy 127.0.0.1:8100
}
```

After editing, validate and reload:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```
