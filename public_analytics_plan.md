# Plan: Public Server-Side Per-Game & Total Daily Unique Visitor Counting

**Goal:** To count unique daily visitors per game mode and total unique daily visitors to `typetutor.org` using a server-side approach, displayed on a public, unprotected statistics page, while adhering to GDPR principles.

**Core Idea:** Fresh middleware will identify the game mode from the URL, then store a daily salted hash of the client's IP, associated with that game mode, in Deno KV. A new public page will query this data to display the statistics.

**Steps:**

1.  **Identify Game Modes:**
    *   Define logic to extract a `gameModeId` from the request URL path (e.g., `/quotes` -> `quotes`, `/` -> `home`).
    *   **Files to be created/modified:** Logic likely within the middleware.

2.  **Fresh Middleware (`middleware/analytics.ts`):**
    *   Applied globally or to relevant routes.
    *   Extracts client IP (`ctx.remoteAddr.hostname`) and `gameModeId` from `ctx.url.pathname`.
    *   **IP Address Hashing:**
        *   **Daily Rotating Salt:** `currentDateString + Deno.env.get("ANALYTICS_SALT_SECRET")`.
        *   Hash `ipAddress + dailySalt` using SHA-256 (`crypto.subtle.digest`).
    *   **Store Hashed IP in Deno KV:**
        *   **Key Structure:** `["daily_game_uniques", "YYYY-MM-DD", "<gameModeId>", "<sha256_hashed_ip_with_daily_salt>"]`
        *   **Value:** `true`
        *   **TTL:** `expireIn: 36 * 60 * 60 * 1000` (36 hours).
    *   **Files to be created/modified:** `middleware/analytics.ts`

3.  **Public Statistics Page (`routes/stats.tsx`):**
    *   Publicly accessible Fresh page (no API key protection).
    *   **Handler Logic:**
        *   Accepts an optional `date` query parameter (defaults to current date).
        *   Defines a list of known `gameModeIds`.
        *   Initializes `perGameCounts = {}` and `dailyTotalUniqueHashes = new Set()`.
        *   For each `gameModeId`, queries Deno KV for `["daily_game_uniques", selectedDate, gameModeId]`, counts entries, and adds unique `hashed_ip` parts to `dailyTotalUniqueHashes`.
        *   `totalUniqueUsersToday = dailyTotalUniqueHashes.size;`
        *   Passes `perGameCounts`, `totalUniqueUsersToday`, and `selectedDate` to the page component.
    *   **Page Component:**
        *   Renders simple HTML.
        *   Displays `selectedDate` and a way to change it.
        *   Displays a table: Game Mode | Unique Users.
        *   Displays "Total Unique Users Today".
    *   **Files to be created/modified:** `routes/stats.tsx`

4.  **Privacy Policy Update:**
    *   Clearly state that anonymized, aggregated daily visitor statistics (unique visitor counts per game mode, total daily uniques) are collected and publicly displayed.
    *   Explain the hashing and temporary storage of IP-derived data.
    *   State the lawful basis (e.g., legitimate interest).
    *   **Files to be created/modified:** Your existing privacy policy file (path to be determined, or a new one created).

5.  **Configuration:**
    *   `ANALYTICS_SALT_SECRET`: Environment variable in Deno Deploy for IP hashing.
    *   **Files to be created/modified:** Deno Deploy project settings (external to the codebase).

**Mermaid Diagram of the Flow:**
```mermaid
graph TD
    subgraph "Data Collection (Middleware)"
        A[User Request to typetutor.org/gameX] --> B(Fresh Server on Deno Deploy);
        B --> C{Analytics Middleware (`middleware/analytics.ts`)};
        C -- Gets `ctx.remoteAddr.hostname` --> IP[Client IP Address];
        C -- Gets `ctx.url.pathname` --> PATH[URL Path];
        PATH --> GM_ID{Extract gameModeId};
        IP & GM_ID --> D{Combine IP with Daily Salt + Secret};
        D --> E[SHA-256 Hash IP];
        E --> HASHED_IP[Hashed IP (Hex String)];
        HASHED_IP & GM_ID --> F(Deno KV);
        F -- Store Key: `["daily_game_uniques", "YYYY-MM-DD", gameModeId, HASHED_IP]` with TTL --> G[KV Record Created];
    end

    subgraph "Public Statistics Page Access"
        USER_REQ[User visits /stats?date=YYYY-MM-DD] --> SP_ROUTE{Stats Page Route Handler (`routes/stats.tsx`)};
        SP_ROUTE --> KV_QUERY(Query Deno KV);
        KV_QUERY -- For each gameModeId --> KV_LIST[List entries for `["daily_game_uniques", date, gameMode, ...]`];
        KV_LIST --> CALC{Calculate Per-Game Counts & Total Unique Hashes};
        CALC --> RENDER_PAGE[Render HTML Page with Stats Table];
        RENDER_PAGE --> USER_VIEW[User Views Stats];
    end

    P[Privacy Policy on typetutor.org] -.-> A;
    X[Deno Deploy Environment Variable: ANALYTICS_SALT_SECRET] -.-> D;