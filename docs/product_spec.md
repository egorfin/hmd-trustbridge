# Product Spec — HMD TrustBridge

## Problem

Parents considering a child's first smartphone face a trust problem, not a product selection problem. They need guidance, not sales pressure.

## Solution

A 60–90 second Digital Readiness Assessment that produces a personalized report:
- Readiness Score (0–100, deterministic)
- Key digital risk areas
- Personalized Safety Strategy
- Earned HMD Fuse recommendation

## User Journey (MVP)

1. Parent scans in-store QR next to HMD Fuse
2. Lands on mobile-first assessment UI
3. Answers 5–7 questions (child age, experience, exposure, family rules, concerns)
4. Receives Digital Readiness Report
5. Sees why (or why not) HMD Fuse fits their strategy

## Assessment Questions (Draft)

| # | Question | Type |
|---|----------|------|
| 1 | How old is your child? | Number |
| 2 | What device experience does your child have? | Single select |
| 3 | Is your child on social media? | Single select |
| 4 | What are your main concerns? | Multi select |
| 5 | Do you have household digital rules? | Yes/No |
| 6 | How well does your child handle peer pressure? | Single select |

## Scoring Model

See `backend/app/scoring.py`. Score is deterministic and explainable.
LLM generates narrative based on the score — it does not determine the score.

## Core Principles

- Trust, not pressure
- Reduce parental anxiety
- Privacy-first (no long-term child profiles)
- Recommendation must feel earned
