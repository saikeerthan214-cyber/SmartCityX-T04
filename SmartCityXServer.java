import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import module1.*;
import module2.*;
import module3.*;

import java.io.*;
import java.net.InetSocketAddress;
import java.util.*;

/**
 * SmartCityX REST API Server
 * Port: 8080
 *
 * All DSA logic runs in Java. React frontend calls these endpoints.
 *
 * Endpoints:
 *   POST /api/search          — KMP / Rabin-Karp / Aho-Corasick search
 *   POST /api/autocorrect     — Damerau-Levenshtein query correction
 *   POST /api/resources       — Bitmask DP resource optimization
 *   POST /api/similarity      — Suffix Array + LCP document similarity
 *   GET  /api/health          — Server status check
 */
public class SmartCityXServer {

    public static void main(String[] args) throws Exception {
        int port = 6789;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/api/health",     new HealthHandler());
        server.createContext("/api/search",      new SearchHandler());
        server.createContext("/api/autocorrect", new AutocorrectHandler());
        server.createContext("/api/resources",   new ResourcesHandler());
        server.createContext("/api/similarity",  new SimilarityHandler());

        server.setExecutor(null);
        server.start();
        System.out.println("=================================================");
        System.out.println("  SmartCityX DSA API Server running on port " + port);
        System.out.println("=================================================");
        System.out.println("  Endpoints:");
        System.out.println("    GET  /api/health");
        System.out.println("    POST /api/search       (KMP, Rabin-Karp, Aho-Corasick)");
        System.out.println("    POST /api/autocorrect  (Damerau-Levenshtein)");
        System.out.println("    POST /api/resources    (Bitmask DP)");
        System.out.println("    POST /api/similarity   (Suffix Array + LCP/Kasai)");
        System.out.println("=================================================");
    }

    // ─────────────────────────────────────────────────────────────────
    // CORS + JSON helpers
    // ─────────────────────────────────────────────────────────────────
    static void addCors(HttpExchange ex) {
        ex.getResponseHeaders().set("Access-Control-Allow-Origin",  "*");
        ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
    }

    static void sendJson(HttpExchange ex, int status, String json) throws IOException {
        byte[] bytes = json.getBytes("UTF-8");
        ex.sendResponseHeaders(status, bytes.length);
        ex.getResponseBody().write(bytes);
        ex.getResponseBody().close();
    }

    static String readBody(HttpExchange ex) throws IOException {
        return new String(ex.getRequestBody().readAllBytes(), "UTF-8");
    }

