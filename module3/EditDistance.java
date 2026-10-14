package module3;

/**
 * Edit Distance Algorithms
 * SmartCityX Use Case: Correct misspelled citizen queries (e.g., "emrgency" → "emergency"),
 * fuzzy-match service request descriptions, and auto-correct infrastructure codes.
 *
 * Implemented:
 *   1. Levenshtein Distance (Wagner-Fischer DP)
 *   2. Damerau-Levenshtein Distance (includes transpositions)
 *
 * Time Complexity:  O(N * M) for both
 * Space Complexity: O(N * M) full table, O(M) optimized
 */
public class EditDistance {

    // ---------------------------------------------------------------
    // 1. Levenshtein Distance (insert, delete, replace)
    // ---------------------------------------------------------------

    /**
     * Standard Wagner-Fischer DP for Levenshtein distance.
     * Returns the minimum edits (insert/delete/replace) to transform s1 → s2.
     */
    public static int levenshtein(String s1, String s2) {
        int n = s1.length(), m = s2.length();
        int[][] dp = new int[n + 1][m + 1];

        // Base cases
        for (int i = 0; i <= n; i++) dp[i][0] = i;
        for (int j = 0; j <= m; j++) dp[0][j] = j;

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,          // delete
                    Math.min(
                        dp[i][j - 1] + 1,      // insert
                        dp[i - 1][j - 1] + cost // replace
                    )
                );
            }
        }
        return dp[n][m];
    }

    /**
     * Space-optimized Levenshtein using two rows only.
     */
    public static int levenshteinOptimized(String s1, String s2) {
        int n = s1.length(), m = s2.length();
        int[] prev = new int[m + 1], curr = new int[m + 1];
        for (int j = 0; j <= m; j++) prev[j] = j;
        for (int i = 1; i <= n; i++) {
            curr[0] = i;
            for (int j = 1; j <= m; j++) {
                int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                curr[j] = Math.min(prev[j] + 1,
                          Math.min(curr[j - 1] + 1, prev[j - 1] + cost));
            }
            int[] tmp = prev; prev = curr; curr = tmp;
        }
        return prev[m];
    }

    // ---------------------------------------------------------------
    // 2. Damerau-Levenshtein Distance (insert, delete, replace, transpose)
    // ---------------------------------------------------------------

    /**
     * Damerau-Levenshtein with transposition support.
     * Useful for catching "serivce" → "service" type typos (adjacent swap).
     */
    public static int damerauLevenshtein(String s1, String s2) {
        int n = s1.length(), m = s2.length();
        int[][] dp = new int[n + 2][m + 2];
        int maxDist = n + m;

        dp[0][0] = maxDist;
        for (int i = 0; i <= n; i++) { dp[i + 1][0] = maxDist; dp[i + 1][1] = i; }
        for (int j = 0; j <= m; j++) { dp[0][j + 1] = maxDist; dp[1][j + 1] = j; }

        int[] da = new int[256];

        for (int i = 1; i <= n; i++) {
            int db = 0;
            for (int j = 1; j <= m; j++) {
                int i1 = da[s2.charAt(j - 1)];
                int j1 = db;
                int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                if (cost == 0) db = j;
                dp[i + 1][j + 1] = Math.min(
                    dp[i][j] + cost,
                    Math.min(
                        Math.min(dp[i + 1][j] + 1, dp[i][j + 1] + 1),
                        dp[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1) // transposition
                    )
                );
            }
            da[s1.charAt(i - 1)] = i;
        }
        return dp[n + 1][m + 1];
    }

    /**
     * Suggest closest match from a dictionary of city terms.
     */
    public static String autocorrect(String query, String[] dictionary) {
        String best = dictionary[0];
        int bestDist = Integer.MAX_VALUE;
        for (String term : dictionary) {
            int dist = levenshtein(query.toLowerCase(), term.toLowerCase());
            if (dist < bestDist) {
                bestDist = dist;
                best = term;
            }
        }
        return best;
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== Edit Distance – SmartCityX Demo ===\n");

        // Test 1: Citizen query correction
        System.out.println("--- Levenshtein Distance ---");
        String[][] pairs = {
            {"emrgency", "emergency"},
            {"watter", "water"},
            {"serivce", "service"},
            {"potholee", "pothole"},
            {"infastructure", "infrastructure"}
        };
        for (String[] p : pairs) {
            int dist = levenshtein(p[0], p[1]);
            System.out.printf("  %-20s -> %-20s  dist=%d%n", p[0], p[1], dist);
        }
        System.out.println();

        // Test 2: Damerau-Levenshtein catches transpositions better
        System.out.println("--- Damerau-Levenshtein vs Levenshtein ---");
        String[][] transpositions = {
            {"serivce",  "service"},   // swap r,i,v,c,e
            {"trafic",   "traffic"},
            {"fireman",  "firemna"},
        };
        System.out.printf("  %-15s %-15s %-12s %-12s%n",
            "Query", "Correct", "Levenshtein", "Damerau-Lev");
        for (String[] p : transpositions) {
            System.out.printf("  %-15s %-15s %-12d %-12d%n",
                p[0], p[1], levenshtein(p[0], p[1]), damerauLevenshtein(p[0], p[1]));
        }
        System.out.println();

        // Test 3: Autocorrect for city service portal
        String[] cityTerms = {
            "water", "electricity", "road", "pothole", "drainage",
            "emergency", "fire", "garbage", "signal", "infrastructure"
        };
        String[] misspelled = {"wateer", "elctricity", "rooad", "emrgency", "garbaeg"};
        System.out.println("--- City Service Portal Autocorrect ---");
        for (String q : misspelled) {
            String suggestion = autocorrect(q, cityTerms);
            System.out.printf("  User typed: %-18s -> Suggestion: %s%n", "\"" + q + "\"", suggestion);
        }
        System.out.println();

        // Test 4: Space-optimized vs standard comparison
        System.out.println("--- Space-Optimized Verification ---");
        String s1 = "road maintenance request sector5";
        String s2 = "road repair request in sector5";
        System.out.println("String 1: \"" + s1 + "\"");
        System.out.println("String 2: \"" + s2 + "\"");
        System.out.println("Standard Levenshtein  : " + levenshtein(s1, s2));
        System.out.println("Optimized Levenshtein : " + levenshteinOptimized(s1, s2));
        System.out.println("(Both should match)");
    }
}
