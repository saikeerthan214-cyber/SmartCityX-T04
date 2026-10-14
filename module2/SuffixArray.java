package module2;

import java.util.*;

/**
 * Suffix Array (O(N log N) construction using prefix doubling)
 * SmartCityX Use Case: Index city reports and infrastructure documents
 * for fast substring search and document similarity analysis.
 *
 * Time Complexity:  O(N log N) build, O(M log N) search
 * Space Complexity: O(N)
 */
public class SuffixArray {

    private String text;
    private int[]  sa;   // suffix array
    private int    n;

    public SuffixArray(String text) {
        this.text = text;
        this.n    = text.length();
        this.sa   = build(text);
    }

    /** Build suffix array using prefix-doubling (O(N log N)). */
    private int[] build(String s) {
        int n = s.length();
        Integer[] idx = new Integer[n];
        int[] rank    = new int[n];
        int[] tmp     = new int[n];

        for (int i = 0; i < n; i++) { idx[i] = i; rank[i] = s.charAt(i); }

        for (int gap = 1; gap < n; gap <<= 1) {
            final int g = gap;
            final int[] r = rank.clone();

            Comparator<Integer> cmp = (a, b) -> {
                if (r[a] != r[b]) return r[a] - r[b];
                int ra = a + g < n ? r[a + g] : -1;
                int rb = b + g < n ? r[b + g] : -1;
                return ra - rb;
            };

            Arrays.sort(idx, cmp);

            tmp[idx[0]] = 0;
            for (int i = 1; i < n; i++) {
                tmp[idx[i]] = tmp[idx[i - 1]] + (cmp.compare(idx[i], idx[i - 1]) != 0 ? 1 : 0);
            }
            rank = tmp.clone();
            if (rank[idx[n - 1]] == n - 1) break;
        }

        int[] sa = new int[n];
        for (int i = 0; i < n; i++) sa[i] = idx[i];
        return sa;
    }

    public int[] getSuffixArray() { return sa; }

    /**
     * Search for pattern in text using binary search on suffix array.
     * Returns sorted list of starting positions.
     */
    public List<Integer> search(String pattern) {
        List<Integer> result = new ArrayList<>();
        int m = pattern.length();

        // Lower bound
        int lo = 0, hi = n - 1, left = n;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            int cmp = text.substring(sa[mid], Math.min(sa[mid] + m, n)).compareTo(pattern);
            if (cmp < 0) lo = mid + 1;
            else { left = mid; hi = mid - 1; }
        }

        // Upper bound
        lo = 0; hi = n - 1;
        int right = -1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            String sub = text.substring(sa[mid], Math.min(sa[mid] + m, n));
            if (sub.compareTo(pattern) <= 0 &&
                (sa[mid] + m > n || text.substring(sa[mid], sa[mid] + m).equals(pattern) ||
                 !sub.equals(pattern))) {
                // refined approach
                if (sub.equals(pattern)) { right = mid; lo = mid + 1; }
                else lo = mid + 1;
            } else hi = mid - 1;
        }

        for (int i = left; i < n; i++) {
            int end = Math.min(sa[i] + m, n);
            if (text.substring(sa[i], end).equals(pattern)) {
                result.add(sa[i]);
            } else break;
        }
        Collections.sort(result);
        return result;
    }

    /** Print suffix array with suffixes for debugging. */
    public void printSuffixArray() {
        System.out.printf("%-5s %-5s %s%n", "Rank", "Index", "Suffix");
        for (int i = 0; i < n; i++) {
            String suffix = text.substring(sa[i]);
            if (suffix.length() > 40) suffix = suffix.substring(0, 40) + "...";
            System.out.printf("%-5d %-5d %s%n", i, sa[i], suffix);
        }
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== Suffix Array – SmartCityX Demo ===\n");

        // Test 1: Index a city infrastructure report
        String doc = "water supply disruption in zone water pressure low zone alert";
        SuffixArray sa1 = new SuffixArray(doc);
        System.out.println("Document: \"" + doc + "\"");
        System.out.println("\nSuffix Array:");
        sa1.printSuffixArray();
        System.out.println();

        // Test 2: Search for substrings in indexed document
        System.out.println("--- Substring Search ---");
        String[] queries = {"water", "zone", "alert", "fire"};
        for (String q : queries) {
            List<Integer> pos = sa1.search(q);
            System.out.println("Query \"" + q + "\": " +
                (pos.isEmpty() ? "Not found" : "Found at positions " + pos));
        }
        System.out.println();

        // Test 3: Infrastructure document indexing
        String infraDoc = "road repair road maintenance road closure road inspection";
        SuffixArray sa2 = new SuffixArray(infraDoc);
        System.out.println("Infrastructure Doc: \"" + infraDoc + "\"");
        List<Integer> roadPos = sa2.search("road");
        System.out.println("'road' occurrences at: " + roadPos);
        List<Integer> repairPos = sa2.search("repair");
        System.out.println("'repair' occurrences at: " + repairPos);
        System.out.println();

        // Test 4: Citizen complaint document
        String complaint = "pothole on street pothole near school pothole at junction";
        SuffixArray sa3 = new SuffixArray(complaint);
        System.out.println("Complaint Doc: \"" + complaint + "\"");
        List<Integer> potholePos = sa3.search("pothole");
        System.out.println("'pothole' occurrences at: " + potholePos + " (" + potholePos.size() + " times)");
    }
}
