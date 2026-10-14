package module3;

import java.util.*;

/**
 * Bitmask DP
 * SmartCityX Use Case: Evaluate all combinations of city resources
 * (ambulances, fire trucks, water tankers, repair crews) to find
 * the optimal allocation that covers maximum emergency zones
 * within a budget/capacity constraint.
 *
 * Time Complexity:  O(2^N * N)
 * Space Complexity: O(2^N)
 */
public class BitmaskDP {

    // ---------------------------------------------------------------
    // Problem 1: Maximum Emergency Zone Coverage
    // Given N resources and M zones, each resource covers some zones.
    // Find minimum number of resources to cover all zones.
    // ---------------------------------------------------------------

    /**
     * Minimum number of resources to cover all emergency zones.
     *
     * @param coverage  coverage[i] = bitmask of zones resource i covers
     * @param numZones  total number of emergency zones
     * @return minimum number of resources needed (-1 if impossible)
     */
    public static int minResourcesToCoverAllZones(int[] coverage, int numZones) {
        int totalMasks = 1 << numZones;
        int[] dp = new int[totalMasks];
        Arrays.fill(dp, Integer.MAX_VALUE / 2);
        dp[0] = 0;

        for (int mask = 0; mask < totalMasks; mask++) {
            if (dp[mask] == Integer.MAX_VALUE / 2) continue;
            for (int res = 0; res < coverage.length; res++) {
                int newMask = mask | coverage[res];
                dp[newMask] = Math.min(dp[newMask], dp[mask] + 1);
            }
        }
        int full = totalMasks - 1;
        return dp[full] == Integer.MAX_VALUE / 2 ? -1 : dp[full];
    }

    // ---------------------------------------------------------------
    // Problem 2: Max Value Resource Selection within Budget
    // Given N city resources with cost and value, select subset
    // with total cost <= budget that maximizes total service value.
    // ---------------------------------------------------------------

