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
        server.createContext("/api/flow",        new FlowHandler());
        server.createContext("/api/sat",         new SATHandler());
        server.createContext("/api/vertexcover", new VertexCoverHandler());
        server.createContext("/api/randomized",  new RandomizedHandler());

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
        System.out.println("    POST /api/flow         (Ford-Fulkerson / Dinic's / Bipartite)");
        System.out.println("    POST /api/sat          (SAT/3-SAT Solver)");
        System.out.println("    POST /api/vertexcover  (Vertex Cover 2-Approx)");
        System.out.println("    GET  /api/randomized   (QuickSort/Reservoir/MillerRabin/Parallel)");
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

    // ─────────────────────────────────────────────────────────────────
    // POST /api/flow  —  Ford-Fulkerson Max Flow
    // ─────────────────────────────────────────────────────────────────
    static class FlowHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            addCors(ex);
            if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204,-1); return; }
            String body = readBody(ex);
            String type = jsonStr(body, "type");
            int nodes   = (int) jsonLong(body, "nodes");
            int source  = (int) jsonLong(body, "source");
            int sink    = (int) jsonLong(body, "sink");
            if (nodes < 2) nodes = 6; if (nodes > 20) nodes = 20;

            int[][] cap = new int[nodes][nodes];
            // parse edges
            String edgesKey = "\"edges\"";
            int ei = body.indexOf(edgesKey);
            if (ei >= 0) {
                int arrS = body.indexOf('[', ei + edgesKey.length());
                int depth = 0, pos = arrS; StringBuilder sb = new StringBuilder();
                while (pos < body.length()) {
                    char c = body.charAt(pos);
                    if (c=='[') depth++; else if (c==']') { depth--; if (depth==0) break; }
                    sb.append(c); pos++;
                }
                for (String t2 : sb.toString().substring(1).split("\\],?\\s*\\[")) {
                    String[] p = t2.replaceAll("[\\[\\]\\s]","").split(",");
                    try { int u=Integer.parseInt(p[0].trim()),v=Integer.parseInt(p[1].trim()),c2=Integer.parseInt(p[2].trim()); if(u<nodes&&v<nodes)cap[u][v]+=c2; } catch(Exception ig){}
                }
            } else {
                // default water network
                int[][] def = {{0,1,15},{0,2,12},{1,3,10},{1,4,8},{2,4,7},{2,5,10},{3,5,5},{4,5,9}};
                for (int[] e:def) if(e[0]<nodes&&e[1]<nodes) cap[e[0]][e[1]]=e[2];
            }

            int[][] flow = new int[nodes][nodes];
            int totalFlow = 0; int[] parent;
            while ((parent=bfsF(cap,flow,nodes,source,sink))!=null) {
                int pf=Integer.MAX_VALUE;
                for(int v=sink;v!=source;v=parent[v]){int u=parent[v];pf=Math.min(pf,cap[u][v]-flow[u][v]);}
                for(int v=sink;v!=source;v=parent[v]){int u=parent[v];flow[u][v]+=pf;flow[v][u]-=pf;}
                totalFlow+=pf;
            }

            boolean[] vis=new boolean[nodes]; Queue<Integer> q=new LinkedList<>();
            q.add(source);vis[source]=true;
            while(!q.isEmpty()){int u=q.poll();for(int v=0;v<nodes;v++)if(!vis[v]&&cap[u][v]-flow[u][v]>0){vis[v]=true;q.add(v);}}

            List<String> cuts=new ArrayList<>();
            for(int u=0;u<nodes;u++) for(int v=0;v<nodes;v++) if(vis[u]&&!vis[v]&&cap[u][v]>0)
                cuts.add("{\"from\":"+u+",\"to\":"+v+",\"capacity\":"+cap[u][v]+"}");

            List<String> edges=new ArrayList<>();
            for(int u=0;u<nodes;u++) for(int v=0;v<nodes;v++) if(cap[u][v]>0)
                edges.add("{\"from\":"+u+",\"to\":"+v+",\"capacity\":"+cap[u][v]+",\"flow\":"+flow[u][v]+",\"utilization\":"+String.format("%.0f",cap[u][v]>0?flow[u][v]*100.0/cap[u][v]:0)+"}");

            sendJson(ex,200,"{\"maxFlow\":"+totalFlow+",\"source\":"+source+",\"sink\":"+sink+",\"type\":\""+escJson(type)+"\",\"algorithm\":\"Ford-Fulkerson (Edmonds-Karp BFS)\",\"timeComplexity\":\"O(V*E^2)\",\"minCutEdges\":["+String.join(",",cuts)+"],\"edges\":["+String.join(",",edges)+"]}");
        }
        private int[] bfsF(int[][] cap,int[][] flow,int V,int s,int t){
            int[] p=new int[V];Arrays.fill(p,-1);p[s]=s;
            Queue<Integer> q=new LinkedList<>();q.add(s);
            while(!q.isEmpty()&&p[t]==-1){int u=q.poll();for(int v=0;v<V;v++)if(p[v]==-1&&cap[u][v]-flow[u][v]>0){p[v]=u;q.add(v);}}
            return p[t]==-1?null:p;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // POST /api/sat  —  DPLL SAT Solver
    // ─────────────────────────────────────────────────────────────────
    static class SATHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            addCors(ex);
            if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204,-1); return; }
            String body = readBody(ex);
            List<String> vars = jsonStringArray(body, "variables");
            if (vars.isEmpty()) vars = Arrays.asList("RoadA_Open","WaterMain_Working","EmergRoute_Open","PowerGrid_Active","TrafficSignal_On");
            int numVars = vars.size();

            List<List<Integer>> clauses = new ArrayList<>();
            int ci = body.indexOf("\"clauses\"");
            if (ci >= 0) {
                int arrS = body.indexOf('[', ci+9); int depth=0, pos=arrS; StringBuilder sb=new StringBuilder();
                while(pos<body.length()){char c=body.charAt(pos);if(c=='[')depth++;else if(c==']'){depth--;if(depth==0)break;}sb.append(c);pos++;}
                for(String inner:sb.toString().substring(1).split("\\],?\\s*\\[")){
                    List<Integer> clause=new ArrayList<>();
                    for(String lit:inner.replaceAll("[\\[\\]\\s]","").split(",")) try{clause.add(Integer.parseInt(lit.trim()));}catch(Exception ig){}
                    if(!clause.isEmpty()) clauses.add(clause);
                }
            }
            if (clauses.isEmpty()) {
                clauses.add(Arrays.asList(1,2,3));clauses.add(Arrays.asList(-1,4,5));
                clauses.add(Arrays.asList(2,-4,3));clauses.add(Arrays.asList(-2,-3,4));clauses.add(Arrays.asList(1,-5,2));
            }

            int[] assignment = new int[numVars+1];
            boolean sat = dpll(clauses, assignment, numVars, 1);

            List<String> asgn=new ArrayList<>();
            for(int i=1;i<=numVars;i++){String n2=i<=vars.size()?vars.get(i-1):"Var"+i;asgn.add("{\"variable\":\""+escJson(n2)+"\",\"value\":"+(assignment[i]==1?"true":"false")+"}");}

            List<String> clauseStrs=new ArrayList<>();
            for(List<Integer> cl:clauses){List<String> lits=new ArrayList<>();for(int lit:cl){String n2=Math.abs(lit)<=vars.size()?vars.get(Math.abs(lit)-1):"Var"+Math.abs(lit);lits.add((lit<0?"NOT ":"")+n2);}clauseStrs.add("\""+escJson(String.join(" OR ",lits))+"\"");}

            sendJson(ex,200,"{\"satisfiable\":"+sat+",\"numVars\":"+numVars+",\"numClauses\":"+clauses.size()+",\"algorithm\":\"DPLL\",\"timeComplexity\":\"O(2^N)\",\"npcomplete\":true,\"assignment\":["+String.join(",",asgn)+"],\"clauses\":["+String.join(",",clauseStrs)+"]}");
        }
        private boolean dpll(List<List<Integer>> cls,int[] a,int n,int var){
            if(var>n){for(List<Integer>cl:cls){boolean ok=false;for(int l:cl)if((l>0&&a[Math.abs(l)]==1)||(l<0&&a[Math.abs(l)]==-1)){ok=true;break;}if(!ok)return false;}return true;}
            a[var]=1;if(dpll(cls,a,n,var+1))return true;a[var]=-1;if(dpll(cls,a,n,var+1))return true;a[var]=0;return false;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // POST /api/vertexcover  —  2-Approximation Vertex Cover
    // ─────────────────────────────────────────────────────────────────
    static class VertexCoverHandler implements HttpHandler {
        public void handle(HttpExchange ex) throws IOException {
            addCors(ex);
            if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204,-1); return; }
            String body = readBody(ex);
            List<String> nodeNames = jsonStringArray(body, "nodes");
            if (nodeNames.isEmpty()) nodeNames = Arrays.asList("CentralHub","PumpStation","Substation","Junction4","TrafficNode","WaterTower","FireStation","Hospital");

            List<int[]> edges=new ArrayList<>();
            int ei=body.indexOf("\"edges\"");
            if(ei>=0){
                int arrS=body.indexOf('[',ei+7),depth=0,pos=arrS;StringBuilder sb=new StringBuilder();
                while(pos<body.length()){char c=body.charAt(pos);if(c=='[')depth++;else if(c==']'){depth--;if(depth==0)break;}sb.append(c);pos++;}
                for(String pair:sb.toString().substring(1).split("\\],?\\s*\\[")){String[]p=pair.replaceAll("[\\[\\]\\s]","").split(",");if(p.length>=2)try{edges.add(new int[]{Integer.parseInt(p[0].trim()),Integer.parseInt(p[1].trim())});}catch(Exception ig){}}
            } else {
                int[][]def={{0,1},{0,2},{1,3},{1,4},{2,4},{2,5},{3,6},{4,6},{5,7},{6,7}};
                for(int[]e:def)edges.add(e);
            }

            Set<Integer> cover=new HashSet<>();boolean[]matched=new boolean[edges.size()];
            for(int i=0;i<edges.size();i++){if(!matched[i]){int u=edges.get(i)[0],v=edges.get(i)[1];cover.add(u);cover.add(v);for(int j=i+1;j<edges.size();j++)if(edges.get(j)[0]==u||edges.get(j)[1]==u||edges.get(j)[0]==v||edges.get(j)[1]==v)matched[j]=true;}}

            boolean valid=true;for(int[]e:edges)if(!cover.contains(e[0])&&!cover.contains(e[1])){valid=false;break;}

            List<String> cn=new ArrayList<>();for(int n2:cover)if(n2<nodeNames.size())cn.add("\""+escJson(nodeNames.get(n2))+"\"");
            List<String> el=new ArrayList<>();
            for(int[]e:edges){String un=e[0]<nodeNames.size()?nodeNames.get(e[0]):"N"+e[0];String vn=e[1]<nodeNames.size()?nodeNames.get(e[1]):"N"+e[1];boolean cov=cover.contains(e[0])||cover.contains(e[1]);el.add("{\"from\":\""+escJson(un)+"\",\"to\":\""+escJson(vn)+"\",\"covered\":"+cov+"}");}

            sendJson(ex,200,"{\"coverSize\":"+cover.size()+",\"totalNodes\":"+nodeNames.size()+",\"totalEdges\":"+edges.size()+",\"coversAllEdges\":"+valid+",\"approximationRatio\":\"2x optimal\",\"algorithm\":\"Vertex Cover 2-Approximation\",\"timeComplexity\":\"O(V+E)\",\"npcomplete\":true,\"coverNodes\":["+String.join(",",cn)+"],\"edges\":["+String.join(",",el)+"]}");
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // GET /api/randomized  —  All Module 6 algorithms
    // ─────────────────────────────────────────────────────────────────
    static class RandomizedHandler implements HttpHandler {
        static final java.util.Random RNG = new java.util.Random(42);
        public void handle(HttpExchange ex) throws IOException {
            addCors(ex);
            if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204,-1); return; }

            // 1. Randomized QuickSort
            int[] orig={45,92,13,78,56,31,88,24,67,99,42,15,73,60,37};
            int[] sorted=orig.clone(); rqs(sorted,0,sorted.length-1);
            List<String> sl=new ArrayList<>();for(int v:sorted)sl.add(String.valueOf(v));
            List<String> ol=new ArrayList<>();for(int v:orig)ol.add(String.valueOf(v));

            // 2. Reservoir Sampling
            int[] stream=new int[500];for(int i=0;i<500;i++)stream[i]=20+RNG.nextInt(80);
            int[] res=Arrays.copyOf(stream,10);
            for(int i=10;i<stream.length;i++){int j=RNG.nextInt(i+1);if(j<10)res[j]=stream[i];}
            List<String> rsamp=new ArrayList<>();for(int v:res)rsamp.add(String.valueOf(v));

            // 3. Miller-Rabin
            long[] nums={104729L,104730L,999983L,1000003L,15485863L};
            List<String> mr=new ArrayList<>();
            for(long n:nums)mr.add("{\"number\":"+n+",\"isPrime\":"+millerRabin(n,10)+"}");

            // 4. Parallel Reduce
            int[] readings=new int[100];long sum=0;
            for(int i=0;i<100;i++){readings[i]=RNG.nextInt(100);sum+=readings[i];}

            // 5. Blelloch Scan
            int[] ze={120,85,200,95,140,175,60,110};
            String[]zn={"Zone-A","Zone-B","Zone-C","Zone-D","Zone-E","Zone-F","Zone-G","Zone-H"};
            int[] sc=blelloch(ze.clone());
            List<String> zones=new ArrayList<>();
            for(int i=0;i<ze.length;i++)zones.add("{\"zone\":\""+zn[i]+"\",\"load\":"+ze[i]+",\"cumulative\":"+sc[i]+"}");

            sendJson(ex,200,"{\"quickSort\":{\"inputSize\":"+orig.length+",\"original\":["+String.join(",",ol)+"],\"sorted\":["+String.join(",",sl)+"],\"algorithm\":\"Randomized QuickSort\",\"complexity\":\"O(N log N) expected\"},"
                +"\"reservoirSample\":{\"streamSize\":500,\"sampleSize\":10,\"sample\":["+String.join(",",rsamp)+"],\"algorithm\":\"Reservoir Sampling\",\"complexity\":\"O(N) time O(K) space\"},"
                +"\"millerRabin\":{\"results\":["+String.join(",",mr)+"],\"algorithm\":\"Miller-Rabin\",\"rounds\":10},"
                +"\"parallelReduce\":{\"dataSize\":100,\"sum\":"+sum+",\"algorithm\":\"Parallel Reduce\",\"complexity\":\"O(N/P + log P)\"},"
                +"\"blellochScan\":{\"zones\":["+String.join(",",zones)+"],\"algorithm\":\"Blelloch Prefix Scan\",\"complexity\":\"O(log N) parallel\"}"
                +"}");
        }
        private void rqs(int[]a,int lo,int hi){if(lo<hi){int p=pt(a,lo,hi);rqs(a,lo,p-1);rqs(a,p+1,hi);}}
        private int pt(int[]a,int lo,int hi){int pi=lo+RNG.nextInt(hi-lo+1);int t=a[pi];a[pi]=a[hi];a[hi]=t;int pv=a[hi],i=lo-1;for(int j=lo;j<hi;j++)if(a[j]<=pv){i++;int tmp=a[i];a[i]=a[j];a[j]=tmp;}int tmp=a[i+1];a[i+1]=a[hi];a[hi]=tmp;return i+1;}
        private boolean millerRabin(long n,int rounds){if(n<2)return false;if(n==2||n==3)return true;if(n%2==0)return false;long d=n-1;int r=0;while(d%2==0){d/=2;r++;}for(int i=0;i<rounds;i++){long a=2+(long)(RNG.nextDouble()*(n-4));long x=mp(a,d,n);if(x==1||x==n-1)continue;boolean comp=true;for(int j=0;j<r-1;j++){x=mp(x,2,n);if(x==n-1){comp=false;break;}}if(comp)return false;}return true;}
        private long mp(long b,long e,long m){long r=1;b%=m;while(e>0){if((e&1)==1)r=r*b%m;b=b*b%m;e>>=1;}return r;}
        private int[] blelloch(int[]a){int n=a.length;for(int d=1;d<n;d<<=1)for(int i=0;i<n;i+=2*d)if(i+2*d-1<n)a[i+2*d-1]+=a[i+d-1];a[n-1]=0;for(int d=n/2;d>=1;d>>=1)for(int i=0;i<n;i+=2*d)if(i+2*d-1<n){int t=a[i+d-1];a[i+d-1]=a[i+2*d-1];a[i+2*d-1]+=t;}return a;}
    }

    static String escHtml(String s) { return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;"); }
}
