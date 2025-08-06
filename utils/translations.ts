export interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<string, Translations> = {
  en: {
    nav: {
      typing: "Typing",
      quotes: "Quotes",
      trigraphs: "Trigraphs",
      code: "Code",
      alphabet: "Alphabet",
      random: "Random",
      stats: "Stats",
    },
    common: {
      language: "Language",
      category: "Category",
      loading: "Loading",
      error: "Error",
      retry: "Retry",
      practiceAgain: "Practice Again",
      nextQuote: "Next Quote",
      wpm: "WPM",
      accuracy: "Accuracy",
      time: "Time",
    },
    quotes: {
      title: "Quote Typing Practice",
      description:
        "Practice typing with inspirational quotes to improve your speed and accuracy.",
      selectCollection: "Select Quote Collection",
      loadingQuotes: "Loading Quotes",
      fetchingCollection: "Fetching your selected quote collection...",
      errorLoading: "Error Loading Quotes",
      tryAgain: "Try again",
      loadRandomCollection: "Load Random Collection",
    },
    about: {
      title: "About TypeTutor",
      description:
        "TypeTutor is a comprehensive typing trainer designed to help you improve your typing speed and accuracy through various practice modes.",
    },
  },
  es: {
    nav: {
      typing: "Mecanografía",
      quotes: "Citas",
      trigraphs: "Trígrafos",
      code: "Código",
      alphabet: "Alfabeto",
      random: "Aleatorio",
      stats: "Estadísticas",
    },
    common: {
      language: "Idioma",
      category: "Categoría",
      loading: "Cargando",
      error: "Error",
      retry: "Reintentar",
      practiceAgain: "Practicar de Nuevo",
      nextQuote: "Siguiente Cita",
      wpm: "PPM",
      accuracy: "Precisión",
      time: "Tiempo",
    },
    quotes: {
      title: "Práctica de Mecanografía con Citas",
      description:
        "Practica mecanografía con citas inspiradoras para mejorar tu velocidad y precisión.",
      selectCollection: "Seleccionar Colección de Citas",
      loadingQuotes: "Cargando Citas",
      fetchingCollection: "Obteniendo tu colección de citas seleccionada...",
      errorLoading: "Error al Cargar Citas",
      tryAgain: "Intentar de nuevo",
      loadRandomCollection: "Cargar Colección Aleatoria",
    },
    about: {
      title: "Acerca de TypeTutor",
      description:
        "TypeTutor es un entrenador de mecanografía integral diseñado para ayudarte a mejorar tu velocidad y precisión de escritura a través de varios modos de práctica.",
    },
  },
  fr: {
    nav: {
      typing: "Dactylographie",
      quotes: "Citations",
      trigraphs: "Trigrammes",
      code: "Code",
      alphabet: "Alphabet",
      random: "Aléatoire",
      stats: "Statistiques",
    },
    common: {
      language: "Langue",
      category: "Catégorie",
      loading: "Chargement",
      error: "Erreur",
      retry: "Réessayer",
      practiceAgain: "Pratiquer à Nouveau",
      nextQuote: "Citation Suivante",
      wpm: "MPM",
      accuracy: "Précision",
      time: "Temps",
    },
    quotes: {
      title: "Pratique de Dactylographie avec Citations",
      description:
        "Pratiquez la dactylographie avec des citations inspirantes pour améliorer votre vitesse et précision.",
      selectCollection: "Sélectionner Collection de Citations",
      loadingQuotes: "Chargement des Citations",
      fetchingCollection:
        "Récupération de votre collection de citations sélectionnée...",
      errorLoading: "Erreur de Chargement des Citations",
      tryAgain: "Réessayer",
      loadRandomCollection: "Charger Collection Aléatoire",
    },
    about: {
      title: "À Propos de TypeTutor",
      description:
        "TypeTutor est un entraîneur de dactylographie complet conçu pour vous aider à améliorer votre vitesse et précision de frappe grâce à divers modes de pratique.",
    },
  },
};

export function getTranslation(key: string, language: string = "en"): string {
  const keys = key.split(".");
  let current: any = translations[language] || translations.en;

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      // Fallback to English if translation not found
      current = translations.en;
      for (const fallbackKey of keys) {
        if (current && typeof current === "object" && fallbackKey in current) {
          current = current[fallbackKey];
        } else {
          return key; // Return key if no translation found
        }
      }
      break;
    }
  }

  return typeof current === "string" ? current : key;
}

export function useTranslation(language: string) {
  return (key: string) => getTranslation(key, language);
}