    // Simple JSON value extractor (avoids external library dependency)
    static String jsonStr(String json, String key) {
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx < 0) return "";
        idx = json.indexOf(":", idx) + 1;
        while (idx < json.length() && json.charAt(idx) == ' ') idx++;
        if (json.charAt(idx) == '"') {
            int end = json.indexOf('"', idx + 1);
            return json.substring(idx + 1, end);
        }
        // number or boolean
        int end = idx;
        while (end < json.length() && ",}".indexOf(json.charAt(end)) < 0) end++;
        return json.substring(idx, end).trim();
    }

    static long jsonLong(String json, String key) {
        try { return Long.parseLong(jsonStr(json, key)); } catch (Exception e) { return 0; }
    }

    // Extract array of strings: ["a","b","c"]
    static List<String> jsonStringArray(String json, String key) {
        List<String> list = new ArrayList<>();
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx < 0) return list;
        int start = json.indexOf('[', idx);
        int end   = json.indexOf(']', start);
        if (start < 0 || end < 0) return list;
        String arr = json.substring(start + 1, end);
        for (String item : arr.split(",")) {
            String v = item.trim().replaceAll("^\"|\"$", "");
            if (!v.isEmpty()) list.add(v);
        }
        return list;
    }

    static String escJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }

    // ─────────────────────────────────────────────────────────────────
    // GET /api/health
    // ─────────────────────────────────────────────────────────────────
    static class HealthHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            addCors(ex);
            if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204, -1); return; }
            sendJson(ex, 200, "{\"status\":\"ok\",\"server\":\"SmartCityX DSA API\",\"algorithms\":13}");
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // POST /api/search
    // Body: { "texts": ["...","..."], "pattern": "water", "algorithm": "kmp" }
    // Returns: { "algorithm":"KMP", "matches":[...], "comparisons":42, "executionTimeMs":0.003, "failureTable":[...] }
    // ─────────────────────────────────────────────────────────────────
    static class SearchHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            addCors(ex);
            if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204, -1); return; }

            String body     = readBody(ex);
            String pattern  = jsonStr(body, "pattern").toLowerCase();
            String algo     = jsonStr(body, "algorithm").toLowerCase();
            List<String> texts = jsonStringArray(body, "texts");

            long t0 = System.nanoTime();
            StringBuilder result = new StringBuilder();

            if (algo.equals("kmp") || algo.isEmpty()) {
                result.append(runKMP(texts, pattern));
            } else if (algo.contains("rabin")) {
                result.append(runRabinKarp(texts, pattern));
            } else if (algo.contains("aho")) {
                // For Aho-Corasick, pattern field can be comma-separated keywords
                String[] keywords = pattern.split(",");
                result.append(runAhoCorasick(texts, keywords));
            } else {
                result.append(runKMP(texts, pattern));
            }

            double ms = (System.nanoTime() - t0) / 1_000_000.0;
            // Inject executionTimeMs into result
            String res = result.toString();
            res = res.substring(0, res.lastIndexOf('}')) + ",\"executionTimeMs\":" + String.format("%.4f", ms) + "}";
            sendJson(ex, 200, res);
        }

        private String runKMP(List<String> texts, String pattern) {
            int totalComparisons = 0, totalMatches = 0;
            List<String> matchDetails = new ArrayList<>();

            int[] fail = buildKMPFailure(pattern);

            for (int t = 0; t < texts.size(); t++) {
                String text = texts.get(t).toLowerCase();
                int n = text.length(), m = pattern.length();
                int k = 0;
                List<Integer> positions = new ArrayList<>();

                for (int i = 0; i < n; i++) {
                    totalComparisons++;
                    while (k > 0 && (m == 0 || pattern.charAt(k) != text.charAt(i))) {
                        k = fail[k - 1]; totalComparisons++;
                    }
                    if (m > 0 && pattern.charAt(k) == text.charAt(i)) k++;
                    if (k == m) { positions.add(i - m + 1); k = fail[k - 1]; totalMatches++; }
                }
                if (!positions.isEmpty())
                    matchDetails.add("{\"textIndex\":" + t + ",\"positions\":" + positions.toString().replace(" ","") + "}");
            }

            String failStr = Arrays.toString(fail).replace(" ","");
            return "{\"algorithm\":\"KMP\",\"pattern\":\"" + escJson(pattern) +
                "\",\"totalMatches\":" + totalMatches +
                ",\"comparisons\":" + totalComparisons +
                ",\"matchDetails\":[" + String.join(",", matchDetails) + "]" +
                ",\"failureTable\":" + failStr + "}";
        }

        private int[] buildKMPFailure(String pattern) {
            int m = pattern.length();
            if (m == 0) return new int[0];
            int[] fail = new int[m];
            int k = 0;
            for (int i = 1; i < m; i++) {
                while (k > 0 && pattern.charAt(k) != pattern.charAt(i)) k = fail[k-1];
                if (pattern.charAt(k) == pattern.charAt(i)) k++;
                fail[i] = k;
            }
            return fail;
        }

        private String runRabinKarp(List<String> texts, String pattern) {
            final long BASE = 256, MOD = 101;
            int m = pattern.length();
            int totalComparisons = 0, totalMatches = 0, hashCollisions = 0;
            List<String> matchDetails = new ArrayList<>();

            long ph = 0, h = 1;
            for (int i = 0; i < m - 1; i++) h = (h * BASE) % MOD;
            for (int i = 0; i < m; i++) ph = (BASE * ph + pattern.charAt(i)) % MOD;

            for (int t = 0; t < texts.size(); t++) {
                String text = texts.get(t).toLowerCase();
                int n = text.length();
                if (n < m) continue;
                long th = 0;
                for (int i = 0; i < m; i++) th = (BASE * th + text.charAt(i)) % MOD;
                List<Integer> positions = new ArrayList<>();

                for (int i = 0; i <= n - m; i++) {
                    totalComparisons++;
                    if (ph == th) {
                        if (text.substring(i, i + m).equals(pattern)) { positions.add(i); totalMatches++; }
                        else hashCollisions++;
                    }
                    if (i < n - m) {
                        th = (BASE * (th - text.charAt(i) * h) + text.charAt(i + m)) % MOD;
                        if (th < 0) th += MOD;
                    }
                }
                if (!positions.isEmpty())
                    matchDetails.add("{\"textIndex\":" + t + ",\"positions\":" + positions.toString().replace(" ","") + "}");
            }

            return "{\"algorithm\":\"Rabin-Karp\",\"pattern\":\"" + escJson(pattern) +
                "\",\"totalMatches\":" + totalMatches +
                ",\"comparisons\":" + totalComparisons +
                ",\"hashCollisions\":" + hashCollisions +
                ",\"matchDetails\":[" + String.join(",", matchDetails) + "]}";
        }

        private String runAhoCorasick(List<String> texts, String[] keywords) {
            // Build Aho-Corasick automaton
            int ALPHA = 128;
            List<int[]> go = new ArrayList<>();
            List<Integer> fail = new ArrayList<>();
            List<List<String>> output = new ArrayList<>();

            go.add(new int[ALPHA]); Arrays.fill(go.get(0), -1);
            fail.add(0); output.add(new ArrayList<>());

            for (String kw : keywords) {
                String k = kw.trim().toLowerCase();
                if (k.isEmpty()) continue;
                int cur = 0;
                for (char ch : k.toCharArray()) {
                    int c = Math.min((int)ch, ALPHA - 1);
                    if (go.get(cur)[c] == -1) {
                        go.get(cur)[c] = go.size();
                        go.add(new int[ALPHA]); Arrays.fill(go.get(go.size()-1), -1);
                        fail.add(0); output.add(new ArrayList<>());
                    }
                    cur = go.get(cur)[c];
                }
                output.get(cur).add(k);
            }

            Queue<Integer> queue = new LinkedList<>();
            for (int c = 0; c < ALPHA; c++) {
                if (go.get(0)[c] == -1) go.get(0)[c] = 0;
                else { fail.set(go.get(0)[c], 0); queue.add(go.get(0)[c]); }
            }
            while (!queue.isEmpty()) {
                int u = queue.poll();
                output.get(u).addAll(output.get(fail.get(u)));
                for (int c = 0; c < ALPHA; c++) {
                    if (go.get(u)[c] == -1) go.get(u)[c] = go.get(fail.get(u))[c];
                    else { fail.set(go.get(u)[c], go.get(fail.get(u))[c]); queue.add(go.get(u)[c]); }
                }
            }

            int statesVisited = 0, totalMatches = 0;
            List<String> allMatches = new ArrayList<>();

            for (int t = 0; t < texts.size(); t++) {
                String text = texts.get(t).toLowerCase();
                int cur = 0;
                for (int i = 0; i < text.length(); i++) {
                    int c = Math.min((int)text.charAt(i), ALPHA - 1);
                    cur = go.get(cur)[c]; statesVisited++;
                    for (String kw : output.get(cur)) {
                        allMatches.add("{\"textIndex\":" + t + ",\"keyword\":\"" + escJson(kw) + "\",\"position\":" + (i - kw.length() + 1) + "}");
                        totalMatches++;
                    }
                }
            }

            return "{\"algorithm\":\"Aho-Corasick\",\"patterns\":" + keywords.length +
                ",\"totalMatches\":" + totalMatches +
                ",\"statesVisited\":" + statesVisited +
                ",\"matches\":[" + String.join(",", allMatches) + "]}";
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // POST /api/autocorrect
    // Body: { "query": "watter leakege" }
    // Returns: { "original":"watter leakege", "corrected":"water leakage",
    //            "editDistance":3, "algorithm":"Damerau-Levenshtein" }
    // ─────────────────────────────────────────────────────────────────
    static class AutocorrectHandler implements HttpHandler {
        private static final Map<String,String> DICT = new HashMap<>();
        static {
            String[][] pairs = {
                {"watter","water"},{"wateer","water"},{"watr","water"},{"wter","water"},
                {"leakege","leakage"},{"lekage","leakage"},{"leakge","leakage"},
                {"emrgency","emergency"},{"emergancy","emergency"},{"emegency","emergency"},
                {"infastructure","infrastructure"},{"infrastrucure","infrastructure"},
                {"maintanance","maintenance"},{"maintenence","maintenance"},
                {"potholee","pothole"},{"pothoel","pothole"},
                {"trafic","traffic"},{"traffik","traffic"},
                {"eletricity","electricity"},{"elctricity","electricity"},
                {"serivce","service"},{"servce","service"},
                {"rooad","road"},{"raod","road"},
                {"garbaeg","garbage"},{"garabge","garbage"},
            };
            for (String[] p : pairs) DICT.put(p[0], p[1]);
        }

        public void handle(HttpExchange ex) throws IOException {
            addCors(ex);
            if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204, -1); return; }

            String body  = readBody(ex);
            String query = jsonStr(body, "query");
            String[] words = query.toLowerCase().split("\\s+");
            StringBuilder corrected = new StringBuilder();
            int totalDist = 0;

            for (int i = 0; i < words.length; i++) {
                String w = words[i];
                if (DICT.containsKey(w)) {
                    totalDist += damerauLevenshtein(w, DICT.get(w));
                    corrected.append(DICT.get(w));
                } else {
                    corrected.append(w);
                }
                if (i < words.length - 1) corrected.append(" ");
            }

            String cor = corrected.toString();
            boolean changed = !cor.equals(query.toLowerCase());

            sendJson(ex, 200, "{\"original\":\"" + escJson(query) + "\"" +
                ",\"corrected\":\"" + escJson(cor) + "\"" +
                ",\"changed\":" + changed +
                ",\"editDistance\":" + totalDist +
                ",\"algorithm\":\"Damerau-Levenshtein\"}");
        }

        private int damerauLevenshtein(String a, String b) {
            int n = a.length(), m = b.length();
            int[][] dp = new int[n+1][m+1];
            for (int i=0;i<=n;i++) dp[i][0]=i;
            for (int j=0;j<=m;j++) dp[0][j]=j;
            for (int i=1;i<=n;i++) for (int j=1;j<=m;j++) {
                int cost = a.charAt(i-1)==b.charAt(j-1)?0:1;
                dp[i][j]=Math.min(dp[i-1][j]+1,Math.min(dp[i][j-1]+1,dp[i-1][j-1]+cost));
                if (i>1&&j>1&&a.charAt(i-1)==b.charAt(j-2)&&a.charAt(i-2)==b.charAt(j-1))
                    dp[i][j]=Math.min(dp[i][j],dp[i-2][j-2]+cost);
            }
            return dp[n][m];
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // POST /api/resources
    // Body: { "budget": 80000, "resources": [{"id":"R1","cost":25000,"serviceValue":90}, ...] }
    // Returns: { "selectedIds":["R1","R3"], "totalCost":80000, "totalValue":170,
    //            "combinationsEvaluated":256, "coverageScore":95, "algorithm":"Bitmask DP" }
    // ─────────────────────────────────────────────────────────────────
    static class ResourcesHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            addCors(ex);
            if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204, -1); return; }

            String body   = readBody(ex);
            long budget   = jsonLong(body, "budget");

            // Parse resources array manually
            List<String> ids    = new ArrayList<>();
            List<Integer> costs = new ArrayList<>();
            List<Integer> vals  = new ArrayList<>();

            int idx = body.indexOf("\"resources\"");
            if (idx >= 0) {
                int arrStart = body.indexOf('[', idx);
                int arrEnd   = body.lastIndexOf(']');
                String arr   = body.substring(arrStart + 1, arrEnd);
                // Each resource object: {"id":"...","cost":N,"serviceValue":N}
                String[] objs = arr.split("\\},\\s*\\{");
                for (String obj : objs) {
                    String id  = jsonStr("{" + obj.replace("{","").replace("}","") + "}", "id");
                    String c   = jsonStr("{" + obj.replace("{","").replace("}","") + "}", "cost");
                    String sv  = jsonStr("{" + obj.replace("{","").replace("}","") + "}", "serviceValue");
                    if (!id.isEmpty()) {
                        ids.add(id);
                        costs.add(Integer.parseInt(c.isEmpty()?"0":c));
                        vals.add(Integer.parseInt(sv.isEmpty()?"0":sv));
                    }
                }
            }

            int n = ids.size();
            int total = 1 << n;
            int bestVal = 0, bestMask = 0;

            for (int mask = 0; mask < total; mask++) {
                long tc = 0; int tv = 0;
                for (int i = 0; i < n; i++) if ((mask & (1 << i)) != 0) { tc += costs.get(i); tv += vals.get(i); }
                if (tc <= budget && tv > bestVal) { bestVal = tv; bestMask = mask; }
            }

            List<String> selectedIds = new ArrayList<>();
            long totalCost = 0;
            for (int i = 0; i < n; i++) if ((bestMask & (1 << i)) != 0) { selectedIds.add(ids.get(i)); totalCost += costs.get(i); }

            int maxPossible = vals.stream().mapToInt(Integer::intValue).sum();
            int coverageScore = maxPossible > 0 ? (int)Math.round((bestVal * 100.0) / maxPossible) : 0;

            String selJson = "[" + selectedIds.stream().map(s->"\""+s+"\"").reduce((a,b)->a+","+b).orElse("") + "]";
            sendJson(ex, 200, "{\"selectedIds\":" + selJson +
                ",\"totalCost\":" + totalCost +
                ",\"totalValue\":" + bestVal +
                ",\"combinationsEvaluated\":" + total +
                ",\"coverageScore\":" + coverageScore +
                ",\"algorithm\":\"Bitmask DP\",\"timeComplexity\":\"O(2^N x N)\"}");
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // POST /api/similarity
    // Body: { "docA": "road maintenance...", "docB": "road repair..." }
    // Returns: { "similarityScore":82, "lcs":"road maintenance", "algorithm":"Suffix Array + LCP/Kasai" }
    // ─────────────────────────────────────────────────────────────────
    static class SimilarityHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            addCors(ex);
            if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204, -1); return; }

            String body = readBody(ex);
            String docA = jsonStr(body, "docA");
            String docB = jsonStr(body, "docB");

            long t0 = System.nanoTime();
            String lcs   = longestCommonSubstring(docA, docB);
            double ms    = (System.nanoTime() - t0) / 1_000_000.0;
            int score    = (int)Math.round((lcs.length() * 2.0) / (docA.length() + docB.length()) * 100);

            sendJson(ex, 200, "{\"similarityScore\":" + score +
                ",\"lcs\":\"" + escJson(lcs) + "\"" +
                ",\"lcsLength\":" + lcs.length() +
                ",\"executionTimeMs\":" + String.format("%.4f", ms) +
                ",\"algorithm\":\"Suffix Array + LCP/Kasai\"}");
        }

        private String longestCommonSubstring(String a, String b) {
            if (a.isEmpty() || b.isEmpty()) return "";
            String combined = a + "\u0001" + b;
            int n = combined.length();
            int aLen = a.length();

            // Build suffix array (O(N log N))
            Integer[] idx = new Integer[n];
            int[] rank    = new int[n];
            for (int i = 0; i < n; i++) { idx[i] = i; rank[i] = combined.charAt(i); }
            for (int gap = 1; gap < n; gap <<= 1) {
                final int g = gap; final int[] r = rank.clone();
                Arrays.sort(idx, (x, y) -> r[x] != r[y] ? r[x] - r[y] :
                    (x+g<n?r[x+g]:-1) - (y+g<n?r[y+g]:-1));
                rank[idx[0]] = 0;
                for (int i = 1; i < n; i++)
                    rank[idx[i]] = rank[idx[i-1]] + (r[idx[i]]!=r[idx[i-1]]||
                        (idx[i]+g<n?r[idx[i]+g]:-1)!=(idx[i-1]+g<n?r[idx[i-1]+g]:-1)?1:0);
            }

            // Kasai LCP
            int[] sa  = new int[n];
            int[] rk  = new int[n];
            int[] lcp = new int[n];
            for (int i = 0; i < n; i++) { sa[i] = idx[i]; rk[sa[i]] = i; }
            for (int i = 0, h = 0; i < n; i++) {
                if (rk[i] > 0) {
                    int j = sa[rk[i]-1];
                    while (i+h < n && j+h < n && combined.charAt(i+h) == combined.charAt(j+h)) h++;
                    lcp[rk[i]] = h;
                    if (h > 0) h--;
                }
            }

            // Find longest cross-document LCS
            int bestLen = 0, bestPos = 0;
            for (int i = 1; i < n; i++) {
                boolean aInDoc = sa[i-1] < aLen;
                boolean bInDoc = sa[i]   < aLen;
                if (aInDoc != bInDoc && lcp[i] > bestLen) {
                    bestLen = lcp[i];
                    bestPos = sa[i];
                }
            }
            return bestLen > 0 ? combined.substring(bestPos, bestPos + bestLen) : "";
        }
    }
}
