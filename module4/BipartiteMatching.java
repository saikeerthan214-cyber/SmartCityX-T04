package module4;

import java.util.*;

/**
 * Bipartite Matching (using augmenting paths / Hopcroft-Karp style)
 * SmartCityX Use Case: Assign city resources (ambulances, repair crews)
 * to service requests optimally.
 *
 * Time Complexity:  O(E * sqrt(V))
 * Space Complexity: O(V + E)
 */
public class BipartiteMatching {

    int n, m; // n = left nodes (resources), m = right nodes (requests)
    List<Integer>[] adj;
    int[] matchL, matchR;
    boolean[] visited;

    @SuppressWarnings("unchecked")
    public BipartiteMatching(int n, int m) {
        this.n = n; this.m = m;
        adj    = new ArrayList[n];
        matchL = new int[n]; matchR = new int[m];
        Arrays.fill(matchL, -1); Arrays.fill(matchR, -1);
        for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();
    }

    public void addEdge(int resource, int request) {
        adj[resource].add(request);
    }

    private boolean dfs(int u) {
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                if (matchR[v] == -1 || dfs(matchR[v])) {
                    matchL[u] = v; matchR[v] = u;
                    return true;
                }
            }
        }
        return false;
    }

    public int maxMatching() {
        int result = 0;
        for (int u = 0; u < n; u++) {
            visited = new boolean[m];
            if (dfs(u)) result++;
        }
        return result;
    }

    public void printMatching(String[] resources, String[] requests) {
        System.out.println("Optimal Resource-to-Request Assignment:");
        for (int i = 0; i < n; i++) {
            if (matchL[i] != -1)
                System.out.println("  " + resources[i] + " → " + requests[matchL[i]]);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Bipartite Matching – SmartCityX Demo ===\n");

        // Resources: Ambulances/Fire Trucks matched to Emergency Requests
        String[] resources = {"Ambulance-1", "Ambulance-2", "FireTruck-1", "FireTruck-2", "RescueTeam-1"};
        String[] requests  = {"Medical-ZoneA", "Fire-Sector12", "Flood-ZoneD", "Medical-ZoneB", "Fire-ZoneC"};

        BipartiteMatching bm = new BipartiteMatching(5, 5);
        // Ambulance-1 can handle Medical-ZoneA, Medical-ZoneB
        bm.addEdge(0, 0); bm.addEdge(0, 3);
        // Ambulance-2 can handle Medical-ZoneA, Medical-ZoneB
        bm.addEdge(1, 0); bm.addEdge(1, 3);
        // FireTruck-1 can handle Fire-Sector12, Fire-ZoneC
        bm.addEdge(2, 1); bm.addEdge(2, 4);
        // FireTruck-2 can handle Fire-Sector12, Fire-ZoneC
        bm.addEdge(3, 1); bm.addEdge(3, 4);
        // RescueTeam can handle Flood-ZoneD, Fire-ZoneC
        bm.addEdge(4, 2); bm.addEdge(4, 4);

        int matched = bm.maxMatching();
        System.out.println("Emergency Requests: " + requests.length);
        System.out.println("Available Resources: " + resources.length);
        System.out.println("Maximum Matched: " + matched);
        System.out.println();
        bm.printMatching(resources, requests);
        System.out.println();

        // Repair crew to infrastructure jobs
        String[] crews = {"Crew-Alpha", "Crew-Beta", "Crew-Gamma", "Crew-Delta"};
        String[] jobs  = {"Road-Sector5", "Pipeline-ZoneA", "Electric-ZoneB", "Bridge-Sector14"};

        BipartiteMatching bm2 = new BipartiteMatching(4, 4);
        bm2.addEdge(0, 0); bm2.addEdge(0, 1);
        bm2.addEdge(1, 1); bm2.addEdge(1, 2);
        bm2.addEdge(2, 2); bm2.addEdge(2, 3);
        bm2.addEdge(3, 0); bm2.addEdge(3, 3);

        System.out.println("Infrastructure Repair Assignment:");
        System.out.println("Maximum crews assigned: " + bm2.maxMatching());
        bm2.printMatching(crews, jobs);
    }
}
