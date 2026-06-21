import { buildJobSourceConfig } from "@/lib/jobs/source-config";
import {
  buildSourcePackRows,
  TRUSTED_SOURCE_PACK,
  type TrustedSourceSeed,
} from "@/lib/jobs/trusted-source-pack";

const PUNJAB_LOCATION_KEYWORDS = [
  "punjab",
  "chandigarh",
  "mohali",
  "sas nagar",
  "sahibzada ajit singh nagar",
  "zirakpur",
  "dera bassi",
  "kharar",
  "patiala",
  "amritsar",
  "jalandhar",
  "ludhiana",
  "bathinda",
  "hoshiarpur",
  "kapurthala",
  "moga",
  "pathankot",
  "rajpura",
  "ropar",
  "rupnagar",
  "barnala",
  "faridkot",
  "firozpur",
  "gurdaspur",
  "sangrur",
  "mansa",
  "malerkotla",
  "fazilka",
  "muktsar",
  "tarntaran",
  "nawanshahr",
  "shaheed bhagat singh nagar",
];

const PUNJAB_GOVERNMENT_SOURCES: TrustedSourceSeed[] = [
  {
    name: "PGRKAM Punjab Jobs Portal",
    sourceType: "government-source",
    fetchMethod: "government",
    sourceUrl: "https://www.pgrkam.com/",
    companyName: "Punjab Government Rozgar Generation and Mission",
    industry: "Government Employment Services",
    defaultCity: "Chandigarh",
    defaultState: "Punjab",
    allowAutoFetch: true,
    isActive: true,
    notes:
      "Official Punjab employment portal with public-sector and private-sector opportunities. Review extracted results before publishing.",
  },
  {
    name: "Punjab Subordinate Services Selection Board",
    sourceType: "government-source",
    fetchMethod: "government",
    sourceUrl: "https://sssb.punjab.gov.in/",
    companyName: "Punjab Subordinate Services Selection Board",
    industry: "Government",
    defaultCity: "Mohali",
    defaultState: "Punjab",
    allowAutoFetch: true,
    isActive: true,
    notes: "Official Punjab recruitment board source. Review extracted results before publishing.",
  },
  {
    name: "PSPCL Recruitment",
    sourceType: "government-source",
    fetchMethod: "government",
    sourceUrl: "https://www.pspcl.in/recruitment/",
    companyName: "Punjab State Power Corporation Limited",
    industry: "Power",
    defaultCity: "Patiala",
    defaultState: "Punjab",
    allowAutoFetch: true,
    isActive: true,
    notes: "Official Punjab state power recruitment source. Review extracted results before publishing.",
  },
];

function isPunjabState(value: string) {
  return value.trim().toLowerCase() === "punjab";
}

export const PUNJAB_SOURCE_PACK: TrustedSourceSeed[] = [
  ...TRUSTED_SOURCE_PACK.filter(
    (source) =>
      isPunjabState(source.defaultState) ||
      source.defaultCity.trim().toLowerCase() === "chandigarh",
  ),
  ...PUNJAB_GOVERNMENT_SOURCES,
];

export function buildPunjabSourcePackRows(adminUserId: string) {
  return buildSourcePackRows(adminUserId, PUNJAB_SOURCE_PACK).map((row) => ({
    ...row,
    config: buildJobSourceConfig({
      ...(typeof row.config === "object" && row.config ? row.config : {}),
      coverageRegion: "punjab",
      locationKeywords:
        String(row.source_url).includes("pgrkam") || String(row.source_url).includes("ncs.gov.in")
          ? PUNJAB_LOCATION_KEYWORDS
          : [],
    }),
  }));
}

