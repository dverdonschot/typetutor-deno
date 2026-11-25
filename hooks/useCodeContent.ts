import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import {
  resolveInitialId,
  resolveInitialSnippetIndex,
} from "../functions/codeSelection.ts";

// Shared content types for code mode. Previously duplicated across
// CodeTyperMode and the selector components; owned here now.
export interface Language {
  code: string;
  name: string;
  icon: string;
  description: string;
}

export interface CodeCollectionMetadata {
  id: string;
  name: string;
  snippetCount: number;
  difficulty?: string;
  tags?: string[];
  description?: string;
}

export interface CodeSnippet {
  code: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  language: string;
  index: number;
  // Optional teaching note shown while typing (data-driven, per snippet).
  tip?: string;
}

// localStorage is only available client-side; islands also render on the
// server during SSR, so every access must be guarded.
const readSaved = (key: string): string | null => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const writeSaved = (key: string, value: string) => {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // storage disabled or unavailable — selection still works in-memory
  }
};

export interface UseCodeContentOptions {
  languageKey: string;
  collectionKey: string;
  snippetKey: string;
}

export interface CodeContentState {
  status: "loading" | "ready" | "error";
  error: string | null;
  languages: Language[];
  collections: CodeCollectionMetadata[];
  snippets: CodeSnippet[];
  selectedLanguage: string | null;
  selectedLanguageData: Language | null;
  selectedCollectionId: string | null;
  selectedCollectionData: CodeCollectionMetadata | null;
  selectedSnippetIndex: number;
  currentSnippet: CodeSnippet | null;
  selectLanguage: (code: string) => void;
  selectCollection: (id: string) => void;
  selectSnippet: (index: number) => void;
  nextSnippet: () => void;
  randomSnippetInCollection: () => void;
  loadLanguageRandomSnippet: () => Promise<void>;
}

