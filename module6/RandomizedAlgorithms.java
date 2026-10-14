package module6;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

/**
 * Module 6 — Randomized and Parallel Algorithms
 * SmartCityX Use Cases:
 *   1. Randomized QuickSort   — rank/prioritize city service requests
 *   2. Reservoir Sampling     — sample IoT sensor data streams
 *   3. Miller-Rabin           — large ID/hash primality verification
 *   4. Parallel Reduce        — city-wide statistics aggregation
 *   5. Brent's Theorem demo   — parallel complexity analysis
 */
public class RandomizedAlgorithms {

    static final Random RNG = new Random(42);

    // ──────────────────────────────────────────────────────────────
    // 1. Randomized QuickSort
    // SmartCityX: Sort service requests by priority score
    // Time: O(N log N) expected, O(N²) worst case
    // ──────────────────────────────────────────────────────────────
    public static void randomQuickSort(int[] arr, int lo, int hi) {
        if (lo < hi) {
            int pivot = partition(arr, lo, hi);
            randomQuickSort(arr, lo, pivot - 1);
            randomQuickSort(arr, pivot + 1, hi);
        }
    }

    private static int partition(int[] arr, int lo, int hi) {
        int pivotIdx = lo + RNG.nextInt(hi - lo + 1);
        int tmp = arr[pivotIdx]; arr[pivotIdx] = arr[hi]; arr[hi] = tmp;
        int pivot = arr[hi], i = lo - 1;
        for (int j = lo; j < hi; j++)
            if (arr[j] <= pivot) { i++; int t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
        int t = arr[i+1]; arr[i+1] = arr[hi]; arr[hi] = t;
        return i + 1;
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Reservoir Sampling (Algorithm R)
    // SmartCityX: Sample K readings from continuous IoT sensor stream
    // Time: O(N), Space: O(K)
    // ──────────────────────────────────────────────────────────────
    public static int[] reservoirSample(int[] stream, int k) {
        int[] reservoir = Arrays.copyOf(stream, k);
        for (int i = k; i < stream.length; i++) {
            int j = RNG.nextInt(i + 1);
            if (j < k) reservoir[j] = stream[i];
        }
        return reservoir;
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Miller-Rabin Primality Test
    // SmartCityX: Verify large numerical IDs, hash codes, sensor keys
    // Time: O(k log² N) — k rounds of testing
    // ──────────────────────────────────────────────────────────────
    public static boolean millerRabin(long n, int rounds) {
        if (n < 2) return false;
        if (n == 2 || n == 3) return true;
        if (n % 2 == 0) return false;

        long d = n - 1; int r = 0;
        while (d % 2 == 0) { d /= 2; r++; }

        for (int i = 0; i < rounds; i++) {
            long a = 2 + (long)(RNG.nextDouble() * (n - 4));
            long x = modPow(a, d, n);
            if (x == 1 || x == n - 1) continue;
            boolean composite = true;
            for (int j = 0; j < r - 1; j++) {
                x = modPow(x, 2, n);
                if (x == n - 1) { composite = false; break; }
            }
            if (composite) return false;
        }
        return true;
    }

    private static long modPow(long base, long exp, long mod) {
        long result = 1; base %= mod;
        while (exp > 0) {
            if ((exp & 1) == 1) result = result * base % mod;
            base = base * base % mod; exp >>= 1;
        }
        return result;
    }

    // ──────────────────────────────────────────────────────────────
    // 4. Parallel Reduce — City-wide statistics
    // SmartCityX: Aggregate sensor readings across all zones
    // Uses Java ForkJoin for parallel execution
    // ──────────────────────────────────────────────────────────────
    static class ParallelSum extends RecursiveTask<Long> {
        int[] arr; int lo, hi;
        static final int THRESHOLD = 100;
        ParallelSum(int[] arr, int lo, int hi) { this.arr=arr; this.lo=lo; this.hi=hi; }
        protected Long compute() {
            if (hi - lo <= THRESHOLD) {
                long s = 0; for (int i = lo; i < hi; i++) s += arr[i]; return s;
            }
            int mid = (lo + hi) / 2;
            ParallelSum left  = new ParallelSum(arr, lo, mid);
            ParallelSum right = new ParallelSum(arr, mid, hi);
            left.fork();
            return right.compute() + left.join();
        }
    }

    public static long parallelReduce(int[] arr) {
        ForkJoinPool pool = new ForkJoinPool();
        return pool.invoke(new ParallelSum(arr, 0, arr.length));
    }

    // ──────────────────────────────────────────────────────────────
    // 5. Blelloch Prefix Scan (parallel prefix sum)
    // SmartCityX: Cumulative sensor measurements across city zones
    // Time: O(log N) parallel steps
    // ──────────────────────────────────────────────────────────────
    public static int[] blellochScan(int[] arr) {
        int n = arr.length;
        int[] result = arr.clone();
        // Up-sweep
        for (int d = 1; d < n; d <<= 1)
            for (int i = 0; i < n; i += 2*d)
                if (i + 2*d - 1 < n) result[i + 2*d - 1] += result[i + d - 1];
        // Down-sweep
        result[n-1] = 0;
        for (int d = n/2; d >= 1; d >>= 1)
            for (int i = 0; i < n; i += 2*d)
                if (i + 2*d - 1 < n) {
                    int t = result[i + d - 1];
                    result[i + d - 1] = result[i + 2*d - 1];
                    result[i + 2*d - 1] += t;
                }
        return result;
    }

    // ──────────────────────────────────────────────────────────────
    // MAIN DEMO
    // ──────────────────────────────────────────────────────────────
    public static void main(String[] args) throws Exception {
        System.out.println("=== Module 6: Randomized & Parallel Algorithms – SmartCityX ===\n");

        // 1. Randomized QuickSort — sort service request priorities
        System.out.println("--- 1. Randomized QuickSort: Service Request Prioritization ---");
        int[] priorities = {45, 92, 13, 78, 56, 31, 88, 24, 67, 99, 42, 15};
        System.out.println("Before: " + Arrays.toString(priorities));
        randomQuickSort(priorities, 0, priorities.length - 1);
        System.out.println("After:  " + Arrays.toString(priorities));
        System.out.println("Highest priority requests: " + priorities[priorities.length-1] +
            ", " + priorities[priorities.length-2] + ", " + priorities[priorities.length-3]);
        System.out.println("Time: O(N log N) expected | Space: O(log N)");
        System.out.println();

        // 2. Reservoir Sampling — sample IoT sensor stream
        System.out.println("--- 2. Reservoir Sampling: IoT Sensor Stream Sampling ---");
        int[] sensorStream = new int[1000];
        for (int i = 0; i < 1000; i++) sensorStream[i] = 20 + RNG.nextInt(80); // temp readings
        int[] sample = reservoirSample(sensorStream, 10);
        System.out.println("Stream size: 1000 sensor readings");
        System.out.println("Sample size (K): 10");
        System.out.println("Sample: " + Arrays.toString(sample));
        System.out.println("Each element has equal 10/1000 probability — guaranteed uniform.");
        System.out.println("Time: O(N) | Space: O(K)");
        System.out.println();

        // 3. Miller-Rabin primality
        System.out.println("--- 3. Miller-Rabin: Large City ID Verification ---");
        long[] testNums = {104729L, 104730L, 999983L, 1000003L, 15485863L, 999999937L};
        for (long n : testNums) {
            boolean prime = millerRabin(n, 10);
            System.out.printf("  %10d → %s%n", n, prime ? "PRIME (valid city ID)" : "COMPOSITE (invalid)");
        }
        System.out.println("Time: O(k log² N) | Error probability: < 4^(-k)");
        System.out.println();

        // 4. Parallel Reduce
        System.out.println("--- 4. Parallel Reduce: City-Wide Sensor Aggregation ---");
        int[] sensorReadings = new int[10000];
        for (int i = 0; i < 10000; i++) sensorReadings[i] = RNG.nextInt(100);
        long seqSum = 0; for (int v : sensorReadings) seqSum += v;
        long parSum = parallelReduce(sensorReadings);
        System.out.println("10,000 sensor readings across all city zones:");
        System.out.println("  Sequential sum: " + seqSum);
        System.out.println("  Parallel sum:   " + parSum + " (matches: " + (seqSum == parSum) + ")");
        System.out.println("  Parallel Time: O(N/P + log P) where P = processors");
        System.out.println();

        // 5. Blelloch Scan — cumulative energy consumption
        System.out.println("--- 5. Blelloch Prefix Scan: Cumulative Zone Energy ---");
        int[] zoneEnergy = {120, 85, 200, 95, 140, 175, 60, 110};
        String[] zones   = {"ZA","ZB","ZC","ZD","ZE","ZF","ZG","ZH"};
        int[] cumulative = blellochScan(zoneEnergy);
        System.out.println("Zone energy consumption (MW):");
        System.out.print("  Zone:  "); for (String z : zones) System.out.printf("%-6s", z);
        System.out.println();
        System.out.print("  Load:  "); for (int e : zoneEnergy) System.out.printf("%-6d", e);
        System.out.println();
        System.out.print("  Prefix:"); for (int c : cumulative) System.out.printf("%-6d", c);
        System.out.println();
        System.out.println("  (Prefix sum shows cumulative load — helps detect grid overload points)");
        System.out.println("  Parallel Time: O(log N) steps");
        System.out.println();

        // 6. Brent's Theorem
        System.out.println("--- 6. Brent's Theorem: Parallel City Analytics ---");
        int totalWork = 10000, span = 14; // log2(10000) ≈ 14
        int processors = 8;
        double tP = (double)totalWork / processors + span;
        System.out.println("City analytics pipeline:");
        System.out.println("  Total work (T1): " + totalWork + " operations");
        System.out.println("  Critical path (T∞): " + span + " steps");
        System.out.println("  Processors (P): " + processors);
        System.out.printf("  Time with P processors: T_P ≤ T1/P + T∞ = %d/%d + %d = %.1f steps%n",
            totalWork, processors, span, tP);
        System.out.println("  Parallelism = T1/T∞ = " + totalWork/span + "× speedup possible");
    }
}
