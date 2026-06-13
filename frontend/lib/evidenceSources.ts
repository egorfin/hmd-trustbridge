import type { PathKey } from "@/components/HmdPathSection";

// ── Type ──────────────────────────────────────────────────────────────────────

export type EvidenceSource = {
  id: string;
  title: string;
  organization: string;
  url: string;
  sourceType: "independent" | "public_health" | "government" | "ngo" | "hmd";
  shortLabel: string;
  evidenceText: string;
  triggerTags: string[];
  avoidWhen?: string[];
};

export type EvidenceSet = {
  challengeEvidence: EvidenceSource | null;   // dashboard: "Why this matters"
  comparisonEvidence: EvidenceSource | null;  // accordion 2: regular phone comparison
  productEvidence: EvidenceSource | null;     // accordion 2: HMD path source card
  all: EvidenceSource[];                      // research accordion: only sources used here
};

// ── Source library ────────────────────────────────────────────────────────────

export const EVIDENCE_SOURCES: Record<string, EvidenceSource> = {

  thl_finland: {
    id: "thl_finland",
    title: "THL Finland — Digital device recommendations for children",
    organization: "Finnish Institute for Health and Welfare (THL)",
    url: "https://thl.fi/-/digisuositukset-lapsille-ovat-valmiit-omia-alypuhelimia-ei-suositella-alle-13-vuotiaille",
    sourceType: "public_health",
    shortLabel: "THL Finland digital recommendations",
    evidenceText:
      "THL Finland recommends that children under 13 should not have their own personal smartphone, and that children under 13 should not use social media services.",
    triggerTags: ["age_under_13", "first_smartphone", "screen_time", "social_media_use", "younger_child"],
    avoidWhen: ["age_16_plus"],
  },

  unicef: {
    id: "unicef",
    title: "UNICEF — Protecting children online",
    organization: "UNICEF",
    url: "https://www.unicef.org/protection/violence-against-children-online",
    sourceType: "ngo",
    shortLabel: "UNICEF online child protection",
    evidenceText:
      "UNICEF highlights online sexual exploitation, abuse, cyberbullying and harmful content as major risks for children online.",
    triggerTags: ["harmful_content", "cyberbullying", "strangers"],
    avoidWhen: [],
  },

  save_children_finland: {
    id: "save_children_finland",
    title: "Save the Children Finland — Online grooming research",
    organization: "Save the Children Finland / EU Better Internet for Kids",
    url: "https://better-internet-for-kids.europa.eu/en/news/save-children-finland-publishes-new-data-online-grooming-sexual-purposes",
    sourceType: "ngo",
    shortLabel: "Save the Children Finland grooming research",
    evidenceText:
      "Save the Children Finland reported that online grooming and unwanted contact are real risks for children, based on survey data from Finnish children aged 11–17.",
    triggerTags: ["strangers", "harmful_content", "friends_use", "social_media_use"],
    avoidWhen: ["screen_time_only"],
  },

  eu_bik: {
    id: "eu_bik",
    title: "EU Better Internet for Kids / BIK+",
    organization: "European Commission",
    url: "https://digital-strategy.ec.europa.eu/en/policies/strategy-better-internet-kids",
    sourceType: "government",
    shortLabel: "EU Better Internet for Kids",
    evidenceText:
      "The EU Better Internet for Kids strategy promotes digital environments where children are protected, respected and empowered online.",
    triggerTags: ["balanced_independence", "guided_independence", "healthy_habits", "privacy", "social_pressure"],
    avoidWhen: [],
  },

  esafety: {
    id: "esafety",
    title: "eSafety Commissioner — Parental controls guidance",
    organization: "Australian eSafety Commissioner",
    url: "https://www.esafety.gov.au/parents/issues-and-advice/parental-controls",
    sourceType: "government",
    shortLabel: "eSafety parental controls guidance",
    evidenceText:
      "eSafety explains that parental controls can help manage screen time, limit communications and reduce access to harmful content.",
    triggerTags: ["screen_time", "harmful_content", "strangers", "app_controls", "trusted_contacts"],
    avoidWhen: [],
  },

  hmd_better_phone_project: {
    id: "hmd_better_phone_project",
    title: "HMD Better Phone Project",
    organization: "HMD / Human Mobile Devices",
    url: "https://www.hmd.com/en_int/better-phone-project",
    sourceType: "hmd",
    shortLabel: "HMD Better Phone Project",
    evidenceText:
      "HMD's Better Phone Project focuses on building safer, more age-appropriate phone experiences with input from parents and children.",
    triggerTags: ["hmd_recommendation", "first_smartphone", "healthy_habits", "balanced_independence"],
    avoidWhen: [],
  },

  hmd_research_strangers: {
    id: "hmd_research_strangers",
    title: "HMD 2025 child online safety research",
    organization: "HMD / Human Mobile Devices",
    url: "https://www.hmd.com/en_int/press/new-phones-with-enhanced-safety-press-release",
    sourceType: "hmd",
    shortLabel: "HMD 2025 child online safety research",
    evidenceText: "HMD research found that 51% of children had been contacted online by strangers.",
    triggerTags: ["strangers"],
    avoidWhen: ["screen_time_only"],
  },

  hmd_research_harmful_content: {
    id: "hmd_research_harmful_content",
    title: "HMD 2025 child online safety research",
    organization: "HMD / Human Mobile Devices",
    url: "https://www.hmd.com/en_int/press/new-phones-with-enhanced-safety-press-release",
    sourceType: "hmd",
    shortLabel: "HMD 2025 child online safety research",
    evidenceText: "HMD research found that 40% of children had been sent sexual or violent content online.",
    triggerTags: ["harmful_content"],
    avoidWhen: [],
  },

  hmd_research_screen_time: {
    id: "hmd_research_screen_time",
    title: "HMD 2025 child online safety research",
    organization: "HMD / Human Mobile Devices",
    url: "https://www.hmd.com/en_int/press/new-phones-with-enhanced-safety-press-release",
    sourceType: "hmd",
    shortLabel: "HMD 2025 child online safety research",
    evidenceText: "HMD research found that 52% of children felt addicted to screens.",
    triggerTags: ["screen_time"],
    avoidWhen: ["strangers_only"],
  },

  hmd_research_cyberbullying: {
    id: "hmd_research_cyberbullying",
    title: "HMD 2025 child online safety research",
    organization: "HMD / Human Mobile Devices",
    url: "https://www.hmd.com/en_int/press/new-phones-with-enhanced-safety-press-release",
    sourceType: "hmd",
    shortLabel: "HMD 2025 child online safety research",
    evidenceText: "HMD research found that 56% of children had been insulted or made to feel small online.",
    triggerTags: ["cyberbullying", "social_pressure"],
    avoidWhen: [],
  },

  hmd_fuse_product: {
    id: "hmd_fuse_product",
    title: "HMD Fuse product page",
    organization: "HMD / Human Mobile Devices",
    url: "https://www.hmd.com/en_int/hmd-fuse",
    sourceType: "hmd",
    shortLabel: "HMD Fuse + HarmBlock+",
    evidenceText:
      "HMD Fuse is designed for a protected first-smartphone start, with HarmBlock+ and guardian-managed access to apps and contacts.",
    triggerTags: ["protected_path", "harmful_content", "first_smartphone", "age_under_13"],
    avoidWhen: [],
  },

  hmd_fusion_x1_product: {
    id: "hmd_fusion_x1_product",
    title: "HMD Fusion X1 product page",
    organization: "HMD / Human Mobile Devices",
    url: "https://www.hmd.com/nl_nl/hmd-fusion-x1",
    sourceType: "hmd",
    shortLabel: "HMD Fusion X1",
    evidenceText:
      "HMD Fusion X1 is positioned as a teen smartphone with parental controls for app access, screen time, location features, school mode and trusted contacts.",
    triggerTags: ["guided_path", "screen_time", "age_11_plus", "first_smartphone_false"],
    avoidWhen: [],
  },
};

