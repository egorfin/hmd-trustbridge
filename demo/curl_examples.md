# curl Examples

## Health check

```bash
curl http://localhost:8000/health
```

## Submit assessment — Strong Readiness

```bash
curl -X POST http://localhost:8000/api/assess \
  -H "Content-Type: application/json" \
  -d '{
    "child_age": 13,
    "device_experience": "own_device",
    "social_media_exposure": "supervised",
    "parent_concern_areas": ["screen_time"],
    "household_rules_exist": true,
    "child_can_handle_peer_pressure": "usually",
    "country": "Finland",
    "language": "en"
  }'
```

## Submit assessment — Early Stage

```bash
curl -X POST http://localhost:8000/api/assess \
  -H "Content-Type: application/json" \
  -d '{
    "child_age": 8,
    "device_experience": "none",
    "social_media_exposure": "none",
    "parent_concern_areas": ["cyberbullying", "content", "privacy"],
    "household_rules_exist": false,
    "child_can_handle_peer_pressure": "rarely",
    "country": "Finland",
    "language": "en"
  }'
```
