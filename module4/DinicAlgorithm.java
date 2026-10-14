package module4;

import java.util.*;

/**
 * Dinic's Algorithm — Faster Max Flow
 * SmartCityX Use Case: Large city-flow networks (energy grid, traffic routing).
 *
 * Time Complexity:  O(V^2 * E) — much faster than Ford-Fulkerson for dense graphs
 * Space Complexity: O(V + E)
 */
public class DinicAlgorithm {

    static final int INF = Integer.MAX_VALUE / 2;
    int V;
    List<int[]>[] graph; // graph[u] = list of [v, cap, rev_index]
    int[] level, iter;

    @SuppressWarnings("unchecked")
    public DinicAlgorithm(int v) {
        V = v;
        graph = new ArrayList[v];
        for (int i = 0; i < v; i++) graph[i] = new ArrayList<>();
        level = new int[v]; iter = new int[v];
    }

    public void addEdge(int u, int v, int cap) {
        graph[u].add(new int[]{v, cap, graph[v].size()});
        graph[v].add(new int[]{u, 0,  graph[u].size() - 1});
    }

    private boolean bfs(int s, int t) {
        Arrays.fill(level, -1);
        Queue<Integer> q = new LinkedList<>();
        level[s] = 0; q.add(s);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int[] e : graph[u])
                if (e[1] > 0 && level[e[0]] < 0) { level[e[0]] = level[u] + 1; q.add(e[0]); }
        }
        return level[t] >= 0;
    }

    private int dfs(int u, int t, int f) {
        if (u == t) return f;
        for (; iter[u] < graph[u].size(); iter[u]++) {
            int[] e = graph[u].get(iter[u]);
            if (e[1] > 0 && level[e[0]] == level[u] + 1) {
                int d = dfs(e[0], t, Math.min(f, e[1]));
                if (d > 0) {
                    e[1] -= d;
                    graph[e[0]].get(e[2])[1] += d;
                    return d;
                }
            }
        }
        return 0;
    }

    public int maxFlow(int s, int t) {
        int flow = 0;
        while (bfs(s, t)) {
            Arrays.fill(iter, 0);
            int d;
            while ((d = dfs(s, t, INF)) > 0) flow += d;
        }
        return flow;
    }

    public static void main(String[] args) {
        System.out.println("=== Dinic's Algorithm – SmartCityX Demo ===\n");

        // City Energy Grid: Power Plant → Substations → City Zones
        DinicAlgorithm d = new DinicAlgorithm(7);
        // 0=PowerPlant, 1=SubA, 2=SubB, 3=SubC, 4=ZoneA, 5=ZoneB, 6=ZoneC
        d.addEdge(0, 1, 30); d.addEdge(0, 2, 25); d.addEdge(0, 3, 20);
        d.addEdge(1, 4, 15); d.addEdge(1, 5, 18);
        d.addEdge(2, 5, 12); d.addEdge(2, 6, 14);
        d.addEdge(3, 6, 20); d.addEdge(4, 6,  5); d.addEdge(5, 6, 10);

        System.out.println("City Energy Grid:");
        System.out.println("  Power Plant(0) → Substations(1,2,3) → Zones(4,5,6)");
        System.out.println("  Maximum power flow to Zone C (node 6): " + d.maxFlow(0, 6) + " MW");
        System.out.println();

        // Traffic routing: Highway network
        DinicAlgorithm t2 = new DinicAlgorithm(6);
        t2.addEdge(0, 1, 20); t2.addEdge(0, 2, 15);
        t2.addEdge(1, 3, 12); t2.addEdge(1, 4, 10);
        t2.addEdge(2, 4,  8); t2.addEdge(2, 3, 11);
        t2.addEdge(3, 5, 14); t2.addEdge(4, 5, 16);

        System.out.println("City Traffic Network:");
        System.out.println("  Max vehicle flow from Hub(0) to Destination(5): " + t2.maxFlow(0, 5) + " vehicles/min");
    }
}
