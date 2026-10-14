package module5;

import java.util.*;

/**
 * NP-Completeness Reductions Demo
 * 3-SAT → CLIQUE → INDEPENDENT SET → VERTEX COVER
 *
 * SmartCityX Use Case: Demonstrate computational complexity of
 * city planning constraint problems.
 *
 * These reductions prove that city planning optimization is NP-Hard —
 * justifying the use of approximation algorithms.
 */
public class NPReductions {

    // ─── CLIQUE (brute force for small graphs) ────────────────────
    public static List<Integer> findClique(int V, boolean[][] adj, int k) {
        // Try all subsets of size k
        for (int mask = 0; mask < (1 << V); mask++) {
            if (Integer.bitCount(mask) == k) {
                List<Integer> subset = new ArrayList<>();
                for (int i = 0; i < V; i++) if ((mask & (1 << i)) != 0) subset.add(i);
                boolean isClique = true;
                outer:
                for (int i = 0; i < subset.size() && isClique; i++)
                    for (int j = i+1; j < subset.size(); j++)
                        if (!adj[subset.get(i)][subset.get(j)]) { isClique = false; break outer; }
                if (isClique) return subset;
            }
        }
        return null;
    }

    // ─── INDEPENDENT SET (complement of clique) ───────────────────
    public static List<Integer> findIndependentSet(int V, boolean[][] adj, int k) {
        // Build complement graph
        boolean[][] comp = new boolean[V][V];
        for (int i = 0; i < V; i++)
            for (int j = 0; j < V; j++)
                if (i != j) comp[i][j] = !adj[i][j];
        return findClique(V, comp, k);
    }

    public static void main(String[] args) {
        System.out.println("=== NP-Completeness Reductions – SmartCityX Demo ===\n");

        // City Infrastructure Conflict Graph
        // Nodes: City services that may conflict with each other
        // Edge = two services CANNOT be active simultaneously (conflict)
        String[] services = {"WaterPump", "ElecGrid", "TrafficCtrl", "EmergRoute", "GasLine", "SewagePump"};
        int V = services.length;
        boolean[][] adj = new boolean[V][V];
        // Conflict edges
        int[][] conflicts = {{0,1},{0,2},{1,3},{1,4},{2,3},{2,5},{3,4},{4,5}};
        for (int[] e : conflicts) { adj[e[0]][e[1]] = true; adj[e[1]][e[0]] = true; }

        System.out.println("City Service Conflict Graph:");
        System.out.println("  Services: " + Arrays.toString(services));
        System.out.print("  Conflicts: ");
        for (int[] e : conflicts) System.out.print(services[e[0]] + "-" + services[e[1]] + " ");
        System.out.println("\n");

        // CLIQUE: Find services that ALL conflict with each other
        System.out.println("--- CLIQUE Problem ---");
        System.out.println("Finding 3 services that all conflict with each other...");
        List<Integer> clique = findClique(V, adj, 3);
        if (clique != null) {
            System.out.print("  Found clique: ");
            for (int n : clique) System.out.print(services[n] + " ");
            System.out.println("\n  (These 3 services all mutually conflict)");
        } else System.out.println("  No clique of size 3 found.");
        System.out.println();

        // INDEPENDENT SET: Find services that have NO conflicts
        System.out.println("--- INDEPENDENT SET Problem ---");
        System.out.println("Finding 2 services with NO conflicts between them...");
        List<Integer> indSet = findIndependentSet(V, adj, 2);
        if (indSet != null) {
            System.out.print("  Found independent set: ");
            for (int n : indSet) System.out.print(services[n] + " ");
            System.out.println("\n  (These services can safely run simultaneously)");
        }
        System.out.println();

        // VERTEX COVER: Minimum monitor set
        System.out.println("--- VERTEX COVER Problem ---");
        List<int[]> edges = new ArrayList<>();
        for (int[] e : conflicts) edges.add(e);
        Set<Integer> vc = VertexCover.approximateVertexCover(V, edges);
        System.out.print("  Minimum services to monitor (covers all conflicts): ");
        for (int n : vc) System.out.print(services[n] + " ");
        System.out.println();
        System.out.println("  Size: " + vc.size() + " (2-approximation guarantee)");
        System.out.println();

        System.out.println("=== NP-Completeness Significance ===");
        System.out.println("  3-SAT ≤p CLIQUE ≤p INDEPENDENT SET ≡ VERTEX COVER");
        System.out.println("  All are NP-Complete — no polynomial algorithm known.");
        System.out.println("  SmartCityX uses 2-approximation to handle these in polynomial time.");
    }
}
