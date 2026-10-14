package module3;

import java.util.*;

/**
 * DP on Subsets (SOS – Sum over Subsets DP)
 * SmartCityX Use Case: Evaluate all subsets of city resources/zones to
 * find optimal combinations. SOS DP computes, for every subset S,
 * the aggregate value over all its subsets efficiently.
 *
 * Also includes: Subset Knapsack for city resource selection.
 *
 * Time Complexity:  O(N * 2^N) for SOS DP
 * Space Complexity: O(2^N)
 */
public class SubsetDP {

    // ---------------------------------------------------------------
    // 1. SOS DP (Sum over Subsets)
    // f[mask] = sum of values for all subsets of mask
    // ---------------------------------------------------------------

    /**
     * Compute SOS: for each mask, sum of values[submask]
     * for all submasks of mask (including 0 and mask itself).
     *
     * @param values  values[mask] = value associated with that exact subset
     * @param n       number of elements (bits)
     * @return        dp[mask] = sum of values over all subsets of mask
     */
    public static long[] sosDP(int[] values, int n) {
        long[] dp = new long[1 << n];
        for (int i = 0; i < (1 << n); i++) dp[i] = values[i];

        for (int i = 0; i < n; i++) {
            for (int mask = 0; mask < (1 << n); mask++) {
                if ((mask & (1 << i)) != 0) {
                    dp[mask] += dp[mask ^ (1 << i)];
                }
            }
        }
        return dp;
    }

    // ---------------------------------------------------------------
    // 2. Subset Knapsack (0/1 knapsack using subset enumeration)
    // Select city resources to maximize total service coverage
    // without exceeding capacity.
    // ---------------------------------------------------------------

    public static int subsetKnapsack(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int maxVal = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            int totalW = 0, totalV = 0;
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    totalW += weights[i];
                    totalV += values[i];
                }
            }
            if (totalW <= capacity) maxVal = Math.max(maxVal, totalV);
        }
        return maxVal;
    }

    // ---------------------------------------------------------------
    // 3. Minimum City Coverage using Subset DP
    // dp[mask] = min resources to cover the zones represented by mask
    // ---------------------------------------------------------------

    /**
     * For each subset of zones, compute the minimum cost to cover it
     * using available resources.
     *
     * @param resCoverage  resCoverage[i] = bitmask of zones resource i covers
     * @param resCost      resCost[i] = cost to deploy resource i
     * @param numZones     total zones
     * @return dp[fullMask] = minimum cost to cover all zones
     */
    public static int minCostCoverDP(int[] resCoverage, int[] resCost, int numZones) {
        int total = 1 << numZones;
        int[] dp = new int[total];
        Arrays.fill(dp, Integer.MAX_VALUE / 2);
        dp[0] = 0;

        for (int mask = 0; mask < total; mask++) {
            if (dp[mask] == Integer.MAX_VALUE / 2) continue;
            for (int r = 0; r < resCoverage.length; r++) {
                int newMask = mask | resCoverage[r];
                dp[newMask] = Math.min(dp[newMask], dp[mask] + resCost[r]);
            }
        }
        return dp[total - 1];
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== Subset DP – SmartCityX Demo ===\n");

        // Test 1: SOS DP – Aggregate IoT sensor signal values over zone subsets
        System.out.println("--- SOS DP: Aggregate Sensor Signals across Zone Subsets ---");
        int n = 3; // 3 city zones: Zone-A (bit0), Zone-B (bit1), Zone-C (bit2)
        String[] zoneNames = {"Zone-A", "Zone-B", "Zone-C"};
        // Raw alert scores for each zone combination
        int[] alertScores = {0, 5, 3, 2, 7, 1, 4, 6}; // index = bitmask
        System.out.println("Raw alert scores per zone combination:");
        for (int mask = 0; mask < (1 << n); mask++) {
            List<String> active = new ArrayList<>();
            for (int i = 0; i < n; i++) if ((mask & (1 << i)) != 0) active.add(zoneNames[i]);
            System.out.printf("  Mask %s (%s): %d%n",
                String.format("%3s", Integer.toBinaryString(mask)).replace(' ', '0'),
                active.isEmpty() ? "none" : active.toString(), alertScores[mask]);
        }
        long[] sos = sosDP(alertScores, n);
        System.out.println("\nSOS DP Result (sum over all subsets):");
        for (int mask = 0; mask < (1 << n); mask++) {
            List<String> active = new ArrayList<>();
            for (int i = 0; i < n; i++) if ((mask & (1 << i)) != 0) active.add(zoneNames[i]);
            System.out.printf("  Mask %s (%s): %d%n",
                String.format("%3s", Integer.toBinaryString(mask)).replace(' ', '0'),
                active.isEmpty() ? "none" : active.toString(), sos[mask]);
        }
        System.out.println();

        // Test 2: Subset Knapsack – City resource selection within vehicle capacity
        System.out.println("--- Subset Knapsack: Deploy Resources within Vehicle Capacity ---");
        String[] resources  = {"Medical Kit", "Fire Extinguisher", "Water Pump", "Generator", "Rescue Rope"};
        int[] weights2      = {3, 5, 4, 2, 1};  // equipment weight (units)
        int[] serviceValues = {4, 5, 3, 7, 2};  // service impact score
        int capacity        = 10;
        System.out.printf("  %-20s %-8s %-8s%n", "Resource", "Weight", "Value");
        for (int i = 0; i < resources.length; i++)
            System.out.printf("  %-20s %-8d %-8d%n", resources[i], weights2[i], serviceValues[i]);
        System.out.println("Vehicle Capacity: " + capacity + " units");
        int maxSvc = subsetKnapsack(weights2, serviceValues, capacity);
        System.out.println("Maximum service value achievable: " + maxSvc);
        System.out.println();

        // Test 3: Minimum cost to cover all emergency zones
        System.out.println("--- Minimum Cost Zone Coverage ---");
        String[] resNames = {"Unit-A", "Unit-B", "Unit-C", "Unit-D"};
        // Zone coverage bitmasks (4 zones):
        // Unit-A covers zones 0,1      → 0b0011 = 3
        // Unit-B covers zones 1,2,3    → 0b1110 = 14
        // Unit-C covers zones 0,2      → 0b0101 = 5
        // Unit-D covers zones 2,3      → 0b1100 = 12
        int[] resCoverage = {3, 14, 5, 12};
        int[] resCost     = {20, 30, 15, 25};
        System.out.println("Emergency Zones: 4 (Zone-0 to Zone-3)");
        System.out.printf("  %-10s %-15s %-8s%n", "Resource", "Zones Covered", "Cost");
        for (int i = 0; i < resNames.length; i++)
            System.out.printf("  %-10s %-15s %-8d%n", resNames[i],
                Integer.toBinaryString(resCoverage[i]), resCost[i]);
        int minCost = minCostCoverDP(resCoverage, resCost, 4);
        System.out.println("Minimum cost to cover all zones: " + minCost);
        System.out.println();

        // Test 4: Enumerate subsets for viva demonstration
        System.out.println("--- All Subsets of 3 City Zones (Enumeration Demo) ---");
        for (int mask = 0; mask < (1 << n); mask++) {
            List<String> active = new ArrayList<>();
            for (int i = 0; i < n; i++) if ((mask & (1 << i)) != 0) active.add(zoneNames[i]);
            System.out.println("  Subset " + mask + ": " + (active.isEmpty() ? "{}" : active));
        }
    }
}
