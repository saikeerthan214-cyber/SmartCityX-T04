/**
 * SmartCityX Java DSA API Client
 * All algorithm calls go to the Java backend on port 6789.
 */

const BASE = 'http://localhost:6789/api';

// ── Health check ────────────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/health`);
    return r.ok;
  } catch { return false; }
}

// ── Search (KMP / Rabin-Karp / Aho-Corasick) ────────────────────────
export interface SearchResult {
  algorithm: string;
  pattern: string;
  totalMatches: number;
  comparisons: number;
  executionTimeMs: number;
  failureTable?: number[];
  hashCollisions?: number;
  statesVisited?: number;
  matchDetails: { textIndex: number; positions?: number[]; }[];
  matches?: { textIndex: number; keyword: string; position: number; }[];
  error?: string;
}

export async function javaSearch(
  texts: string[],
  pattern: string,
  algorithm: 'kmp' | 'rabin-karp' | 'aho-corasick'
): Promise<SearchResult> {
  const r = await fetch(`${BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, pattern, algorithm }),
  });
  if (!r.ok) throw new Error(`Search API error: ${r.status}`);
  return r.json();
}

// ── Autocorrect (Damerau-Levenshtein) ────────────────────────────────
export interface AutocorrectResult {
  original: string;
  corrected: string;
  changed: boolean;
  editDistance: number;
  algorithm: string;
  error?: string;
}

export async function javaAutocorrect(query: string): Promise<AutocorrectResult> {
  const r = await fetch(`${BASE}/autocorrect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!r.ok) throw new Error(`Autocorrect API error: ${r.status}`);
  return r.json();
}

// ── Resource Optimization (Bitmask DP) ───────────────────────────────
export interface ResourceOptResult {
  selectedIds: string[];
  totalCost: number;
  totalValue: number;
  combinationsEvaluated: number;
  coverageScore: number;
  algorithm: string;
  timeComplexity: string;
  error?: string;
}

export async function javaOptimizeResources(
  resources: { id: string; cost: number; serviceValue: number }[],
  budget: number
): Promise<ResourceOptResult> {
  const r = await fetch(`${BASE}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ budget, resources }),
  });
  if (!r.ok) throw new Error(`Resources API error: ${r.status}`);
  return r.json();
}

// ── Document Similarity (Suffix Array + LCP/Kasai) ──────────────────
export interface SimilarityResult {
  similarityScore: number;
  lcs: string;
  lcsLength: number;
  executionTimeMs: number;
  algorithm: string;
  error?: string;
}

export async function javaSimilarity(docA: string, docB: string): Promise<SimilarityResult> {
  const r = await fetch(`${BASE}/similarity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docA, docB }),
  });
  if (!r.ok) throw new Error(`Similarity API error: ${r.status}`);
  return r.json();
}
