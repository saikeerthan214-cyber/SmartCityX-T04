package module1;

/**
 * Rabin-Karp Algorithm
 * SmartCityX Use Case: Search for service identifiers, infrastructure
 * codes, and sensor IDs within large city-log databases using
 * rolling hash for efficient multi-pattern matching.
 *
 * Time Complexity:  O(N + M) average, O(N*M) worst case (hash collisions)
 * Space Complexity: O(1) extra (beyond input)
 */
public class RabinKarp {

    private static final long BASE  = 31L;
    private static final long MOD   = 1_000_000_007L;

    /**
     * Compute hash of a string segment text[start..start+len-1].
     */
    private static long computeHash(String text, int start, int len) {
        long hash = 0;
        long power = 1;
        for (int i = start; i < start + len; i++) {
            hash = (hash + (text.charAt(i) - 'a' + 1) * power) % MOD;
            power = (power * BASE) % MOD;
        }
        return hash;
    }

    /**
     * Search for all occurrences of pattern in text using Rabin-Karp.
     */
    public static java.util.List<Integer> search(String text, String pattern) {
        java.util.List<Integer> matches = new java.util.ArrayList<>();
        int n = text.length();
        int m = pattern.length();
        if (m > n) return matches;

        // Precompute BASE^(m-1) mod MOD
        long highPow = 1;
        for (int i = 0; i < m - 1; i++) {
            highPow = (highPow * BASE) % MOD;
        }

        long patHash  = computeHash(pattern, 0, m);
        long textHash = computeHash(text, 0, m);

        for (int i = 0; i <= n - m; i++) {
            if (textHash == patHash) {
                // Verify character by character to avoid false positives
                if (text.substring(i, i + m).equals(pattern)) {
                    matches.add(i);
                }
            }
            // Roll the hash: remove leftmost char, add next char
            if (i < n - m) {
                textHash = (textHash - (text.charAt(i) - 'a' + 1) + MOD) % MOD;
                textHash = (textHash * modInverse(BASE, MOD)) % MOD;
                textHash = (textHash + (text.charAt(i + m) - 'a' + 1) * highPow) % MOD;
            }
        }
        return matches;
    }

    /**
     * Alternative simpler rolling hash (additive, works well for uppercase/mixed).
     */
    public static java.util.List<Integer> searchGeneral(String text, String pattern) {
        java.util.List<Integer> matches = new java.util.ArrayList<>();
        int n = text.length();
        int m = pattern.length();
        if (m > n) return matches;

        final long BASE2 = 256L;
        final long MOD2  = 101L;

        long patHash  = 0;
        long textHash = 0;
        long h = 1;

        for (int i = 0; i < m - 1; i++) h = (h * BASE2) % MOD2;

        for (int i = 0; i < m; i++) {
            patHash  = (BASE2 * patHash  + pattern.charAt(i)) % MOD2;
            textHash = (BASE2 * textHash + text.charAt(i))    % MOD2;
        }

        for (int i = 0; i <= n - m; i++) {
            if (patHash == textHash) {
                if (text.substring(i, i + m).equals(pattern)) {
                    matches.add(i);
                }
            }
            if (i < n - m) {
                textHash = (BASE2 * (textHash - text.charAt(i) * h + MOD2 * 1000)
                            + text.charAt(i + m)) % MOD2;
                if (textHash < 0) textHash += MOD2;
            }
        }
        return matches;
    }

    private static long modInverse(long a, long mod) {
        return modPow(a, mod - 2, mod);
    }

    private static long modPow(long base, long exp, long mod) {
        long result = 1;
        base %= mod;
        while (exp > 0) {
            if ((exp & 1) == 1) result = result * base % mod;
            base = base * base % mod;
            exp >>= 1;
        }
        return result;
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== Rabin-Karp – SmartCityX Demo ===\n");

        // Test 1: Infrastructure identifier search in logs
        String infraDB = "SVC-ROAD-001 SVC-WATER-002 SVC-ROAD-001 SVC-ELEC-003 SVC-ROAD-001";
        String svcCode = "SVC-ROAD-001";
        java.util.List<Integer> pos = searchGeneral(infraDB, svcCode);
        System.out.println("Infrastructure DB : \"" + infraDB + "\"");
        System.out.println("Searching ID      : \"" + svcCode + "\"");
        System.out.println("Found at positions: " + pos);
        System.out.println();

        // Test 2: Sensor ID tracking in IoT stream
        String iotStream = "SENSOR-42 reading SENSOR-17 alert SENSOR-42 offline SENSOR-42 active";
        String sensorID  = "SENSOR-42";
        pos = searchGeneral(iotStream, sensorID);
        System.out.println("IoT Stream : \"" + iotStream + "\"");
        System.out.println("Sensor ID  : \"" + sensorID + "\"");
        System.out.println("Found at   : " + pos + " (" + pos.size() + " occurrences)");
        System.out.println();

        // Test 3: Emergency service request code
        String requestLog = "REQ-EMG-009 filed. REQ-FLD-012 filed. REQ-EMG-009 escalated.";
        String reqCode    = "REQ-EMG-009";
        pos = searchGeneral(requestLog, reqCode);
        System.out.println("Request Log: \"" + requestLog + "\"");
        System.out.println("Code       : \"" + reqCode + "\"");
        System.out.println("Found at   : " + pos);
        System.out.println();

        // Test 4: Pattern not found
        String text = "Normal city operations running smoothly today";
        String pat  = "EMERGENCY";
        pos = searchGeneral(text, pat);
        System.out.println("Text   : \"" + text + "\"");
        System.out.println("Pattern: \"" + pat + "\"");
        System.out.println("Result : " + (pos.isEmpty() ? "Not found" : pos));
    }
}
