import module1.*;
import module2.*;
import module3.*;
import module4.*;
import module5.*;
import module6.*;

/**
 * SmartCityX – Integrated Smart-City Analytics Platform
 * FULL Demo Runner — All 6 Modules (CO1–CO6)
 */
public class Main {

    public static void main(String[] args) {

        System.out.println("==============================================================");
        System.out.println("       SmartCityX - Integrated Smart-City Platform            ");
        System.out.println("            Full Demo   (Modules 1 - 6 / CO1-CO6)             ");
        System.out.println("==============================================================");

        // ── MODULE 1: String Algorithms ──────────────────────────────
        banner("MODULE 1 – STRING ALGORITHMS (CO1)");
        section("1.1 KMP – Keyword Search in Citizen Reports");
        KMP.main(new String[]{});
        section("1.2 Z-Function – Repeated Pattern Detection");
        ZFunction.main(new String[]{});
        section("1.3 Rabin-Karp – Service/Infrastructure Identifier Search");
        RabinKarp.main(new String[]{});
        section("1.4 Aho-Corasick – Multi-Keyword Emergency Detection");
        AhoCorasick.main(new String[]{});

        // ── MODULE 2: Suffix Structures ──────────────────────────────
        banner("MODULE 2 – SUFFIX STRUCTURES (CO2)");
        section("2.1 Suffix Array – City Document Indexing");
        SuffixArray.main(new String[]{});
        section("2.2 SA-IS – Linear-Time Suffix Array Construction");
        SAIS.main(new String[]{});
        section("2.3 LCP / Kasai – Document Similarity via Common Prefixes");
        LCPKasai.main(new String[]{});
        section("2.4 Suffix Automaton – Substring Queries on City Data");
        SuffixAutomaton.main(new String[]{});

        // ── MODULE 3: Advanced Dynamic Programming ───────────────────
        banner("MODULE 3 – ADVANCED DYNAMIC PROGRAMMING (CO3)");
        section("3.1 Edit Distance (Levenshtein / Damerau-Levenshtein) – Query Correction");
        EditDistance.main(new String[]{});
        section("3.2 Bitmask DP – Resource Allocation & Emergency Zone Coverage");
        BitmaskDP.main(new String[]{});
        section("3.3 Matrix-Chain DP – Analytics Pipeline Optimization");
        MatrixChainDP.main(new String[]{});
        section("3.4 Subset DP (SOS) – Aggregate Sensor Data over Zone Subsets");
        SubsetDP.main(new String[]{});

        // ── MODULE 4: Network Flow ────────────────────────────────────
        banner("MODULE 4 – NETWORK FLOW (CO4)");
        section("4.1 Ford-Fulkerson (Edmonds-Karp) – Water/Energy/Traffic Flow");
        FordFulkerson.main(new String[]{});
        section("4.2 Dinic's Algorithm – Large City Flow Networks");
        DinicAlgorithm.main(new String[]{});
        section("4.3 Bipartite Matching – Resource to Service Assignment");
        BipartiteMatching.main(new String[]{});

        // ── MODULE 5: NP-Completeness ────────────────────────────────
        banner("MODULE 5 – NP-COMPLETENESS & APPROXIMATION (CO5)");
        section("5.1 SAT / 3-SAT – City Planning Constraint Satisfaction");
        SATSolver.main(new String[]{});
        section("5.2 NP Reductions – 3-SAT → CLIQUE → INDEPENDENT SET → VERTEX COVER");
        NPReductions.main(new String[]{});
        section("5.3 Vertex Cover 2-Approximation – Critical Infrastructure Coverage");
        VertexCover.main(new String[]{});

        // ── MODULE 6: Randomized & Parallel ─────────────────────────
        banner("MODULE 6 – RANDOMIZED & PARALLEL ALGORITHMS (CO6)");
        section("6.1–6.5 Randomized QuickSort / Reservoir Sampling / Miller-Rabin / Parallel Reduce / Blelloch Scan");
        try { RandomizedAlgorithms.main(new String[]{}); }
        catch (Exception e) { System.out.println("Error in module 6: " + e.getMessage()); }

        // ── FULL COMPLEXITY SUMMARY ──────────────────────────────────
        System.out.println();
        System.out.println("==============================================================");
        System.out.println("                 FULL COMPLEXITY SUMMARY                      ");
        System.out.println("==============================================================");
        System.out.println("  Module 1 – String Algorithms");
        System.out.println("    KMP                O(N+M)        O(M)");
        System.out.println("    Z-Function         O(N+M)        O(N+M)");
        System.out.println("    Rabin-Karp         O(N+M) avg    O(1)");
        System.out.println("    Aho-Corasick       O(N+M+Z)      O(M x Sigma)");
        System.out.println("  Module 2 – Suffix Structures");
        System.out.println("    Suffix Array       O(N log N)    O(N)");
        System.out.println("    SA-IS              O(N)          O(N)");
        System.out.println("    LCP/Kasai          O(N)          O(N)");
        System.out.println("    Suffix Automaton   O(N)          O(N)");
        System.out.println("  Module 3 – Advanced DP");
        System.out.println("    Levenshtein        O(NxM)        O(NxM)");
        System.out.println("    Damerau-Lev        O(NxM)        O(NxM)");
        System.out.println("    Bitmask DP         O(2^N x N)    O(2^N)");
        System.out.println("    Matrix-Chain DP    O(N^3)        O(N^2)");
        System.out.println("    Subset/SOS DP      O(N x 2^N)    O(2^N)");
        System.out.println("  Module 4 – Network Flow");
        System.out.println("    Ford-Fulkerson     O(VE^2)       O(V+E)");
        System.out.println("    Dinic's            O(V^2 E)      O(V+E)");
        System.out.println("    Bipartite Match    O(E sqrt(V))  O(V+E)");
        System.out.println("  Module 5 – NP-Completeness");
        System.out.println("    SAT/3-SAT          O(2^N)        O(NxM)   NP-Complete");
        System.out.println("    Clique             O(2^N)        O(V+E)   NP-Complete");
        System.out.println("    Vertex Cover       O(V+E)        O(V+E)   2-Approx");
        System.out.println("  Module 6 – Randomized & Parallel");
        System.out.println("    Rand QuickSort     O(N log N)    O(log N) expected");
        System.out.println("    Reservoir Sample   O(N)          O(K)");
        System.out.println("    Miller-Rabin       O(k log^2 N)  O(1)");
        System.out.println("    Parallel Reduce    O(N/P+log P)  O(N)");
        System.out.println("    Blelloch Scan      O(log N)      O(N)     parallel");
        System.out.println("==============================================================");
        System.out.println("SmartCityX Full Demo Complete.");
    }

    private static void banner(String title) {
        System.out.println();
        System.out.println("==============================================================");
        System.out.println("  " + title);
        System.out.println("==============================================================");
        System.out.println();
    }

    private static void section(String title) {
        System.out.println();
        System.out.println("--------------------------------------------------------------");
        System.out.println("  " + title);
        System.out.println("--------------------------------------------------------------");
    }
}
