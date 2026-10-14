package module1;

/**
 * Z-Function Algorithm
 * SmartCityX Use Case: Identify repeated patterns in city reports,
 * detect recurring infrastructure issue descriptions, and find
 * duplicate service-request phrases.
 *
 * Time Complexity:  O(N + M)
 * Space Complexity: O(N + M)
 */
public class ZFunction {

    /**
     * Compute the Z-array for a given string s.
     * Z[i] = length of the longest substring starting from s[i]
     *        that is also a prefix of s.
     */
    public static int[] computeZ(String s) {
        int n = s.length();
        int[] z = new int[n];
        z[0] = n; // by convention
        int l = 0, r = 0;
        for (int i = 1; i < n; i++) {
            if (i < r) {
                z[i] = Math.min(r - i, z[i - l]);
            }
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) {
                z[i]++;
            }
            if (i + z[i] > r) {
                l = i;
                r = i + z[i];
            }
        }
        return z;
    }

    /**
     * Find all occurrences of pattern in text using Z-function.
     * Constructs combined string: pattern + '$' + text
     */
    public static java.util.List<Integer> search(String text, String pattern) {
        java.util.List<Integer> matches = new java.util.ArrayList<>();
        String combined = pattern + "$" + text;
        int[] z = computeZ(combined);
        int m = pattern.length();
        for (int i = m + 1; i < combined.length(); i++) {
            if (z[i] == m) {
                matches.add(i - m - 1); // position in original text
            }
        }
        return matches;
    }

    /**
     * Count how many times a repeated phrase appears in a city report.
     */
    public static int countRepetitions(String text, String phrase) {
        return search(text, phrase).size();
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== Z-Function – SmartCityX Demo ===\n");

        // Test 1: Repeated pattern in city infrastructure report
        String report = "pipe burst pipe burst water leak pipe burst detected in zone-C";
        String pattern = "pipe burst";
        java.util.List<Integer> positions = search(report, pattern);
        System.out.println("City Report  : \"" + report + "\"");
        System.out.println("Pattern      : \"" + pattern + "\"");
        System.out.println("Occurrences  : " + positions.size() + " at positions " + positions);
        System.out.println();

        // Test 2: Repeated service description
        String serviceLog = "request pending request pending request closed";
        String keyword = "request pending";
        positions = search(serviceLog, keyword);
        System.out.println("Service Log  : \"" + serviceLog + "\"");
        System.out.println("Keyword      : \"" + keyword + "\"");
        System.out.println("Occurrences  : " + positions.size() + " at positions " + positions);
        System.out.println();

        // Test 3: Z-array inspection for prefix analysis
        String sample = "aabxaab";
        int[] z = computeZ(sample);
        System.out.print("Z-array for \"" + sample + "\": [");
        for (int i = 0; i < z.length; i++) {
            System.out.print(z[i] + (i < z.length - 1 ? ", " : ""));
        }
        System.out.println("]");
        System.out.println("Interpretation: Z[4]=3 means 'aab' at index 4 matches prefix 'aab'");
        System.out.println();

        // Test 4: Emergency keyword repetition detection
        String emergencyFeed = "fire alert fire alert flood warning fire alert issued";
        System.out.println("Emergency Feed: \"" + emergencyFeed + "\"");
        System.out.println("'fire alert' repeated: " + countRepetitions(emergencyFeed, "fire alert") + " times");
        System.out.println("'flood warning' repeated: " + countRepetitions(emergencyFeed, "flood warning") + " times");
    }
}
