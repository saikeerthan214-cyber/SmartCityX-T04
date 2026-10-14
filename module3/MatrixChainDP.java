package module3;

/**
 * Matrix-Chain Multiplication DP
 * SmartCityX Use Case: Optimize the order of analytics pipeline operations
 * in SmartCityX. Each city analytics step (data aggregation, filtering,
 * transformation, ML inference) is modeled as a matrix multiplication.
 * Finding the optimal parenthesization minimizes total computational cost.
 *
 * Time Complexity:  O(N^3)
 * Space Complexity: O(N^2)
 */
public class MatrixChainDP {

    /**
     * Compute minimum scalar multiplications for matrix chain A1*A2*...*An.
     *
     * @param dims  dimensions array where matrix Ai has size dims[i-1] x dims[i]
     * @return minimum number of scalar multiplications
     */
    public static long minMultiplications(int[] dims) {
        int n = dims.length - 1; // number of matrices
        long[][] dp   = new long[n][n]; // dp[i][j] = min cost for Ai..Aj
        int[][]  split = new int[n][n]; // optimal split point

        // Length l = 1: single matrix → cost 0 (already initialized)

        for (int len = 2; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                dp[i][j] = Long.MAX_VALUE;
                for (int k = i; k < j; k++) {
                    long cost = dp[i][k] + dp[k + 1][j]
                               + (long) dims[i] * dims[k + 1] * dims[j + 1];
                    if (cost < dp[i][j]) {
                        dp[i][j]    = cost;
                        split[i][j] = k;
                    }
                }
            }
        }
        return dp[0][n - 1];
    }

    /**
     * Reconstruct optimal parenthesization string.
     */
    public static String optimalParenthesization(int[] dims, String[] names) {
        int n = dims.length - 1;
        long[][] dp    = new long[n][n];
        int[][]  split = new int[n][n];

        for (int len = 2; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                dp[i][j] = Long.MAX_VALUE;
                for (int k = i; k < j; k++) {
                    long cost = dp[i][k] + dp[k + 1][j]
                               + (long) dims[i] * dims[k + 1] * dims[j + 1];
                    if (cost < dp[i][j]) { dp[i][j] = cost; split[i][j] = k; }
                }
            }
        }
        return buildParens(split, names, 0, n - 1);
    }

    private static String buildParens(int[][] split, String[] names, int i, int j) {
        if (i == j) return names[i];
        return "(" + buildParens(split, names, i, split[i][j])
                   + " x "
                   + buildParens(split, names, split[i][j] + 1, j) + ")";
    }

    /**
     * Print the full DP table for educational purposes.
     */
    public static void printDPTable(int[] dims) {
        int n = dims.length - 1;
        long[][] dp = new long[n][n];
        for (int len = 2; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                dp[i][j] = Long.MAX_VALUE;
                for (int k = i; k < j; k++) {
                    long cost = dp[i][k] + dp[k + 1][j]
                               + (long) dims[i] * dims[k + 1] * dims[j + 1];
                    if (cost < dp[i][j]) dp[i][j] = cost;
                }
            }
        }
        System.out.println("DP Table (dp[i][j] = min cost for matrices i..j):");
        System.out.print("     ");
        for (int j = 0; j < n; j++) System.out.printf("%8d", j);
        System.out.println();
        for (int i = 0; i < n; i++) {
            System.out.printf("  %2d ", i);
            for (int j = 0; j < n; j++) {
                if (dp[i][j] == 0 || (j >= i))
                    System.out.printf("%8d", dp[i][j]);
                else
                    System.out.printf("%8s", "-");
            }
            System.out.println();
        }
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== Matrix-Chain DP – SmartCityX Demo ===\n");

        // Test 1: City analytics pipeline optimization
        // Operations: Data Ingestion → Aggregation → Filtering → ML Inference → Reporting
        System.out.println("--- Analytics Pipeline 1: 4 Operations ---");
        // Matrix sizes: 40×20, 20×30, 30×10, 10×30
        int[] dims1  = {40, 20, 30, 10, 30};
        String[] ops1 = {"Ingestion(40x20)", "Aggregation(20x30)",
                          "Filtering(30x10)", "MLInference(10x30)"};
        long minCost1 = minMultiplications(dims1);
        String order1 = optimalParenthesization(dims1, ops1);
        System.out.println("Pipeline: " + String.join(" -> ", ops1));
        System.out.println("Minimum computation cost: " + minCost1 + " scalar multiplications");
        System.out.println("Optimal order: " + order1);
        System.out.println();

        // Test 2: Sensor data processing pipeline
        System.out.println("--- Analytics Pipeline 2: 5 Operations (IoT Sensor Processing) ---");
        // IoT: Collect → Normalize → Filter → Cluster → Visualize
        int[] dims2  = {10, 100, 5, 50, 1, 200};
        String[] ops2 = {"Collect(10x100)", "Normalize(100x5)",
                          "Filter(5x50)",   "Cluster(50x1)",   "Visualize(1x200)"};
        long minCost2 = minMultiplications(dims2);
        String order2 = optimalParenthesization(dims2, ops2);
        System.out.println("Pipeline: " + String.join(" -> ", ops2));
        System.out.println("Minimum computation cost: " + minCost2);
        System.out.println("Optimal order: " + order2);
        System.out.println();

        // Test 3: Naive vs Optimal cost comparison
        System.out.println("--- Cost Comparison: Naive Left-to-Right vs Optimal ---");
        int[] dims3 = {40, 20, 30, 10, 30};
        // Naive: ((((A1*A2)*A3)*A4))
        long naiveCost = (long) 40 * 20 * 30    // A1*A2
                       + (long) 40 * 30 * 10    // (A1A2)*A3
                       + (long) 40 * 10 * 30;   // ((A1A2A3)*A4)
        long optCost = minMultiplications(dims3);
        System.out.println("Naive (left-to-right) cost : " + naiveCost);
        System.out.println("Optimal DP cost            : " + optCost);
        System.out.println("Cost reduction             : " + (naiveCost - optCost) +
            " (" + String.format("%.1f", 100.0 * (naiveCost - optCost) / naiveCost) + "% savings)");
        System.out.println();

        // Test 4: DP table visualization
        System.out.println("--- DP Table for 4-matrix pipeline ---");
        printDPTable(dims1);
        System.out.println();

        // Test 5: Edge cases
        System.out.println("--- Edge Cases ---");
        int[] single = {10, 20};
        System.out.println("Single matrix (10×20): min cost = " + minMultiplications(single) + " (should be 0)");
        int[] two = {10, 20, 30};
        System.out.println("Two matrices (10×20)×(20×30): min cost = " + minMultiplications(two)
            + " (should be " + 10 * 20 * 30 + ")");
    }
}


