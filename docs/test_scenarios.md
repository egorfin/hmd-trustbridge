# Test Scenarios

## Scenario A — "Strong Readiness" (score ~75+)

**Input:**
- Age: 13
- Device experience: own_device
- Social media: supervised
- Concerns: screen_time
- Household rules: true
- Peer pressure: usually

**Expected:**
- Score: 75–85
- Label: "Strong Readiness"
- Fuse recommended: true

---

## Scenario B — "Early Stage" (score ~20)

**Input:**
- Age: 8
- Device experience: none
- Social media: none
- Concerns: cyberbullying, content, privacy
- Household rules: false
- Peer pressure: rarely

**Expected:**
- Score: 10–25
- Label: "Early Stage"
- Fuse recommended: false

---

## Scenario C — "Developing Readiness" (score ~55)

**Input:**
- Age: 11
- Device experience: tablet_only
- Social media: none
- Concerns: screen_time, content
- Household rules: true
- Peer pressure: sometimes

**Expected:**
- Score: 50–65
- Label: "Developing Readiness"
- Fuse recommended: conditionally (threshold at 45)
