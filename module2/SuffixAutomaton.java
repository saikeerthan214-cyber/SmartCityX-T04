package module2;

import java.util.*;

/**
 * Suffix Automaton (SAM)
 * SmartCityX Use Case: Efficient substring queries on city data —
 * check if a query exists in a document, count distinct substrings,
 * and find occurrences of service descriptions in city-data repositories.
 *
 * Time Complexity:  O(N) build, O(M) query
 * Space Complexity: O(N) states
 */
public class SuffixAutomaton {

    private static class State {
        int len, link;
        Map<Character, Integer> next = new HashMap<>();
        boolean isClone = false;

        State(int len, int link) {
            this.len  = len;
            this.link = link;
        }
    }

    private List<State> sa    = new ArrayList<>();
    private int         last  = 0;
    private String      built = "";

    public SuffixAutomaton() {
        sa.add(new State(0, -1)); // initial state
    }

    /** Extend the automaton with one character. */
    private void extend(char c) {
        // Check if transition already exists (for repeated builds)
        if (sa.get(last).next.containsKey(c)) {
            int q = sa.get(last).next.get(c);
            if (sa.get(q).len == sa.get(last).len + 1) {
                last = q;
                return;
            }
            int clone = sa.size();
            sa.add(new State(sa.get(last).len + 1, sa.get(q).link));
            sa.get(clone).next.putAll(sa.get(q).next);
            sa.get(clone).isClone = true;
            while (last != -1 && sa.get(last).next.getOrDefault(c, -1) == q) {
                sa.get(last).next.put(c, clone);
                last = sa.get(last).link;
            }
            sa.get(q).link = clone;
            last = clone;
            return;
        }

        int cur = sa.size();
        sa.add(new State(sa.get(last).len + 1, -1));
        int p = last;
        while (p != -1 && !sa.get(p).next.containsKey(c)) {
            sa.get(p).next.put(c, cur);
            p = sa.get(p).link;
        }
        if (p == -1) {
            sa.get(cur).link = 0;
        } else {
            int q = sa.get(p).next.get(c);
            if (sa.get(q).len == sa.get(p).len + 1) {
                sa.get(cur).link = q;
            } else {
                int clone = sa.size();
                sa.add(new State(sa.get(p).len + 1, sa.get(q).link));
                sa.get(clone).next.putAll(sa.get(q).next);
                sa.get(clone).isClone = true;
                while (p != -1 && sa.get(p).next.getOrDefault(c, -1) == q) {
                    sa.get(p).next.put(c, clone);
                    p = sa.get(p).link;
                }
                sa.get(q).link  = clone;
                sa.get(cur).link = clone;
            }
        }
        last = cur;
    }

    /** Build SAM from a complete string. */
    public void build(String text) {
        this.built = text;
        for (char c : text.toCharArray()) extend(c);
    }

    /** Check if pattern is a substring of the built text. */
    public boolean contains(String pattern) {
        int cur = 0;
        for (char c : pattern.toCharArray()) {
            Integer next = sa.get(cur).next.get(c);
            if (next == null) return false;
            cur = next;
        }
        return true;
    }

    /**
     * Count number of distinct substrings.
     * Each non-clone state represents (len - link.len) new substrings.
     */
    public long countDistinctSubstrings() {
        long count = 0;
        for (int i = 1; i < sa.size(); i++) {
            State s = sa.get(i);
            if (!s.isClone) {
                count += s.len - (s.link == -1 ? 0 : sa.get(s.link).len);
            }
        }
        return count;
    }

    /** Get number of SAM states (indicative of compression). */
    public int stateCount() { return sa.size(); }

    // ---------------------------------------------------------------
    // Demo / Test
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        System.out.println("=== Suffix Automaton – SmartCityX Demo ===\n");

        // Test 1: City infrastructure document query
        String infraDoc = "water pipeline maintenance water supply water pressure monitoring";
        SuffixAutomaton sam1 = new SuffixAutomaton();
        sam1.build(infraDoc);
        System.out.println("Document: \"" + infraDoc + "\"");
        System.out.println("SAM States: " + sam1.stateCount());
        System.out.println("Distinct substrings: " + sam1.countDistinctSubstrings());
        System.out.println();

        String[] queries1 = {"water", "pipeline", "supply", "fire", "maintenance", "electric"};
        System.out.println("Substring queries:");
        for (String q : queries1) {
            System.out.println("  \"" + q + "\": " + (sam1.contains(q) ? "FOUND" : "NOT FOUND"));
        }
        System.out.println();

        // Test 2: Emergency report query system
        String emergencyReport = "fire alarm activated in sector-7 fire brigade dispatched";
        SuffixAutomaton sam2 = new SuffixAutomaton();
        sam2.build(emergencyReport);
        System.out.println("Emergency Report: \"" + emergencyReport + "\"");
        String[] emergencyQ = {"fire alarm", "fire brigade", "flood", "sector-7", "activated"};
        System.out.println("Query Results:");
        for (String q : emergencyQ) {
            System.out.println("  \"" + q + "\": " + (sam2.contains(q) ? "FOUND in report" : "NOT in report"));
        }
        System.out.println();

        // Test 3: Citizen service request
        String serviceReq = "road pothole complaint zone-B road repair request pending approval";
        SuffixAutomaton sam3 = new SuffixAutomaton();
        sam3.build(serviceReq);
        System.out.println("Service Request: \"" + serviceReq + "\"");
        System.out.println("Contains 'road pothole': " + sam3.contains("road pothole"));
        System.out.println("Contains 'pending approval': " + sam3.contains("pending approval"));
        System.out.println("Contains 'rejected': " + sam3.contains("rejected"));
        System.out.println("Distinct substrings count: " + sam3.countDistinctSubstrings());
        System.out.println();

        // Test 4: Efficiency comparison — SAM vs brute force on large IoT log
        StringBuilder iotLog = new StringBuilder();
        String[] events = {"sensor_ok", "sensor_warn", "sensor_fail", "sensor_ok"};
        for (int i = 0; i < 50; i++) iotLog.append(events[i % 4]).append(" ");
        SuffixAutomaton sam4 = new SuffixAutomaton();
        sam4.build(iotLog.toString());
        System.out.println("IoT Log (200 chars+): built SAM with " + sam4.stateCount() + " states");
        System.out.println("Query 'sensor_fail': " + sam4.contains("sensor_fail"));
        System.out.println("Query 'sensor_crash': " + sam4.contains("sensor_crash"));
    }
}
