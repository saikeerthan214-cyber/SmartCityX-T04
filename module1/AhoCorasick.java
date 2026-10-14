package module1;

import java.util.*;

/**
 * Aho-Corasick Algorithm
 * SmartCityX Use Case: Simultaneously detect multiple emergency keywords
 * (fire, flood, accident, blackout, leak) and service keywords across
 * incoming citizen reports and IoT alert streams.
 *
 * Time Complexity:  O(N + M + Z) where N = text length,
 *                   M = total length of all patterns, Z = number of matches
 * Space Complexity: O(M * ALPHA) where ALPHA = alphabet size
 */
public class AhoCorasick {

    private static final int ALPHA = 256; // Extended ASCII

    // Trie node
    private static class Node {
        int[] children = new int[ALPHA];
        int   fail     = 0;   // failure link
        List<String> output = new ArrayList<>(); // patterns ending here

        Node() {
            Arrays.fill(children, -1);
        }
    }

    private List<Node> trie = new ArrayList<>();

    public AhoCorasick() {
        trie.add(new Node()); // root = node 0
    }

    /** Insert a pattern into the trie. */
    public void addPattern(String pattern) {
        int cur = 0;
        for (char c : pattern.toCharArray()) {
            int ch = (int) c;
            if (trie.get(cur).children[ch] == -1) {
                trie.get(cur).children[ch] = trie.size();
                trie.add(new Node());
            }
            cur = trie.get(cur).children[ch];
        }
        trie.get(cur).output.add(pattern);
    }

    /** Build failure links using BFS. Must be called after all patterns are added. */
    public void build() {
        Queue<Integer> queue = new LinkedList<>();
        Node root = trie.get(0);

        // For root's direct children: fail = root
        for (int c = 0; c < ALPHA; c++) {
            int child = root.children[c];
            if (child != -1) {
                trie.get(child).fail = 0;
                queue.add(child);
            } else {
                root.children[c] = 0; // loop back to root
            }
        }

        while (!queue.isEmpty()) {
            int u = queue.poll();
            Node uNode = trie.get(u);
            // Propagate output from fail link
            uNode.output.addAll(trie.get(uNode.fail).output);

            for (int c = 0; c < ALPHA; c++) {
                int v = uNode.children[c];
                if (v != -1) {
                    trie.get(v).fail = trie.get(uNode.fail).children[c];
                    queue.add(v);
                } else {
                    uNode.children[c] = trie.get(uNode.fail).children[c];
                }
            }
        }
    }

    /**
     * Search text for all pattern occurrences.
     * Returns a map: pattern -> list of ending positions in text.
     */
    public Map<String, List<Integer>> search(String text) {
        Map<String, List<Integer>> result = new LinkedHashMap<>();
        int cur = 0;
        for (int i = 0; i < text.length(); i++) {
            int ch = (int) text.charAt(i);
            cur = trie.get(cur).children[ch];
            for (String pat : trie.get(cur).output) {
                result.computeIfAbsent(pat, k -> new ArrayList<>())
                      .add(i - pat.length() + 1); // store start position
            }
        }
        return result;
    }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== Aho-Corasick – SmartCityX Demo ===\n");

        // Test 1: Emergency keyword detection in citizen report
        AhoCorasick ac1 = new AhoCorasick();
        String[] emergencyKeywords = {"fire", "flood", "accident", "blackout", "leak"};
        for (String kw : emergencyKeywords) ac1.addPattern(kw);
        ac1.build();

        String report = "A fire broke out near zone-B. Water leak detected in pipeline. blackout reported in sector-3.";
        System.out.println("--- Emergency Keyword Detection ---");
        System.out.println("Report  : \"" + report + "\"");
        System.out.println("Keywords: " + Arrays.toString(emergencyKeywords));
        Map<String, List<Integer>> found = ac1.search(report);
        if (found.isEmpty()) {
            System.out.println("No emergency keywords found.");
        } else {
            found.forEach((k, v) -> System.out.println("  '" + k + "' found at positions: " + v));
        }
        System.out.println();

        // Test 2: Service category detection in IoT alert stream
        AhoCorasick ac2 = new AhoCorasick();
        String[] serviceKeywords = {"water", "power", "road", "waste", "signal"};
        for (String kw : serviceKeywords) ac2.addPattern(kw);
        ac2.build();

        String iotAlert = "power outage in grid-A. road closure on highway-7. water pressure low in zone-C. signal failure at junction-2.";
        System.out.println("--- Service Keyword Detection in IoT Stream ---");
        System.out.println("Stream  : \"" + iotAlert + "\"");
        System.out.println("Keywords: " + Arrays.toString(serviceKeywords));
        Map<String, List<Integer>> svcFound = ac2.search(iotAlert);
        svcFound.forEach((k, v) -> System.out.println("  '" + k + "' found at positions: " + v));
        System.out.println();

        // Test 3: Infrastructure code patterns
        AhoCorasick ac3 = new AhoCorasick();
        String[] codes = {"INF-W", "INF-E", "INF-R"};
        for (String c : codes) ac3.addPattern(c);
        ac3.build();

        String infraLog = "INF-W-001 processed. INF-R-023 scheduled. INF-E-007 critical. INF-W-002 resolved.";
        System.out.println("--- Infrastructure Code Pattern Search ---");
        System.out.println("Log     : \"" + infraLog + "\"");
        Map<String, List<Integer>> codeFound = ac3.search(infraLog);
        codeFound.forEach((k, v) -> System.out.println("  Code prefix '" + k + "' found " + v.size() + " time(s) at: " + v));
        System.out.println();

        // Test 4: No match scenario
        AhoCorasick ac4 = new AhoCorasick();
        ac4.addPattern("earthquake");
        ac4.addPattern("tsunami");
        ac4.build();
        String normalReport = "City operations are running normally today. No issues reported.";
        System.out.println("--- No Match Scenario ---");
        System.out.println("Report: \"" + normalReport + "\"");
        Map<String, List<Integer>> noMatch = ac4.search(normalReport);
        System.out.println("Matches: " + (noMatch.isEmpty() ? "None found (city is safe!)" : noMatch));
    }
}
