package module2;

import java.util.*;

/**
 * LCP Array Construction using Kasai's Algorithm
 * SmartCityX Use Case: Identify common service descriptions across
 * city documents, find longest shared substrings between reports,
 * and measure document similarity using LCP statistics.
 *
 * Time Complexity:  O(N) for LCP construction after SA is built
 * Space Complexity: O(N)
 */
public class LCPKasai {

    private String text;
    private int[]  sa;
    private int[]  rank;
    private int[]  lcp;
    private int    n;

    public LCPKasai(String text) {
        this.text = text;
        this.n    = text.length();
        this.sa   = buildSA(text);
        this.rank = buildRank(sa, n);
        this.lcp  = kasai(text, sa, rank);
    }

    /** Simple O(N log N) suffix array builder. */
    private int[] buildSA(String s) {
        int n = s.length();
        Integer[] idx = new Integer[n];
        int[] r = new int[n], tmp = new int[n];
        for (int i = 0; i < n; i++) { idx[i] = i; r[i] = s.charAt(i); }

        for (int gap = 1; gap < n; gap <<= 1) {
            final int g = gap;
            final int[] rr = r.clone();
            Comparator<Integer> cmp = (a, b) -> {
                if (rr[a] != rr[b]) return rr[a] - rr[b];
                int ra = a + g < n ? rr[a + g] : -1;
                int rb = b + g < n ? rr[b + g] : -1;
                return ra - rb;
            };
            Arrays.sort(idx, cmp);
            tmp[idx[0]] = 0;
            for (int i = 1; i < n; i++)
                tmp[idx[i]] = tmp[idx[i-1]] + (cmp.compare(idx[i], idx[i-1]) != 0 ? 1 : 0);
            r = tmp.clone();
            if (r[idx[n-1]] == n - 1) break;
        }
        int[] sa = new int[n];
        for (int i = 0; i < n; i++) sa[i] = idx[i];
        return sa;
    }

    private int[] buildRank(int[] sa, int n) {
        int[] rank = new int[n];
        for (int i = 0; i < n; i++) rank[sa[i]] = i;
        return rank;
    }

    /**
     * Kasai's algorithm to compute LCP array in O(N).
     * LCP[i] = length of longest common prefix between sa[i] and sa[i-1].
     */
    private int[] kasai(String s, int[] sa, int[] rank) {
        int n = s.length();
        int[] lcp = new int[n];
        int h = 0;
        for (int i = 0; i < n; i++) {
            if (rank[i] > 0) {
                int j = sa[rank[i] - 1];
                while (i + h < n && j + h < n && s.charAt(i + h) == s.charAt(j + h)) h++;
                lcp[rank[i]] = h;
                if (h > 0) h--;
            }
        }
        return lcp;
    }

    public int[] getLCP() { return lcp; }
    public int[] getSA()  { return sa;  }

    /**
     * Find the longest common substring between two documents.
     * Uses combined text: doc1 + '#' + doc2 and LCP array.
     */
    public static String longestCommonSubstring(String doc1, String doc2) {
        String combined = doc1 + "#" + doc2;
        LCPKasai lk = new LCPKasai(combined);
        int sep = doc1.length();
        int maxLen = 0, maxPos = 0;

        for (int i = 1; i < combined.length(); i++) {
            int a = lk.sa[i - 1], b = lk.sa[i];
            // One suffix from doc1, other from doc2
            if ((a < sep) != (b < sep)) {
                if (lk.lcp[i] > maxLen) {
                    maxLen = lk.lcp[i];
                    maxPos = lk.sa[i];
                }
            }
        }
        return maxLen > 0 ? combined.substring(maxPos, maxPos + maxLen) : "";
    }

    /**
     * Compute average LCP as a document similarity measure.
     * Higher average LCP = more shared content.
     */
    public static double documentSimilarity(String doc1, String doc2) {
        String combined = doc1 + "#" + doc2;
        LCPKasai lk = new LCPKasai(combined);
        int sep = doc1.length();
        long totalLcp = 0; int count = 0;

        for (int i = 1; i < combined.length(); i++) {
            int a = lk.sa[i - 1], b = lk.sa[i];
            if ((a < sep) != (b < sep)) {
                totalLcp += lk.lcp[i];
                count++;
            }
        }
        return count > 0 ? (double) totalLcp / count : 0.0;
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== LCP / Kasai – SmartCityX Demo ===\n");

        // Test 1: LCP array for city document
        String doc = "road repair road inspection road closure";
        LCPKasai lk = new LCPKasai(doc);
        System.out.println("Document: \"" + doc + "\"");
        System.out.println("\nSuffix Array and LCP:");
        System.out.printf("%-5s %-5s %-5s %s%n", "i", "SA", "LCP", "Suffix");
        int[] sa = lk.getSA(), lcpArr = lk.getLCP();
        for (int i = 0; i < doc.length(); i++) {
            String suf = doc.substring(sa[i]);
            if (suf.length() > 30) suf = suf.substring(0, 30) + "...";
            System.out.printf("%-5d %-5d %-5d %s%n", i, sa[i], lcpArr[i], suf);
        }
        System.out.println();

        // Test 2: Longest common substring between two city reports
        String report1 = "water pipeline maintenance in zone-A scheduled for tuesday";
        String report2 = "emergency water pipeline repair in zone-B completed monday";
        String lcs = longestCommonSubstring(report1, report2);
        System.out.println("Report 1: \"" + report1 + "\"");
        System.out.println("Report 2: \"" + report2 + "\"");
        System.out.println("Longest Common Substring: \"" + lcs + "\" (length=" + lcs.length() + ")");
        System.out.println();

        // Test 3: Document similarity scores
        String infra1 = "electricity grid maintenance zone-A power outage resolved";
        String infra2 = "electricity grid failure zone-B power restoration ongoing";
        String infra3 = "road pothole repair sector-5 highway maintenance";
        System.out.println("Similarity (infra1 vs infra2): " +
            String.format("%.2f", documentSimilarity(infra1, infra2)) + " (high - related docs)");
        System.out.println("Similarity (infra1 vs infra3): " +
            String.format("%.2f", documentSimilarity(infra1, infra3)) + " (low - unrelated docs)");
        System.out.println();

        // Test 4: Common service descriptions
        String svc1 = "pothole repair request filed by citizen in sector-3";
        String svc2 = "pothole repair completed by maintenance team sector-3";
        System.out.println("Service Doc 1: \"" + svc1 + "\"");
        System.out.println("Service Doc 2: \"" + svc2 + "\"");
        System.out.println("LCS: \"" + longestCommonSubstring(svc1, svc2) + "\"");
    }
}
