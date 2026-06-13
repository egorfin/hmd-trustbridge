"use client";

import { AssessmentResponse, FormSummary } from "@/lib/types";
import type { EvidenceSource } from "@/lib/evidenceSources";

export type PathKey = "protected" | "guided" | "flexible";

// ── Path config ───────────────────────────────────────────────────────────────

type PathConfig = {
  product: string;
  approach: string;
  ctaUrl: string;
  availabilityNote?: string;
};

const PATH_CONFIG: Record<PathKey, PathConfig> = {
  protected: {
    product: "HMD Fuse + HarmBlock+",
    approach: "Protected Start",
    ctaUrl: "https://www.hmd.com/en_int/hmd-fuse",
    availabilityNote: "Availability may vary by country or retailer.",
  },
  guided: {
    product: "HMD Fusion X1",
    approach: "Guided Independence",
    ctaUrl: "https://www.hmd.com",
  },
  flexible: {
    product: "Standard HMD phone with family controls",
    approach: "Flexible Boundaries",
    ctaUrl: "https://www.hmd.com",
  },
};

// ── Path derivation (concern-first) ──────────────────────────────────────────

export function derivePathKey(result: AssessmentResponse, summary: FormSummary | null): PathKey {
  const level = result.readiness_level;
  const isFirst = summary?.isFirstSmartphone;
  const age = summary?.childAge ?? 0;
  const concern = summary?.mainConcernKey || result.risk_profile[0]?.key || "";

  // Concern-driven overrides — these take priority over readiness level
  switch (concern) {
    case "harmful_content":
      // HarmBlock+ is the clearest differentiator; prefer Fuse unless clearly older + existing phone
      if (age === 0 || age < 15 || isFirst !== false) return "protected";
      return "guided"; // age 15+ with existing phone → Fusion X1 also appropriate

    case "strangers":
      // Fuse trusted contacts for younger; Fusion X1 for older
      if (age > 0 && age < 13) return "protected";
      return "guided";

    case "screen_time":
      // Fusion X1 has school mode, app management, screen-time tools
      // Exception: very young first-phone users still benefit from Protected Start
      if (age > 0 && age < 10 && isFirst !== false) return "protected";
      return "guided";

    case "cyberbullying":
    case "social_pressure":
      // Guided independence with app management for older children
      if (age > 0 && age >= 11) return "guided";
      if (isFirst !== false) return "protected";
      return "guided";
  }

  // Fallback: readiness-level based (for privacy, not_sure, or no known concern)
  if (level === "ready_with_boundaries") return "flexible";
  if (level === "moderate") return "guided";

  // not_ready fallbacks
  if (isFirst === false) return "guided"; // existing phone → guided, not "start from scratch"
  if (age >= 16) return "guided";
  return "protected";
}

// ── Data accessors ────────────────────────────────────────────────────────────

export function getProductName(result: AssessmentResponse, summary: FormSummary | null): string {
  return PATH_CONFIG[derivePathKey(result, summary)].product;
}

export function getHmdPathCtaUrl(result: AssessmentResponse, summary: FormSummary | null): string {
  return PATH_CONFIG[derivePathKey(result, summary)].ctaUrl;
}

// ── Why sentence ──────────────────────────────────────────────────────────────

const WHY_SENTENCES: Record<PathKey, Record<string, string>> = {
  protected: {
    strangers:       "Designed for families starting carefully, with trusted contacts and protection from unknown online contact.",
    screen_time:     "Designed for a structured introduction with parent-managed access and gradual screen-time habits from day one.",
    harmful_content: "Includes HarmBlock+ and guardian-managed controls to help reduce exposure to harmful content from the start.",
    cyberbullying:   "Supports a careful, trusted introduction to online communication with parent-visible controls.",
    social_pressure: "Delays unrestricted social access, giving your family time to build digital confidence together.",
    privacy:         "Built with privacy-conscious design to reduce data exposure in the early stages of smartphone use.",
    not_sure:        "Designed for families prioritising a safe, structured introduction to smartphone use.",
    default:         "Designed for families prioritising a safe, structured introduction to smartphone use.",
  },
  guided: {
    strangers:       "Supports gradual independence with trusted-contact controls and app management for safer communication.",
    screen_time:     "Supports screen-time structure, app management and school mode as your family builds healthy habits.",
    harmful_content: "Provides app management and family controls to help reduce content exposure as independence grows.",
    cyberbullying:   "Balances online access with parental visibility and trusted communication tools.",
    social_pressure: "Supports a measured approach to social features alongside growing digital independence.",
    privacy:         "Gives families visibility and control while allowing gradual, trust-based digital independence.",
    not_sure:        "Supports your family's balanced approach with app management and gradual independence.",
    default:         "Supports your family's balanced approach with app management and gradual independence.",
  },
  flexible: {
    strangers:       "Gives your family the tools to set communication boundaries while supporting responsible online independence.",
    screen_time:     "Provides digital wellbeing tools and screen-time management for a family with clear habits in place.",
    harmful_content: "Family controls are available to complement the healthy digital habits your family has already built.",
    cyberbullying:   "Supports open communication and family-agreed boundaries for confident, independent online use.",
    social_pressure: "Fits a family with clear digital values who want tools to reinforce agreed communication habits.",
    privacy:         "Supports a privacy-conscious family with optional controls and trust-based, open device use.",
    not_sure:        "Supports your family's confident approach with flexible tools and family-agreed boundaries.",
    default:         "Supports your family's confident approach with flexible tools and family-agreed boundaries.",
  },
};

