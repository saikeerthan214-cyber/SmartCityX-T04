package module1;

/**
 * KMP (Knuth-Morris-Pratt) Algorithm
 * SmartCityX Use Case: Search for keywords in citizen reports,
 * service request texts, and infrastructure codes.
 *
 * Time Complexity:  O(N + M) where N = text length, M = pattern length
 * Space Complexity: O(M) for the failure function array
 */
public class KMP {

    /**
     * Build the failure function (partial match table) for the pattern.
     */
    private static int[] buildFailure(String pattern) {
        int m = pattern.length();
        int[] fail = new int[m];
        fail[0] = 0;
        int k = 0;
        for (int i = 1; i < m; i++) {
            while (k > 0 && pattern.charAt(k) != pattern.charAt(i)) {
                k = fail[k - 1];
            }
            if (pattern.charAt(k) == pattern.charAt(i)) {
                k++;
            }
            fail[i] = k;
        }
        return fail;
    }

    /**
     * Search for all occurrences of pattern in text.
     * Returns the starting indices of all matches.
     */
    public static java.util.List<Integer> search(String text, String pattern) {
        java.util.List<Integer> matches = new java.util.ArrayList<>();
        if (pattern == null || pattern.isEmpty()) return matches;

        int n = text.length();
        int m = pattern.length();
        int[] fail = buildFailure(pattern);
        int k = 0;

        for (int i = 0; i < n; i++) {
            while (k > 0 && pattern.charAt(k) != text.charAt(i)) {
                k = fail[k - 1];
            }
            if (pattern.charAt(k) == text.charAt(i)) {
                k++;
            }
            if (k == m) {
                matches.add(i - m + 1);
                k = fail[k - 1];
            }
        }
        return matches;
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== KMP – SmartCityX Demo ===\n");

        // Test 1: Citizen report search
        String report = "Road damage reported near sector5. Damage assessment for sector5 pending.";
        String keyword = "sector5";
        java.util.List<Integer> positions = search(report, keyword);
        System.out.println("Citizen Report: \"" + report + "\"");
        System.out.println("Searching for: \"" + keyword + "\"");
        System.out.println("Found at positions: " + positions);
        System.out.println();

        // Test 2: Infrastructure code lookup
        String infraLog = "INF-2024-WATER INF-2024-ROAD INF-2024-WATER INF-2024-ELEC";
        String infraCode = "INF-2024-WATER";
        positions = search(infraLog, infraCode);
        System.out.println("Infrastructure Log: \"" + infraLog + "\"");
        System.out.println("Searching for code: \"" + infraCode + "\"");
        System.out.println("Found at positions: " + positions);
        System.out.println();

        // Test 3: Service request keyword
        String serviceReq = "Emergency water leak in zone-A. Water supply disrupted in zone-A and zone-B.";
        String sKeyword = "water";
        positions = search(serviceReq.toLowerCase(), sKeyword.toLowerCase());
        System.out.println("Service Request: \"" + serviceReq + "\"");
        System.out.println("Searching for: \"" + sKeyword + "\" (case-insensitive)");
        System.out.println("Found at positions: " + positions);
        System.out.println();

        // Test 4: Pattern not found
        String text = "Traffic signal malfunction on main boulevard";
        String pat  = "earthquake";
        positions = search(text, pat);
        System.out.println("Text: \"" + text + "\"");
        System.out.println("Searching for: \"" + pat + "\"");
        System.out.println("Found at positions: " + positions + " (empty = not found)");
    }
}
