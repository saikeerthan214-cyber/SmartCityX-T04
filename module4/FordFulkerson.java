package module4;

import java.util.*;

/**
 * Ford-Fulkerson Algorithm (BFS = Edmonds-Karp variant)
 * SmartCityX Use Case: Model water/energy/traffic flow through city network.
 * Find maximum flow from source (reservoir/power plant) to sink (city zones).
 *
 * Time Complexity:  O(V * E^2) — Edmonds-Karp (BFS-based)
 * Space Complexity: O(V + E)
 */
public class FordFulkerson {

    private int V;
    private int[][] capacity;
    private int[][] flow;

    public FordFulkerson(int vertices) {
        this.V        = vertices;
        this.capacity = new int[V][V];
        this.flow     = new int[V][V];
    }

    public void addEdge(int u, int v, int cap) {
        capacity[u][v] += cap;
    }

    /** BFS to find augmenting path (Edmonds-Karp). */
    private int[] bfs(int source, int sink) {
        int[] parent = new int[V];
        Arrays.fill(parent, -1);
        parent[source] = source;
        Queue<Integer> queue = new LinkedList<>();
        queue.add(source);
        while (!queue.isEmpty() && parent[sink] == -1) {
            int u = queue.poll();
            for (int v = 0; v < V; v++) {
                if (parent[v] == -1 && capacity[u][v] - flow[u][v] > 0) {
                    parent[v] = u;
                    queue.add(v);
                }
            }
        }
        return parent[sink] == -1 ? null : parent;
    }

    /** Compute maximum flow from source to sink. */
    public int maxFlow(int source, int sink) {
        int totalFlow = 0;
        int[] parent;
        while ((parent = bfs(source, sink)) != null) {
            // Find min residual capacity along path
            int pathFlow = Integer.MAX_VALUE;
            for (int v = sink; v != source; v = parent[v]) {
                int u = parent[v];
                pathFlow = Math.min(pathFlow, capacity[u][v] - flow[u][v]);
            }
            // Update flows
            for (int v = sink; v != source; v = parent[v]) {
                int u = parent[v];
                flow[u][v] += pathFlow;
                flow[v][u] -= pathFlow;
            }
            totalFlow += pathFlow;
        }
        return totalFlow;
    }

    /** Find minimum cut edges (critical infrastructure bottlenecks). */
    public List<int[]> minCut(int source, int sink) {
        maxFlow(source, sink);
        boolean[] visited = new boolean[V];
        Queue<Integer> q = new LinkedList<>();
        q.add(source); visited[source] = true;
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v = 0; v < V; v++) {
                if (!visited[v] && capacity[u][v] - flow[u][v] > 0) {
                    visited[v] = true; q.add(v);
                }
            }
        }
        List<int[]> cuts = new ArrayList<>();
        for (int u = 0; u < V; u++)
            for (int v = 0; v < V; v++)
                if (visited[u] && !visited[v] && capacity[u][v] > 0)
                    cuts.add(new int[]{u, v, capacity[u][v]});
        return cuts;
    }

    public static void main(String[] args) {
        System.out.println("=== Ford-Fulkerson (Edmonds-Karp) – SmartCityX Demo ===\n");

        // City Water Network: Reservoir → Distribution → Zones
        // Nodes: 0=Reservoir, 1=PumpA, 2=PumpB, 3=ZoneA, 4=ZoneB, 5=ZoneC
        FordFulkerson ff = new FordFulkerson(6);
        ff.addEdge(0, 1, 15); // Reservoir → PumpA (15 KL/hr)
        ff.addEdge(0, 2, 12); // Reservoir → PumpB (12 KL/hr)
        ff.addEdge(1, 3, 10); // PumpA → Zone A
        ff.addEdge(1, 4,  8); // PumpA → Zone B
        ff.addEdge(2, 4,  7); // PumpB → Zone B
        ff.addEdge(2, 5, 10); // PumpB → Zone C
        ff.addEdge(3, 5,  5); // Zone A → Zone C (secondary)
        ff.addEdge(4, 5,  9); // Zone B → Zone C

        int mf = ff.maxFlow(0, 5);
        System.out.println("City Water Network:");
        System.out.println("  Nodes: Reservoir(0) → PumpA(1), PumpB(2) → ZoneA(3), ZoneB(4), ZoneC(5)");
        System.out.println("  Maximum water flow to Zone C: " + mf + " KL/hr");

        List<int[]> cuts = ff.minCut(0, 5);
        System.out.println("  Critical bottleneck edges (Min-Cut):");
        for (int[] c : cuts)
            System.out.println("    Node " + c[0] + " → Node " + c[1] + " | capacity: " + c[2] + " KL/hr");

        System.out.println();

        // Emergency Vehicle Flow: Dispatch center → Emergency zones
        FordFulkerson ev = new FordFulkerson(5);
        ev.addEdge(0, 1, 6); // Dispatch → Route1
        ev.addEdge(0, 2, 8); // Dispatch → Route2
        ev.addEdge(1, 3, 5); // Route1 → ZoneA
        ev.addEdge(2, 3, 4); // Route2 → ZoneA
        ev.addEdge(2, 4, 6); // Route2 → ZoneB
        ev.addEdge(3, 4, 3); // ZoneA → ZoneB

        System.out.println("Emergency Vehicle Dispatch Network:");
        System.out.println("  Max vehicles reachable at Zone B: " + ev.maxFlow(0, 4));
    }
}