export function buildWhy(result: AssessmentResponse, summary: FormSummary | null): string {
  const pathKey = derivePathKey(result, summary);
  const concernKey = summary?.mainConcernKey || result.risk_profile[0]?.key || "default";
  return WHY_SENTENCES[pathKey][concernKey] ?? WHY_SENTENCES[pathKey].default;
}

// ── Challenge display labels ──────────────────────────────────────────────────

export const CHALLENGE_LABEL: Record<string, string> = {
  strangers:       "Online Strangers",
  screen_time:     "Healthy Screen Habits",
  harmful_content: "Harmful Content",
  cyberbullying:   "Online Respect",
  social_pressure: "Social Pressure",
  privacy:         "Digital Privacy",
  not_sure:        "Overall Safety",
};

// ── Smartphone comparison panel ───────────────────────────────────────────────

const REGULAR_PHONE_TEXT: Record<string, string> = {
  strangers:
    "Any messaging app can be installed without restriction. Parents must individually manage each service to control who can contact their child.",
  screen_time:
    "Full app access by default. Screen-time management requires configuring controls across apps, services and system settings — often separately.",
  harmful_content:
    "Content access depends on per-app settings. Parents must manage content controls across every app, browser and streaming service independently.",
  cyberbullying:
    "Social and messaging apps are fully open by default. Parents have limited built-in visibility across different services and platforms.",
  social_pressure:
    "Social apps and notifications are unrestricted by default, making it harder to manage peer pressure and always-on communication.",
  privacy:
    "App permissions and data sharing are managed per-app. Parents must configure privacy settings independently across all installed services.",
  not_sure:
    "A standard smartphone offers full access from day one, which requires significant parent configuration to manage safely.",
  default:
    "A standard smartphone offers full access from day one, requiring parents to configure safety controls across all apps and services.",
};

const HMD_PATH_TEXT: Record<PathKey, Record<string, string>> = {
  protected: {
    strangers:
      "HMD Fuse supports a trusted-contact model, starting without unrestricted messaging before your family is ready to expand access.",
    screen_time:
      "HMD Fuse includes parent-managed app controls and a gradual introduction model, making it easier to build screen-time habits from day one.",
    harmful_content:
      "HMD Fuse + HarmBlock+ is designed to help reduce exposure to nude and sexual imagery across the device experience.",
    cyberbullying:
      "HMD Fuse supports a careful introduction to online communication, starting with trusted contacts before broader social access.",
    social_pressure:
      "HMD Fuse delays unrestricted social access, giving your family time to build confidence and agreed digital habits together.",
    privacy:
      "HMD Fuse is designed with privacy considerations for younger users, limiting data exposure in the early stages.",
    not_sure:
      "HMD Fuse is designed for a safer, structured start — reducing parent setup burden while supporting healthy digital habits.",
    default:
      "HMD Fuse is designed for a safer, structured start — reducing parent setup burden while supporting healthy digital habits.",
  },
  guided: {
    strangers:
      "HMD Fusion X1 provides trusted contacts and location features, helping families stay connected while managing external contact.",
    screen_time:
      "HMD Fusion X1 includes screen-time support, school mode and app management tools, supporting healthy habits as independence grows.",
    harmful_content:
      "HMD Fusion X1 includes parent-managed app controls to help reduce harmful content exposure as independence develops.",
    cyberbullying:
      "HMD Fusion X1 provides family visibility tools and trusted communication features alongside growing digital independence.",
    social_pressure:
      "HMD Fusion X1 supports a gradual introduction to social features with parent-managed controls and screen-time support.",
    privacy:
      "HMD Fusion X1 includes privacy-conscious design with parent-managed app access and location features.",
    not_sure:
      "HMD Fusion X1 supports a balanced introduction with family controls and gradual digital independence.",
    default:
      "HMD Fusion X1 supports a balanced introduction with family controls and gradual digital independence.",
  },
  flexible: {
    strangers:
      "HMD smartphones provide family connectivity tools and parental controls to reinforce agreed communication boundaries.",
    screen_time:
      "HMD smartphones include digital wellbeing tools and parental controls you can configure to match your family's agreed boundaries.",
    harmful_content:
      "HMD smartphones include parental controls for content management to complement your family's existing approach.",
    cyberbullying:
      "HMD smartphones support family-agreed communication boundaries with available parental controls and digital wellbeing tools.",
    social_pressure:
      "HMD smartphones provide digital wellbeing tools to support social media balance alongside your family's agreed habits.",
    privacy:
      "HMD smartphones provide standard Android privacy controls you can configure alongside family-agreed digital agreements.",
    not_sure:
      "HMD smartphones provide a familiar experience with family controls available when needed.",
    default:
      "HMD smartphones provide a familiar experience with family controls available when needed.",
  },
};

