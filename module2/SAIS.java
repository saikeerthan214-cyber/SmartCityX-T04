package module2;

import java.util.*;

/**
 * SA-IS (Suffix Array Induced Sorting) – Linear Time O(N)
 * SmartCityX Use Case: Large-scale city-document indexing where O(N log N)
 * suffix array construction is too slow for massive infrastructure logs.
 *
 * Time Complexity:  O(N) build
 * Space Complexity: O(N)
 */
public class SAIS {

    /**
     * Build suffix array using SA-IS algorithm.
     * Input: integer array s with s[n-1] = 0 (sentinel, smallest value)
     */
    public static int[] buildSA(int[] s, int alphabetSize) {
        int n = s.length;
        int[] sa = new int[n];

        if (n == 1) { sa[0] = 0; return sa; }
        if (n == 2) {
            sa[0] = 1; sa[1] = 0; return sa;
        }

        // Classify S/L types
        boolean[] isS = new boolean[n];
        isS[n - 1] = true;
        for (int i = n - 2; i >= 0; i--) {
            isS[i] = s[i] < s[i + 1] || (s[i] == s[i + 1] && isS[i + 1]);
        }

        // LMS positions
        List<Integer> lms = new ArrayList<>();
        for (int i = 1; i < n; i++) {
            if (isS[i] && !isS[i - 1]) lms.add(i);
        }

        // Bucket sizes
        int[] buckets = new int[alphabetSize];
        for (int c : s) buckets[c]++;

        // Induced sort
        inducedSort(s, sa, isS, buckets, lms, alphabetSize);

        // Compact LMS suffixes
        int[] sorted_lms = Arrays.stream(sa)
            .filter(i -> i > 0 && isS[i] && !isS[i - 1])
            .toArray();

        // Name LMS substrings
        int[] name = new int[n];
        Arrays.fill(name, -1);
        int prev = -1, cur_name = 0;
        for (int suf : sorted_lms) {
            if (prev != -1 && !lmsEqual(s, isS, prev, suf)) cur_name++;
            name[suf] = cur_name;
            prev = suf;
        }
        cur_name++;

        if (cur_name < lms.size()) {
            // Recurse
            int[] s1 = new int[lms.size()];
            int[] lmsArr = lms.stream().mapToInt(x -> x).toArray();
            for (int i = 0; i < lmsArr.length; i++) s1[i] = name[lmsArr[i]];
            int[] sa1 = buildSA(s1, cur_name);
            // Reorder lms
            List<Integer> newLms = new ArrayList<>();
            for (int i : sa1) newLms.add(lms.get(i));
            inducedSort(s, sa, isS, buckets, newLms, alphabetSize);
        }

        return sa;
    }

    private static void inducedSort(int[] s, int[] sa, boolean[] isS,
                                     int[] buckets, List<Integer> lms, int alphaSize) {
        int n = s.length;
        Arrays.fill(sa, -1);

        int[] bkt = buckets.clone();
        int[] ends = new int[alphaSize];
        int sum = 0;
        for (int i = 0; i < alphaSize; i++) { sum += bkt[i]; ends[i] = sum - 1; }

        // Place LMS suffixes at end of buckets
        for (int i = lms.size() - 1; i >= 0; i--) {
            int suf = lms.get(i);
            sa[ends[s[suf]]--] = suf;
        }

        // Induce L-type
        int[] heads = new int[alphaSize];
        sum = 0;
        for (int i = 0; i < alphaSize; i++) { heads[i] = sum; sum += buckets[i]; }
        for (int i = 0; i < n; i++) {
            if (sa[i] > 0 && !isS[sa[i] - 1]) {
                sa[heads[s[sa[i] - 1]]++] = sa[i] - 1;
            }
        }

        // Induce S-type
        sum = 0;
        for (int i = 0; i < alphaSize; i++) { sum += buckets[i]; ends[i] = sum - 1; }
        for (int i = n - 1; i >= 0; i--) {
            if (sa[i] > 0 && isS[sa[i] - 1]) {
                sa[ends[s[sa[i] - 1]]--] = sa[i] - 1;
            }
        }
    }

    private static boolean lmsEqual(int[] s, boolean[] isS, int a, int b) {
        for (int i = 0; ; i++) {
            boolean aLms = i > 0 && isS[a + i] && !isS[a + i - 1];
            boolean bLms = i > 0 && isS[b + i] && !isS[b + i - 1];
            if (i > 0 && aLms && bLms) return true;
            if (aLms != bLms || s[a + i] != s[b + i]) return false;
        }
    }

    /**
     * Convenience: Build suffix array directly from a String.
     */
    public static int[] buildFromString(String text) {
        int n = text.length();
        int[] s = new int[n + 1];
        for (int i = 0; i < n; i++) s[i] = text.charAt(i);
        s[n] = 0; // sentinel
        return Arrays.copyOf(buildSA(s, 256), n + 1);
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== SA-IS (Linear Suffix Array) – SmartCityX Demo ===\n");

        // Test 1: Large city document indexing
        String cityDoc = "infrastructure maintenance road repair water supply electricity grid";
        int[] sa = buildFromString(cityDoc);
        System.out.println("City Document: \"" + cityDoc + "\"");
        System.out.println("Suffix Array (first 10 entries):");
        System.out.printf("%-5s %-5s %s%n", "Rank", "SA[i]", "Suffix (preview)");
        for (int i = 0; i < Math.min(10, sa.length); i++) {
            if (sa[i] < cityDoc.length()) {
                String suffix = cityDoc.substring(sa[i]);
                if (suffix.length() > 35) suffix = suffix.substring(0, 35) + "...";
                System.out.printf("%-5d %-5d %s%n", i, sa[i], suffix);
            }
        }
        System.out.println();

        // Test 2: Verify SA-IS matches standard sort on a small example
        String simple = "banana";
        int[] saSAIS = buildFromString(simple);
        System.out.println("SA-IS on \"" + simple + "\":");
        System.out.print("SA = [");
        for (int i = 0; i < simple.length(); i++) {
            System.out.print(saSAIS[i] + (i < simple.length() - 1 ? ", " : ""));
        }
        System.out.println("]");
        System.out.println("Suffixes in sorted order:");
        for (int i = 0; i <= simple.length(); i++) {
            if (saSAIS[i] < simple.length())
                System.out.println("  " + saSAIS[i] + ": " + simple.substring(saSAIS[i]));
        }
        System.out.println();

        // Test 3: IoT sensor log (longer document)
        String iotLog = "sensor alert zone sensor warning zone sensor normal zone sensor alert region";
        int[] saIoT = buildFromString(iotLog);
        System.out.println("IoT Log: \"" + iotLog + "\"");
        System.out.println("SA-IS built successfully. Total suffixes indexed: " + iotLog.length());
        System.out.println("First suffix in lexicographic order starts at index: " + saIoT[1]);
        System.out.println("  -> \"" + iotLog.substring(saIoT[1], Math.min(saIoT[1] + 25, iotLog.length())) + "...\"");
    }
}
