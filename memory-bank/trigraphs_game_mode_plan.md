# Plan for Trigraphs Game Mode

## Introduction

This document outlines the plan to introduce a new "Trigraphs" game mode to the TypeTutor application. This mode will challenge users to type words containing specific three-letter combinations (trigraphs).

## Data Structure

To store the trigraphs and the words associated with each trigraph, we will create a new directory within the `static/content/` folder. A suggested path is `static/content/trigraphs/`.

Within this directory, we can adopt one of the following approaches:

1.  **Separate files for each trigraph:** Create a file for each trigraph (e.g., `the.txt`, `and.txt`, `ing.txt`). Each file will contain a list of words that include that specific trigraph, one word per line.
2.  **Single file with structured data:** Create a single file (e.g., `trigraphs.json` or `trigraphs.yaml`) that stores the trigraphs and their associated word lists in a structured format.

Given the potential number of trigraphs and the need to easily access words for a selected trigraph, the first approach (separate files) seems more aligned with the current structure in `static/content/` and might be simpler to implement initially by reusing existing content fetching logic.

The initial list of trigraphs to include is: the, and, ing, ion, ent, for, tio, ati, men, ter, ers, con, res, ver, all, pro, com, per, sta, est, ant, int, ove, ear, her, his, ere, hat, tha, ate, but, not, you, are, can, one, our, out, who, had, has, was, him, she, see, now, new, two, how, why, any, may, way.

We will need to populate the files with relevant words for each trigraph.

## Implementation Steps

1.  **Create Trigraph Data Files:** Create the `static/content/trigraphs/` directory and populate it with text files for each trigraph, containing lists of words.
2.  **Modify Menu Component:** Update `components/menu.tsx` to add a new menu item for the "Trigraphs" mode. This will require adding a new entry to the `gameModes` array or similar structure within the component. The icon should visually represent a trigraph (e.g., "abc" with a focus on three letters).
3.  **Create Trigraphs Island Component:** Create a new island component, likely named `TrigraphsTyperMode.tsx`, in the `islands/` directory. This component will be responsible for:
    *   Displaying the list of available trigraphs.
    *   Allowing the user to select a trigraph or trigger a random selection.
    *   Fetching the words associated with the selected trigraph.
    *   Generating the typing game text by selecting words from the fetched list.
    *   Utilizing reusable components and hooks for typing input, metrics display, etc., similar to `QuoteTyperMode.tsx`.
4.  **Create Trigraphs Route:** Create a new route file (e.g., `routes/trigraphs.tsx`) that will render the `TrigraphsTyperMode.tsx` island component.
5.  **Update Content Fetching Logic:** Modify the `functions/contentFetcher.ts` or create a new utility function to handle fetching content specifically for the trigraphs mode. This function will need to read the words from the appropriate file(s) in `static/content/trigraphs/` based on the selected trigraph.

## Reusability

The core typing logic, input handling (hooks like `useKeyPress`, `useMobileInput`, `useQuoteInput`), and metrics display (`components/TypingMetricsDisplay.tsx`, `hooks/useTypingMetrics`) from the existing quotes mode (`islands/QuoteTyperMode.tsx`) can be largely reused in the new `TrigraphsTyperMode.tsx` island. The structure of fetching and displaying text will be similar, only the source and generation of the text will differ.

## Icon

A 3-character icon representing a trigraph will be needed for the menu. This could be a simple text representation like "the" or a more abstract icon focusing on three connected characters.

## Summary Table of Common Trigraphs

| Trigraph | Example        | Sound/Notes              |
|----------|---------------|--------------------------|
| tch      | catch         | /tʃ/                     |
| dge      | bridge        | /dʒ/                     |
| igh      | night         | /aɪ/                     |
| ear      | hear          | /ɪə/ or /ɛə/             |
| air      | hair          | /ɛə/                     |
| are      | care          | /ɛə/                     |
| ure      | cure          | /jʊə/                    |
| eau      | beauty        | /juː/ or /oʊ/            |
| eer      | cheer         | /ɪə/                     |
| ere      | here          | /ɪə/                     |
| oul      | could         | /ʊ/                      |
| ore      | store         | /ɔː/                     |
| sch      | school        | /sk/                     |
| scr      | scream        | /skr/                    |
| shr      | shrimp        | /ʃr/                     |
| spl      | splash        | /spl/                    |
| spr      | spring        | /spr/                    |
| squ      | squash        | /skw/                    |
| str      | street        | /str/                    |
| thr      | three         | /θr/                     |
| que      | antique       | /k/                      |
| gue      | league        | /g/                      |
| ugh      | sigh, through | /aɪ/, /uː/, /ʌf/         |

## Refinement and Bug Fixing (Post-Initial Implementation)

Based on initial testing and feedback, the following refinements and fixes are needed:

1.  **Comprehensive Visual Style Update (Align with Quote Mode):**
    *   **Layout:** Modify `islands/TrigraphsTyperMode.tsx` to mirror the layout of `islands/QuoteTyperMode.tsx`. This includes:
        *   A prominent text input area (the "bar where the user types").
        *   The list of available trigraphs displayed *below* the typing area.
    *   **Trigraph Selection:**
        *   Replace the current button-based trigraph selection with a selectable list (e.g., using a `<select>` element or a custom list component that visually matches the quote selection).
        *   Ensure the visual style of this selection list is consistent with the quote selection mechanism in `islands/QuoteTyperMode.tsx`.
        *   Implement functionality to automatically select the first trigraph in the list by default when the page loads.
        *   Integrate logic to store the user's last selected trigraph in local storage and automatically select it upon revisiting the page. This can likely reuse or adapt logic from `islands/QuoteTyperMode.tsx` or a shared hook.
    *   **Score Display:**
        *   Implement a score display mechanism that appears after the typing challenge is completed, similar to how scores are shown in the quote mode. This will likely involve reusing or adapting the `TypingMetricsDisplay.tsx` component and related logic for showing WPM, accuracy, etc., upon completion.

2.  **Resolve 404 Error for Trigraph Word Fetching:**
    *   Investigate the cause of the "404 Not Found" error occurring when `fetchTrigraphWords` in `functions/contentFetcher.ts` attempts to fetch a trigraph file (e.g., `/static/content/trigraphs/the.txt`).
    *   Verify file paths, server configuration, and any potential issues with how the `fetch` request is being made or handled by the development server for static files.
    *   Ensure that the `fetchTrigraphWords` function correctly constructs the URL and that the static files are accessible at those paths.