const PATH_CAPABILITIES: Record<PathKey, string[]> = {
  protected: [
    "Starts without unrestricted app access",
    "Trusted contacts setup",
    "Parent-managed app controls",
    "HarmBlock+ may help reduce exposure to nude and sexual imagery",
    "Gradual independence model",
  ],
  guided: [
    "App management controls",
    "Trusted contacts",
    "Location features",
    "Screen-time support and school mode",
    "Gradual increase in independence",
  ],
  flexible: [
    "Digital wellbeing tools",
    "Screen time management",
    "Family location features",
    "Parental controls available",
    "Standard app access",
  ],
};

// ── "How this HMD path helps" panel ──────────────────────────────────────────

const PRODUCT_DESCRIPTION: Record<PathKey, string> = {
  protected: "HMD Fuse is designed for a protected first-smartphone start, with parent-managed app access, trusted contacts, and HarmBlock+ for content filtering support.",
  guided:    "HMD Fusion X1 supports growing independence — with tools for app management, screen-time control, and gradual expansion of access as trust develops.",
  flexible:  "Standard HMD smartphones provide digital wellbeing tools and parental controls your family can configure to reinforce agreed boundaries.",
};

const PRODUCT_FEATURES: Record<PathKey, string[]> = {
  protected: [
    "HarmBlock+ may help reduce exposure to nude and sexual imagery",
    "Starts without unrestricted app access",
    "Guardian-managed app permissions",
    "Trusted contacts — controls who can call or message",
    "Gradual independence model — access can be expanded over time",
  ],
  guided: [
    "App management controls — parent sets which apps are available",
    "Screen-time support and school mode",
    "Trusted contacts setup",
    "Location features for family visibility",
    "Gradual independence as trust develops",
  ],
  flexible: [
    "Digital wellbeing tools included",
    "Screen time management available",
    "Family location features",
    "Parental controls configurable",
    "Open app access with family-agreed rules",
  ],
};

interface HmdPathHelpProps {
  result: AssessmentResponse;
  summary: FormSummary | null;
}

export function HmdPathHelpContent({ result, summary }: HmdPathHelpProps) {
  const pathKey = derivePathKey(result, summary);
  const product = PATH_CONFIG[pathKey].product;
  const description = PRODUCT_DESCRIPTION[pathKey];
  const features = PRODUCT_FEATURES[pathKey];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hmd-blue/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0057B8" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-900">{product}</p>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      <div className="space-y-2">
        {features.map((feat, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-hmd-blue font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
            <span className="text-sm text-gray-700 leading-relaxed">{feat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Smartphone comparison panel ───────────────────────────────────────────────

interface ComparisonPanelProps {
  result: AssessmentResponse;
  summary: FormSummary | null;
  productEvidence?: EvidenceSource | null;
}

export function SmartphoneComparisonContent({ result, summary, productEvidence }: ComparisonPanelProps) {
  const pathKey = derivePathKey(result, summary);
  const concernKey = summary?.mainConcernKey || result.risk_profile[0]?.key || "default";
  const regularText = REGULAR_PHONE_TEXT[concernKey] ?? REGULAR_PHONE_TEXT.default;
  const hmdText = HMD_PATH_TEXT[pathKey][concernKey] ?? HMD_PATH_TEXT[pathKey].default;
  const capabilities = PATH_CAPABILITIES[pathKey];
  const product = PATH_CONFIG[pathKey].product;
  const availabilityNote = PATH_CONFIG[pathKey].availabilityNote;

  return (
    <div className="space-y-3 pt-2">

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Regular smartphone</p>
        <p className="text-sm text-gray-600 leading-relaxed">{regularText}</p>
      </div>

      <div className="rounded-xl border border-hmd-teal/20 bg-teal-50/40 p-4 space-y-3">
        <p className="text-[10px] font-bold text-hmd-teal uppercase tracking-widest">{product}</p>
        <p className="text-sm text-gray-700 leading-relaxed">{hmdText}</p>
        <div className="space-y-1.5 pt-1">
          {capabilities.map((cap, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-hmd-teal font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
              <span className="text-xs text-gray-700 leading-relaxed">{cap}</span>
            </div>
          ))}
        </div>
        {productEvidence && (
          <div className="pt-2 mt-1 border-t border-hmd-teal/10">
            <a
              href={productEvidence.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-hmd-teal hover:underline inline-flex items-center gap-0.5"
            >
              Source: {productEvidence.shortLabel}
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-2.5 h-2.5 ml-0.5">
                <path d="M1 11L11 1M11 1H4.5M11 1V7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        )}
        {availabilityNote && (
          <p className="text-[10px] text-gray-400 mt-1">{availabilityNote}</p>
        )}
      </div>

    </div>
  );
}
