# 🏙️ SmartCityX — Integrated Smart-City Analytics Platform

**Team T-04 | DSA Project | CO1–CO6 | All 6 Modules**

SmartCityX is a full-stack smart city management platform where **Data Structures and Algorithms are the core engine** powering every city feature — from citizen report search to emergency resource allocation to infrastructure network analysis.

---

## 📌 Project Overview

| Feature | DSA Algorithm | Module |
|---------|--------------|--------|
| Smart Search (citizen reports) | KMP, Rabin-Karp, Aho-Corasick | M1 |
| Emergency keyword detection | Aho-Corasick | M1 |
| Document similarity analysis | Suffix Array + LCP/Kasai | M2 |
| Citizen query autocorrect | Damerau-Levenshtein | M3 |
| Resource allocation optimizer | Bitmask DP | M3 |
| Water/Energy/Traffic flow | Ford-Fulkerson, Dinic's | M4 |
| City planning constraints | SAT/3-SAT (DPLL) | M5 |
| Critical infrastructure nodes | Vertex Cover 2-Approx | M5 |
| Service request ranking | Randomized QuickSort | M6 |
| IoT stream sampling | Reservoir Sampling | M6 |
| Sensor ID verification | Miller-Rabin | M6 |
| Cumulative zone energy | Blelloch Prefix Scan | M6 |

---

## 🏗️ Architecture

```
Citizen / Admin
      ↓
React Dashboard (Port 5173)
      ↓  HTTP REST API calls
Java DSA Engine (Port 6789)
      ↓  JSON responses
Dashboard displays results
```

**All DSA algorithms run in Java. React only displays results.**

---

## 📁 Project Structure

```
SmartCityX/
├── module1/          ← String Algorithms (CO1)
│   ├── KMP.java
│   ├── ZFunction.java
│   ├── RabinKarp.java
│   └── AhoCorasick.java
├── module2/          ← Suffix Structures (CO2)
│   ├── SuffixArray.java
│   ├── SAIS.java
│   ├── LCPKasai.java
│   └── SuffixAutomaton.java
├── module3/          ← Advanced DP (CO3)
│   ├── EditDistance.java
│   ├── BitmaskDP.java
│   ├── MatrixChainDP.java
│   └── SubsetDP.java
├── module4/          ← Network Flow (CO4)
│   ├── FordFulkerson.java
│   ├── DinicAlgorithm.java
│   └── BipartiteMatching.java
├── module5/          ← NP-Completeness (CO5)
│   ├── SATSolver.java
│   ├── NPReductions.java
│   └── VertexCover.java
├── module6/          ← Randomized & Parallel (CO6)
│   └── RandomizedAlgorithms.java
├── Main.java                    ← Run all 23 algorithms at once
├── Demo.java                    ← Interactive switch-case demo menu
├── SmartCityXServer.java        ← Java REST API server (port 6789)
├── run.bat                      ← One-click run menu
├── SmartCityX_Presentation.html ← Project presentation (open in browser)
├── SmartCityX_OutputReport.html ← Algorithm output report (open in browser)
└── smartcityX-dashboard/        ← React frontend
    └── src/
        ├── pages/               ← 10 dashboard pages
        ├── api/javaApi.ts       ← Calls Java backend
        └── data/                ← City mock dataset
```

---

## 🚀 How to Run

### Option 1 — Interactive Demo (Console)
```bash
# Compile
javac --release 21 -d out module1\*.java module2\*.java module3\*.java module4\*.java module5\*.java module6\*.java Main.java SmartCityXServer.java Demo.java

# Run interactive demo
java -cp out Demo
```
Type any number (1–23) to run that specific algorithm. Type `0` to run all.

### Option 2 — Full Web Dashboard
```bash
# Terminal 1 — Start Java DSA API server
java -cp out SmartCityXServer

# Terminal 2 — Start React dashboard
cd smartcityX-dashboard
npm install
npm run dev
```
Open browser at: **http://localhost:5173**

### Option 3 — One-click (Windows)
Double-click `run.bat` and choose mode.

---

## 📊 Algorithm Complexity Summary

| Algorithm | Time | Space |
|-----------|------|-------|
| KMP | O(N+M) | O(M) |
| Z-Function | O(N+M) | O(N+M) |
| Rabin-Karp | O(N+M) avg | O(1) |
| Aho-Corasick | O(N+M+Z) | O(M×Σ) |
| Suffix Array | O(N log N) | O(N) |
| SA-IS | O(N) | O(N) |
| LCP/Kasai | O(N) | O(N) |
| Suffix Automaton | O(N) | O(N) |
| Levenshtein | O(N×M) | O(N×M) |
| Bitmask DP | O(2^N × N) | O(2^N) |
| Matrix-Chain DP | O(N³) | O(N²) |
| Subset/SOS DP | O(N × 2^N) | O(2^N) |
| Ford-Fulkerson | O(V·E²) | O(V+E) |
| Dinic's | O(V²·E) | O(V+E) |
| Bipartite Match | O(E√V) | O(V+E) |
| SAT/DPLL | O(2^N) | O(N·M) |
| Vertex Cover | O(V+E) | O(V+E) |
| Rand. QuickSort | O(N log N) exp | O(log N) |
| Reservoir Sample | O(N) | O(K) |
| Miller-Rabin | O(k log² N) | O(1) |
| Parallel Reduce | O(N/P + log P) | O(N) |
| Blelloch Scan | O(log N) | O(N) |

---

## 📦 Tech Stack

- **DSA Engine:** Java 21+ (modules 1–6)
- **REST API:** Java built-in HttpServer (port 6789)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 📂 Key Files to Open

| File | How to open | Purpose |
|------|-------------|---------|
| `SmartCityX_Presentation.html` | Chrome browser | Project presentation (14 slides) |
| `SmartCityX_OutputReport.html` | Chrome browser | All 23 algorithm outputs |
| `Demo.java` | `java -cp out Demo` | Interactive algorithm demo |
| `http://localhost:5173` | Chrome (after npm run dev) | Full dashboard |

---

## 👥 Team

**Team T-04** — DSA Project  
SmartCityX — Integrated Smart-City Analytics Platform  
Modules 1–6 | CO1–CO6 | 23 Algorithms