// Single owner of the code-mode content cascade: languages → collections →
// snippets. Every level's fetch is abortable, so a slow response can never
// override a selection the user has already moved past (the old per-selector
// fetching had a race that did exactly that). Selections are restored from
// localStorage as hints and validated against real API data.
export function useCodeContent(
  { languageKey, collectionKey, snippetKey }: UseCodeContentOptions,
): CodeContentState {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [collections, setCollections] = useState<CodeCollectionMetadata[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(() =>
    readSaved(languageKey)
  );
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(() => readSaved(collectionKey));
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState<number>(() =>
    resolveInitialSnippetIndex(Number.MAX_SAFE_INTEGER, readSaved(snippetKey))
  );
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  const collectionsAbort = useRef<AbortController | null>(null);
  const snippetsAbort = useRef<AbortController | null>(null);
  // Lets loadLanguageRandomSnippet hand its result straight to the snippets
  // effect, avoiding a duplicate fetch of the collection it just loaded.
  const seededSnippets = useRef<
    {
      collectionId: string;
      snippets: CodeSnippet[];
      index: number;
    } | null
  >(null);

  // Languages: fetched exactly once.
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setStatus("loading");
        setError(null);
        const response = await fetch("/api/code-collections/languages", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch languages: ${response.status}`);
        }
        const data: Language[] = await response.json();
        setLanguages(data);
        // Validate the saved hint (or fall back to the first language).
        setSelectedLanguage((current) =>
          resolveInitialId(data, current, "code")
        );
        setStatus("ready");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    })();
    return () => controller.abort();
  }, []);

  // Collections: refetched only when the language actually changes. The saved
  // collection hint is validated against the new language's list.
  useEffect(() => {
    collectionsAbort.current?.abort();
    if (!selectedLanguage) {
      setCollections([]);
      setSelectedCollectionId(null);
      return;
    }
    const controller = new AbortController();
    collectionsAbort.current = controller;
    (async () => {
      try {
        setStatus("loading");
        setError(null);
        const response = await fetch(
          `/api/code-collections/collections/${selectedLanguage}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch code collections: ${response.status}`,
          );
        }
        const data: CodeCollectionMetadata[] = await response.json();
        if (controller.signal.aborted) return;
        setCollections(data);
        setSelectedCollectionId((current) =>
          resolveInitialId(data, current, "id")
        );
        setStatus("ready");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unknown error");
        setCollections([]);
      }
    })();
    return () => controller.abort();
  }, [selectedLanguage]);

  // Snippets: refetched only when the collection actually changes, unless a
  // seed from loadLanguageRandomSnippet already covers this collection.
  useEffect(() => {
    snippetsAbort.current?.abort();
    const seed = seededSnippets.current;
    if (seed && seed.collectionId === selectedCollectionId) {
      seededSnippets.current = null;
      setSnippets(seed.snippets);
      setSelectedSnippetIndex(seed.index);
      setStatus("ready");
      return;
    }
    if (!selectedLanguage || !selectedCollectionId) {
      setSnippets([]);
      return;
    }
    const controller = new AbortController();
    snippetsAbort.current = controller;
    (async () => {
      try {
        setStatus("loading");
        setError(null);
        const response = await fetch(
          `/api/code-collections/snippets/${selectedLanguage}/${selectedCollectionId}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch collection: ${response.status}`);
        }
        const data: CodeSnippet[] = await response.json();
        if (controller.signal.aborted) return;
        setSnippets(data);
        setSelectedSnippetIndex((current) =>
          Number.isInteger(current) && current >= 0 && current < data.length
            ? current
            : 0
        );
        setStatus("ready");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unknown error");
        setSnippets([]);
      }
    })();
    return () => controller.abort();
  }, [selectedLanguage, selectedCollectionId]);

  // Persist selections (writes only — no state writes, so no loops).
  useEffect(() => {
    if (selectedLanguage) writeSaved(languageKey, selectedLanguage);
    if (selectedCollectionId) writeSaved(collectionKey, selectedCollectionId);
    writeSaved(snippetKey, String(selectedSnippetIndex));
  }, [
    selectedLanguage,
    selectedCollectionId,
    selectedSnippetIndex,
    languageKey,
    collectionKey,
    snippetKey,
  ]);

  const selectedLanguageData = useMemo(
    () => languages.find((l) => l.code === selectedLanguage) ?? null,
    [languages, selectedLanguage],
  );

  const selectedCollectionData = useMemo(
    () => collections.find((c) => c.id === selectedCollectionId) ?? null,
    [collections, selectedCollectionId],
  );

  const currentSnippet = useMemo(
    () =>
      selectedSnippetIndex >= 0 && selectedSnippetIndex < snippets.length
        ? snippets[selectedSnippetIndex]
        : null,
    [snippets, selectedSnippetIndex],
  );

  // User-driven switches clear downstream content synchronously, in the same
  // tick as the selection change. Waiting for the effects to do it leaves a
  // painted window where the old language's snippets show under the new
  // language's selects — the "menu is fighting me" experience.
  const selectLanguage = useCallback((code: string) => {
    if (selectedLanguage === code) return;
    collectionsAbort.current?.abort();
    snippetsAbort.current?.abort();
    setCollections([]);
    setSnippets([]);
    setSelectedCollectionId(null);
    // A saved snippet index belongs to the previous collection; a language
    // switch always starts at the first snippet (the saved-index restore is
    // only for the initial page load).
    setSelectedSnippetIndex(0);
    setSelectedLanguage(code);
  }, [selectedLanguage]);

  const selectCollection = useCallback((id: string) => {
    if (selectedCollectionId === id) return;
    snippetsAbort.current?.abort();
    setSnippets([]);
    setSelectedSnippetIndex(0);
    setSelectedCollectionId(id);
  }, [selectedCollectionId]);

  const selectSnippet = useCallback((index: number) => {
    setSelectedSnippetIndex(index);
  }, []);

  const nextSnippet = useCallback(() => {
    if (snippets.length === 0) return;
    setSelectedSnippetIndex((current) => (current + 1) % snippets.length);
  }, [snippets.length]);

  const randomSnippetInCollection = useCallback(() => {
    if (snippets.length === 0) return;
    setSelectedSnippetIndex(Math.floor(Math.random() * snippets.length));
  }, [snippets.length]);

  // Random snippet from any collection of the current language.
  const loadLanguageRandomSnippet = useCallback(async () => {
    if (!selectedLanguage) return;
    const controller = new AbortController();
    // Cancel any pending collection/snippet fetches for the old selection.
    collectionsAbort.current?.abort();
    snippetsAbort.current?.abort();
    try {
      setStatus("loading");
      setError(null);
      const response = await fetch(
        `/api/code-collections/random-snippet/${selectedLanguage}`,
        { signal: controller.signal },
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch random snippet: ${response.status}`);
      }
      const data = await response.json();

      // Load the full collection the random snippet came from so the stepper
      // and next/previous keep working from there.
      const snippetsResponse = await fetch(
        `/api/code-collections/snippets/${selectedLanguage}/${data.collectionId}`,
        { signal: controller.signal },
      );
      if (!snippetsResponse.ok) {
        // Still show the random snippet even if the collection fetch fails.
        seededSnippets.current = {
          collectionId: data.collectionId,
          snippets: [data.snippet as CodeSnippet],
          index: 0,
        };
      } else {
        const list: CodeSnippet[] = await snippetsResponse.json();
        const index = list.findIndex((s) => s.code === data.snippet.code);
        seededSnippets.current = {
          collectionId: data.collectionId,
          snippets: list,
          index: index >= 0 ? index : 0,
        };
      }

      if (data.collectionId === selectedCollectionId) {
        // Effect won't re-run for the same collection — apply the seed now.
        const seed = seededSnippets.current;
        seededSnippets.current = null;
        setSnippets(seed.snippets);
        setSelectedSnippetIndex(seed.index);
        setStatus("ready");
      } else {
        setSelectedCollectionId(data.collectionId);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setStatus("error");
      setError(
        `Error loading random snippet: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    }
  }, [selectedLanguage, selectedCollectionId]);

  return {
    status,
    error,
    languages,
    collections,
    snippets,
    selectedLanguage,
    selectedLanguageData,
    selectedCollectionId,
    selectedCollectionData,
    selectedSnippetIndex,
    currentSnippet,
    selectLanguage,
    selectCollection,
    selectSnippet,
    nextSnippet,
    randomSnippetInCollection,
    loadLanguageRandomSnippet,
  };
}
