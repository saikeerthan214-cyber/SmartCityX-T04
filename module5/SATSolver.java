package module5;

import java.util.*;

/**
 * SAT / 3-SAT Solver (DPLL Algorithm)
 * SmartCityX Use Case: City planning constraint satisfaction —
 * e.g., "If road A is closed AND water main B is broken, THEN emergency route C must be open"
 *
 * Time Complexity:  O(2^N) worst case (NP-Complete)
 * Space Complexity: O(N * M) where N=variables, M=clauses
 */
public class SATSolver {

    /**
     * DPLL-based SAT solver.
     * @param clauses  List of clauses; each clause is a list of literals.
     *                 Positive integer = variable, Negative = negated variable.
     * @param numVars  Number of boolean variables
     * @return satisfying assignment or null if UNSAT
     */
    public static int[] solve(List<List<Integer>> clauses, int numVars) {
        int[] assignment = new int[numVars + 1]; // 0=unset, 1=true, -1=false
        return dpll(clauses, assignment, numVars, 1) ? assignment : null;
    }

    private static boolean dpll(List<List<Integer>> clauses, int[] assignment, int numVars, int var) {
        if (var > numVars) return evaluate(clauses, assignment);

        // Try true
        assignment[var] = 1;
        if (dpll(clauses, assignment, numVars, var + 1)) return true;

        // Try false
        assignment[var] = -1;
        if (dpll(clauses, assignment, numVars, var + 1)) return true;

        assignment[var] = 0;
        return false;
    }

    private static boolean evaluate(List<List<Integer>> clauses, int[] assignment) {
        for (List<Integer> clause : clauses) {
            boolean clauseSat = false;
            for (int lit : clause) {
                int var = Math.abs(lit);
                int val = assignment[var];
                if ((lit > 0 && val == 1) || (lit < 0 && val == -1)) {
                    clauseSat = true; break;
                }
            }
            if (!clauseSat) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println("=== SAT/3-SAT Solver – SmartCityX Demo ===\n");

        // City Planning Constraints:
        // Variables:
        //   1 = RoadA_Open
        //   2 = WaterMainB_Working
        //   3 = EmergencyRouteC_Open
        //   4 = PowerGridD_Active
        //   5 = TrafficSignal_On

        System.out.println("City Planning Variables:");
        System.out.println("  1=RoadA_Open  2=WaterMainB  3=EmergencyRoute  4=PowerGrid  5=TrafficSignal");
        System.out.println();

        // 3-SAT Clauses (each has exactly 3 literals):
        // C1: RoadA OR WaterMain OR EmergencyRoute (at least one must be operational)
        // C2: NOT RoadA OR PowerGrid OR TrafficSignal
        // C3: WaterMain OR NOT PowerGrid OR EmergencyRoute
        // C4: NOT WaterMain OR NOT EmergencyRoute OR PowerGrid
        // C5: RoadA OR NOT TrafficSignal OR WaterMain
        List<List<Integer>> clauses = new ArrayList<>();
        clauses.add(Arrays.asList(1, 2, 3));
        clauses.add(Arrays.asList(-1, 4, 5));
        clauses.add(Arrays.asList(2, -4, 3));
        clauses.add(Arrays.asList(-2, -3, 4));
        clauses.add(Arrays.asList(1, -5, 2));

        System.out.println("3-SAT Clauses:");
        String[] varNames = {"", "RoadA", "WaterMain", "EmergRoute", "PowerGrid", "TrafficSig"};
        for (int i = 0; i < clauses.size(); i++) {
            System.out.print("  C" + (i+1) + ": ");
            List<Integer> cl = clauses.get(i);
            for (int j = 0; j < cl.size(); j++) {
                int lit = cl.get(j);
                System.out.print((lit < 0 ? "NOT " : "") + varNames[Math.abs(lit)]);
                if (j < cl.size()-1) System.out.print(" OR ");
            }
            System.out.println();
        }
        System.out.println();

        int[] result = solve(clauses, 5);
        if (result != null) {
            System.out.println("SATISFIABLE — City planning constraints can be met!");
            System.out.println("Assignment:");
            for (int i = 1; i <= 5; i++)
                System.out.println("  " + varNames[i] + " = " + (result[i] == 1 ? "TRUE (Active)" : "FALSE (Inactive)"));
        } else {
            System.out.println("UNSATISFIABLE — Constraints conflict, city planning impossible.");
        }

        System.out.println();

        // UNSAT example
        List<List<Integer>> unsat = new ArrayList<>();
        unsat.add(Arrays.asList(1));      // RoadA must be true
        unsat.add(Arrays.asList(-1));     // RoadA must be false
        System.out.println("UNSAT Example (contradictory constraints):");
        System.out.println("  Clause 1: RoadA = TRUE");
        System.out.println("  Clause 2: RoadA = FALSE");
        System.out.println("  Result: " + (solve(unsat, 1) == null ? "UNSATISFIABLE (as expected)" : "SAT"));
    }
}
