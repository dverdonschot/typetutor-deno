# Plan: Quote/Code Typing Mode

This plan outlines the steps to create a new typing mode focused on quotes and code snippets, fetched from external URLs.

## 1. Configuration (`config/typingContent.ts`)

-   Define a flat array of `ContentItem` objects in a new configuration file.
-   Each `ContentItem` will have:
    -   `id`: string (Unique identifier)
    -   `name`: string (Display name for selection)
    -   `type`: 'quote' | 'code'
    -   `sourceUrl`: string (URL to the raw text content, e.g., GitHub raw)
    -   `language?`: string (Optional: e.g., 'javascript', 'python' for code items)
-   **Example Structure:**
    ```typescript
    interface ContentItem { id: string; name: string; type: 'quote' | 'code'; sourceUrl: string; language?: string; }
    const typingContent: ContentItem[] = [
      { id: 'quote-journey', name: 'Quote: Journey', type: 'quote', sourceUrl: '...' },
      { id: 'js-task-1', name: 'JS: Simple Function', type: 'code', language: 'javascript', sourceUrl: '...' },
      // ... more items
    ];
    export default typingContent;
    ```

## 2. Create `components/QuoteTextDisplay.tsx`

-   **Purpose:** Render continuous text with character-by-character styling.
-   **Input:** Character state array (from `useQuoteInput`).
-   **Output:** Styled text (`<span>` elements for each character) based on state (`none`, `correct`, `incorrect`).
-   **Styling:** Maintain visual consistency with existing app styles.

## 3. Create `hooks/useQuoteInput.ts`

-   **Purpose:** New hook (not adapted from `useMobileInput`) for handling user input against continuous text.
-   **Input:** Target text string (fetched content).
-   **Functionality:** Compare input, handle backspaces, update character state.
-   **Output:** Character state array, core typing metrics (counts), input props for the hidden `<input>`.

## 4. Create `components/ContentSelector.tsx`

-   **Purpose:** Allow user selection of content to type.
-   **Input:** Flat `typingContent` array from configuration.
-   **Functionality:**
    -   Group items by `type` ('quote', 'code') and then by `language` (for code).
    -   Render a grouped selection UI (e.g., `<select>` with `<optgroup>`).
-   **Output:** The `id` or full `ContentItem` object of the user's selection.

## 5. Create `functions/contentFetcher.ts`

-   **Purpose:** Fetch content from a URL.
-   **Input:** `sourceUrl` string.
-   **Functionality:** Use `fetch` API to get text content. Handle network errors and non-OK responses.
-   **Output:** Fetched text string or an error indicator/message.

## 6. Create `islands/QuoteTyperMode.tsx`

-   **Purpose:** Main controller island for the mode.
-   **Workflow:**
    1.  Render `ContentSelector`.
    2.  On selection, get the `ContentItem`.
    3.  Call `contentFetcher` with the `sourceUrl`.
    4.  Manage loading/error states during fetch.
    5.  On success, initialize `useQuoteInput` with fetched text.
    6.  Render `QuoteTextDisplay` with character state.
    7.  Render `TypingMetricsDisplay` (using `useTypingMetrics`).

## 7. Integrate into `routes/quotes.tsx`

-   **Purpose:** Display the new mode on the `/quotes` page.
-   **Implementation:** Render the `QuoteTyperMode.tsx` island.

## 8. Styling

-   Use Tailwind CSS and potentially the `cn` utility for consistent styling across new components.

## Mermaid Diagram

```mermaid
graph TD
    subgraph Route
        A[routes/quotes.tsx]
    end

    subgraph Island
        B(islands/QuoteTyperMode.tsx)
    end

    subgraph Hooks
        F(hooks/useQuoteInput.ts)
        H(hooks/useTypingMetrics.ts)
    end

    subgraph Components
        J(components/QuoteTextDisplay.tsx)
        L(components/TypingMetricsDisplay.tsx)
        N(components/ContentSelector.tsx)
    end

    subgraph Functions
        O(functions/contentFetcher.ts)
    end

    subgraph Data
        P{{config/typingContent.ts (Flat List)}}
    end

    A --> B
    B --> N
    N -- Needs Data --> P
    N -- Groups Data --> N_Grouped[Grouped UI (e.g., select with optgroup)]
    N_Grouped -- User Selection --> B
    B -- Selected Item --> O_Trigger{Use sourceUrl}
    O_Trigger -- sourceUrl --> O
    O -- Fetches --> External[GitHub Raw / Other URL]
    External -- Text/Error --> O
    O -- Text/Error --> B
    B -- Fetched Text --> F
    F --> G[Character State Array]
    F --> I[Input Props]
    B --> H
    H --> Metrics[Calculated Metrics]
    B -- Uses --> G
    B -- Uses --> I
    B -- Uses --> Metrics
    B --> J
    B --> L
    J -- Receives --> G
    L -- Receives --> Metrics
    J --> K[Rendered Styled Text]

    style Island fill:#f9f,stroke:#333,stroke-width:2px
    style Hooks fill:#ccf,stroke:#333,stroke-width:2px
    style Components fill:#cfc,stroke:#333,stroke-width:2px
    style Route fill:#ff9,stroke:#333,stroke-width:2px
    style Functions fill:#fcc,stroke:#333,stroke-width:2px
    style Data fill:#eee,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5