// ── Selection ─────────────────────────────────────────────────────────────────

type SelectParams = {
  concernKey: string;
  childAge: number;
  mainUseKeys: string[];
  readinessLevel: string;
  pathKey: PathKey;
  isFirstSmartphone: boolean | null;
};

export function selectEvidenceSet({
  concernKey,
  childAge,
  mainUseKeys,
  readinessLevel,
  pathKey,
  isFirstSmartphone,
}: SelectParams): EvidenceSet {
  const seen = new Set<string>();
  const all: EvidenceSource[] = [];

  function add(id: string): EvidenceSource | null {
    const src = EVIDENCE_SOURCES[id];
    if (src && !seen.has(id)) {
      seen.add(id);
      all.push(src);
    }
    return src ?? null;
  }

  const isYoung = childAge > 0 && childAge < 13;
  const isOlderTeen = childAge >= 16;
  const usesSocial = mainUseKeys.includes("social");
  const usesFriends = mainUseKeys.includes("friends");
  const isBalanced = readinessLevel === "moderate" || readinessLevel === "ready_with_boundaries";

  // ── 1. Challenge evidence (specific statistic matching the concern) ──────────
  const CHALLENGE_MAP: Record<string, string> = {
    harmful_content: "hmd_research_harmful_content",
    strangers:       "hmd_research_strangers",
    screen_time:     "hmd_research_screen_time",
    cyberbullying:   "hmd_research_cyberbullying",
    social_pressure: "hmd_research_cyberbullying",
    privacy:         "eu_bik",
    not_sure:        "hmd_better_phone_project",
  };
  const challengeEvidence = add(CHALLENGE_MAP[concernKey] ?? "hmd_better_phone_project");

  // ── 2. Comparison evidence (independent/non-HMD for "why not regular phone") ─
  // Prefer government/ngo source; THL is gold standard for under-13
  let comparisonEvidence: EvidenceSource | null = null;
  if (isYoung && !isOlderTeen) {
    comparisonEvidence = add("thl_finland");
  } else {
    const COMPARISON_MAP: Record<string, string> = {
      harmful_content: "unicef",
      strangers:       "save_children_finland",
      screen_time:     "esafety",
      cyberbullying:   "unicef",
      social_pressure: "eu_bik",
      privacy:         "esafety",
      not_sure:        "eu_bik",
    };
    comparisonEvidence = add(COMPARISON_MAP[concernKey] ?? "eu_bik");
  }

  // ── 3. Product evidence (HMD product page shown inside HMD path card) ────────
  let productEvidence: EvidenceSource | null = null;
  if (pathKey === "protected") {
    productEvidence = add("hmd_fuse_product");
  } else if (pathKey === "guided") {
    productEvidence = add("hmd_fusion_x1_product");
  } else {
    productEvidence = add("hmd_better_phone_project");
  }

  // ── 4. Additional contextual sources ─────────────────────────────────────────

  // Under-13 device guidance (never for 16+)
  if (isYoung && !isOlderTeen && !seen.has("thl_finland")) add("thl_finland");

  // THL social media under-13 (already covered by thl_finland evidenceText)

  // Strangers or social use → Save the Children
  if ((concernKey === "strangers" || usesSocial || usesFriends) && !seen.has("save_children_finland")) {
    add("save_children_finland");
  }

  // Harmful content or cyberbullying → UNICEF
  if ((concernKey === "harmful_content" || concernKey === "cyberbullying") && !seen.has("unicef")) {
    add("unicef");
  }

  // Controls-relevant → eSafety
  if (["harmful_content", "screen_time", "strangers"].includes(concernKey) && !seen.has("esafety")) {
    add("esafety");
  }

  // Balanced/guided independence → EU BIK
  if (isBalanced && !seen.has("eu_bik")) add("eu_bik");

  // HMD Better Phone Project — show for any HMD path where Fuse/X1 isn't shown
  if (!seen.has("hmd_better_phone_project") && pathKey === "flexible") {
    add("hmd_better_phone_project");
  }

  // First smartphone → always include HMD Better Phone Project for context
  if (isFirstSmartphone === true && !seen.has("hmd_better_phone_project")) {
    add("hmd_better_phone_project");
  }

  return { challengeEvidence, comparisonEvidence, productEvidence, all };
}
