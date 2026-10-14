package module5;

import java.util.*;

/**
 * Vertex Cover — 2-Approximation Algorithm
 * SmartCityX Use Case: Find minimum set of infrastructure nodes (junctions,
 * pump stations, substations) that "cover" all city network connections.
 * Identifies critical infrastructure that must be maintained.
 *
 * 2-Approximation: result is at most 2× optimal (NP-Hard to solve exactly)
 * Time Complexity:  O(V + E)
 * Space Complexity: O(V + E)
 */
public class VertexCover {

    /**
     * 2-approximation for minimum vertex cover.
     * Algorithm: repeatedly pick an uncovered edge, add both endpoints.
     */
    public static Set<Integer> approximateVertexCover(int V, List<int[]> edges) {
        Set<Integer> cover   = new HashSet<>();
        boolean[] matched    = new boolean[edges.size()];

        for (int i = 0; i < edges.size(); i++) {
            if (!matched[i]) {
                int u = edges.get(i)[0], v = edges.get(i)[1];
                if (!cover.contains(u) || !cover.contains(v)) {
                    cover.add(u);
                    cover.add(v);
                    // Mark all edges incident to u or v
                    for (int j = i + 1; j < edges.size(); j++) {
                        if (edges.get(j)[0] == u || edges.get(j)[1] == u ||
                            edges.get(j)[0] == v || edges.get(j)[1] == v) {
                            matched[j] = true;
                        }
                    }
                }
            }
        }
        return cover;
    }

    /**
     * Verify that the cover actually covers all edges.
     */
    public static boolean verifyCover(Set<Integer> cover, List<int[]> edges) {
        for (int[] e : edges)
            if (!cover.contains(e[0]) && !cover.contains(e[1])) return false;
        return true;
    }

    public static void main(String[] args) {
        System.out.println("=== Vertex Cover 2-Approximation – SmartCityX Demo ===\n");

        // City Infrastructure Network
        // Nodes: 0=CentralHub, 1=PumpStation, 2=Substation, 3=Junction4,
        //        4=TrafficNode, 5=WaterTower, 6=FireStation, 7=Hospital
        String[] nodes = {"CentralHub", "PumpStation", "Substation", "Junction4",
                          "TrafficNode", "WaterTower", "FireStation", "Hospital"};

        List<int[]> edges = new ArrayList<>();
        edges.add(new int[]{0, 1}); edges.add(new int[]{0, 2});
        edges.add(new int[]{1, 3}); edges.add(new int[]{1, 4});
        edges.add(new int[]{2, 4}); edges.add(new int[]{2, 5});
        edges.add(new int[]{3, 6}); edges.add(new int[]{4, 6});
        edges.add(new int[]{5, 7}); edges.add(new int[]{6, 7});

        System.out.println("City Infrastructure Network:");
        System.out.println("  Nodes: " + nodes.length + " infrastructure points");
        System.out.println("  Edges: " + edges.size() + " connections");
        System.out.println();

        Set<Integer> cover = approximateVertexCover(nodes.length, edges);

        System.out.println("Minimum Vertex Cover (2-Approximation):");
        System.out.println("  Critical nodes to maintain coverage: " + cover.size());
        System.out.print("  Nodes: ");
        for (int n : cover) System.out.print(nodes[n] + " ");
        System.out.println();
        System.out.println("  Covers all edges: " + verifyCover(cover, edges));
        System.out.println();

        System.out.println("Infrastructure Significance:");
        System.out.println("  These " + cover.size() + " nodes, if maintained/monitored,");
        System.out.println("  ensure every connection in the city network is covered.");
        System.out.println("  Approximation guarantee: at most 2× optimal solution.");
    }
}