    /**
     * Select best combination of city resources within budget.
     *
     * @param costs   cost[i] = deployment cost of resource i
     * @param values  value[i] = service value of resource i
     * @param budget  maximum total deployment cost
     * @return maximum total service value achievable
     */
    public static int maxValueWithinBudget(int[] costs, int[] values, int budget) {
        int n = costs.length;
        int totalMasks = 1 << n;
        int maxVal = 0;
        int bestMask = 0;

        for (int mask = 0; mask < totalMasks; mask++) {
            int totalCost = 0, totalValue = 0;
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    totalCost  += costs[i];
                    totalValue += values[i];
                }
            }
            if (totalCost <= budget && totalValue > maxVal) {
                maxVal = totalValue;
                bestMask = mask;
            }
        }
        return maxVal;
    }

    /**
     * Returns the actual best resource subset mask.
     */
    public static int bestSubsetMask(int[] costs, int[] values, int budget) {
        int n = costs.length;
        int totalMasks = 1 << n;
        int maxVal = 0, bestMask = 0;
        for (int mask = 0; mask < totalMasks; mask++) {
            int tc = 0, tv = 0;
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) { tc += costs[i]; tv += values[i]; }
            }
            if (tc <= budget && tv > maxVal) { maxVal = tv; bestMask = mask; }
        }
        return bestMask;
    }

    // ---------------------------------------------------------------
    // Problem 3: Travelling Repairman (TSP-style) for city sectors
    // Find minimum cost tour visiting all N damaged sectors exactly once.
    // ---------------------------------------------------------------

    /**
     * TSP Bitmask DP: Minimum travel cost to visit all damaged city sectors.
     *
     * @param dist  dist[i][j] = travel cost from sector i to sector j
     * @return minimum tour cost starting and ending at sector 0
     */
    public static int minTravelCostTSP(int[][] dist) {
        int n = dist.length;
        int fullMask = (1 << n) - 1;
        int[][] dp = new int[1 << n][n];
        for (int[] row : dp) Arrays.fill(row, Integer.MAX_VALUE / 2);
        dp[1][0] = 0; // start at sector 0, visited = {0}

        for (int mask = 1; mask <= fullMask; mask++) {
            for (int u = 0; u < n; u++) {
                if ((mask & (1 << u)) == 0) continue;
                if (dp[mask][u] == Integer.MAX_VALUE / 2) continue;
                for (int v = 0; v < n; v++) {
                    if ((mask & (1 << v)) != 0) continue;
                    int newMask = mask | (1 << v);
                    dp[newMask][v] = Math.min(dp[newMask][v], dp[mask][u] + dist[u][v]);
                }
            }
        }

        int result = Integer.MAX_VALUE;
        for (int u = 1; u < n; u++) {
            result = Math.min(result, dp[fullMask][u] + dist[u][0]);
        }
        return result;
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== Bitmask DP – SmartCityX Demo ===\n");

        // Test 1: Minimum resources to cover all emergency zones
        System.out.println("--- Problem 1: Emergency Zone Coverage ---");
        // 4 zones (bits 0-3), 5 resources
        // Resource 0: covers zones 0,1       → 0b0011 = 3
        // Resource 1: covers zones 2,3       → 0b1100 = 12
        // Resource 2: covers zones 1,2       → 0b0110 = 6
        // Resource 3: covers all zones       → 0b1111 = 15
        // Resource 4: covers zones 0,3       → 0b1001 = 9
        int[] coverage = {3, 12, 6, 15, 9};
        int numZones = 4;
        System.out.println("Emergency zones: 4 (Zone-A, Zone-B, Zone-C, Zone-D)");
        System.out.println("Resources available: " + coverage.length);
        int minRes = minResourcesToCoverAllZones(coverage, numZones);
        System.out.println("Minimum resources to cover all zones: " + minRes);
        System.out.println();

        // Test 2: Optimal resource deployment within budget
        System.out.println("--- Problem 2: Resource Allocation within Budget ---");
        String[] resourceNames = {"Ambulance", "Fire Truck", "Water Tanker", "Repair Crew", "Police Unit"};
        int[] costs  = {40, 60, 30, 20, 50};
        int[] values = {70, 90, 50, 40, 80};
        int budget = 100;
        System.out.println("City Emergency Resources:");
        System.out.printf("  %-15s %-8s %-8s%n", "Resource", "Cost", "Value");
        for (int i = 0; i < resourceNames.length; i++)
            System.out.printf("  %-15s %-8d %-8d%n", resourceNames[i], costs[i], values[i]);
        System.out.println("Budget: " + budget);
        int maxVal = maxValueWithinBudget(costs, values, budget);
        int mask   = bestSubsetMask(costs, values, budget);
        System.out.println("Maximum service value: " + maxVal);
        System.out.print("Best resource combination: ");
        int totalCost = 0;
        List<String> chosen = new ArrayList<>();
        for (int i = 0; i < resourceNames.length; i++) {
            if ((mask & (1 << i)) != 0) { chosen.add(resourceNames[i]); totalCost += costs[i]; }
        }
        System.out.println(chosen + " (total cost=" + totalCost + ")");
        System.out.println();

        // Test 3: Minimum travel cost for repair crew visiting all sectors
        System.out.println("--- Problem 3: Repair Crew TSP Tour ---");
        // 4 damaged city sectors
        String[] sectors = {"HQ", "Sector-A", "Sector-B", "Sector-C"};
        int[][] dist = {
            {0,  10, 15, 20},  // HQ
            {10,  0,  35, 25}, // Sector-A
            {15, 35,   0, 30}, // Sector-B
            {20, 25,  30,  0}  // Sector-C
        };
        System.out.println("Sectors: " + Arrays.toString(sectors));
        System.out.println("Repair crew starts and ends at HQ.");
        int minTour = minTravelCostTSP(dist);
        System.out.println("Minimum travel cost to visit all sectors: " + minTour);
        System.out.println();

        // Test 4: All 2^N subsets enumeration for small N
        System.out.println("--- Problem 4: All Resource Combinations (N=3) ---");
        String[] res3 = {"Ambulance", "Fire Truck", "Water Tanker"};
        int[] c3 = {40, 60, 30}, v3 = {70, 90, 50};
        System.out.printf("  %-8s %-35s %-8s %-8s%n", "Mask", "Combination", "Cost", "Value");
        for (int m = 0; m < (1 << 3); m++) {
            List<String> combo = new ArrayList<>();
            int tc = 0, tv = 0;
            for (int i = 0; i < 3; i++) {
                if ((m & (1 << i)) != 0) { combo.add(res3[i]); tc += c3[i]; tv += v3[i]; }
            }
            System.out.printf("  %-8s %-35s %-8d %-8d%n",
                String.format("%3s", Integer.toBinaryString(m)).replace(' ', '0'),
                combo.isEmpty() ? "{empty}" : combo.toString(), tc, tv);
        }
    }
}
