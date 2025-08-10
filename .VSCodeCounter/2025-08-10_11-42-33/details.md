# Details

Date : 2025-08-10 11:42:33

Directory /home/ewt/typetutor-deno

Total : 142 files, 14108 codes, 1192 comments, 1810 blanks, all 17110 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) /
[Diff Details](diff-details.md)

## Files

| filename                                                                                                                                        | language       | code | comment | blank | total |
| :---------------------------------------------------------------------------------------------------------------------------------------------- | :------------- | ---: | ------: | ----: | ----: |
| [.envrc](/.envrc)                                                                                                                               | Shell Script   |    3 |       2 |     3 |     8 |
| [.github/workflows/deploy.yml](/.github/workflows/deploy.yml)                                                                                   | YAML           |   45 |       2 |    13 |    60 |
| [.roo/mcp.json](/.roo/mcp.json)                                                                                                                 | JSON           |    3 |       0 |     1 |     4 |
| [README.md](/README.md)                                                                                                                         | Markdown       |  260 |       0 |    79 |   339 |
| [components/Button.tsx](/components/Button.tsx)                                                                                                 | TypeScript JSX |   11 |       0 |     2 |    13 |
| [components/CategorySelector.tsx](/components/CategorySelector.tsx)                                                                             | TypeScript JSX |  133 |       4 |    15 |   152 |
| [components/ContentSelector.tsx](/components/ContentSelector.tsx)                                                                               | TypeScript JSX |   89 |       4 |     9 |   102 |
| [components/KeyboardHeatmap.tsx](/components/KeyboardHeatmap.tsx)                                                                               | TypeScript JSX |  233 |      25 |    22 |   280 |
| [components/LanguageProvider.tsx](/components/LanguageProvider.tsx)                                                                             | TypeScript JSX |   32 |       5 |     5 |    42 |
| [components/LanguageSelector.tsx](/components/LanguageSelector.tsx)                                                                             | TypeScript JSX |   94 |       2 |    12 |   108 |
| [components/Layout.tsx](/components/Layout.tsx)                                                                                                 | TypeScript JSX |   41 |       7 |     6 |    54 |
| [components/QuoteFileSelector.tsx](/components/QuoteFileSelector.tsx)                                                                           | TypeScript JSX |  162 |       4 |    18 |   184 |
| [components/QuoteTextDisplay.tsx](/components/QuoteTextDisplay.tsx)                                                                             | TypeScript JSX |   69 |       2 |     5 |    76 |
| [components/TypingMetricsDisplay.tsx](/components/TypingMetricsDisplay.tsx)                                                                     | TypeScript JSX |   47 |       0 |     5 |    52 |
| [components/alphabet.tsx](/components/alphabet.tsx)                                                                                             | TypeScript JSX |   22 |       2 |     5 |    29 |
| [components/description.tsx](/components/description.tsx)                                                                                       | TypeScript JSX |   10 |       0 |     2 |    12 |
| [components/logo.tsx](/components/logo.tsx)                                                                                                     | TypeScript JSX |   13 |       0 |     1 |    14 |
| [components/menu.tsx](/components/menu.tsx)                                                                                                     | TypeScript JSX |  154 |       4 |     8 |   166 |
| [components/random.tsx](/components/random.tsx)                                                                                                 | TypeScript JSX |   16 |       0 |     4 |    20 |
| [config/typingContent.ts](/config/typingContent.ts)                                                                                             | TypeScript     |   45 |       4 |     4 |    53 |
| [constants/translationKeys.ts](/constants/translationKeys.ts)                                                                                   | TypeScript     |  172 |      17 |    15 |   204 |
| [contexts/LanguageContext.ts](/contexts/LanguageContext.ts)                                                                                     | TypeScript     |   98 |      11 |    14 |   123 |
| [deno.json](/deno.json)                                                                                                                         | JSON           |   43 |       0 |     1 |    44 |
| [dev.ts](/dev.ts)                                                                                                                               | TypeScript     |    5 |       0 |     4 |     9 |
| [devenv.nix](/devenv.nix)                                                                                                                       | Nix            |   17 |      18 |    12 |    47 |
| [devenv.yaml](/devenv.yaml)                                                                                                                     | YAML           |    3 |       9 |     4 |    16 |
| [docs/ADDING_LANGUAGES.md](/docs/ADDING_LANGUAGES.md)                                                                                           | Markdown       |  211 |       0 |    69 |   280 |
| [docs/USER_DATA_SYSTEM.md](/docs/USER_DATA_SYSTEM.md)                                                                                           | Markdown       |   85 |       0 |    39 |   124 |
| [finger-combination-training-plan.md](/finger-combination-training-plan.md)                                                                     | Markdown       |  219 |       0 |    69 |   288 |
| [fresh.config.ts](/fresh.config.ts)                                                                                                             | TypeScript     |    5 |       0 |     2 |     7 |
| [fresh.gen.ts](/fresh.gen.ts)                                                                                                                   | TypeScript     |   85 |       3 |     4 |    92 |
| [functions/cacheManager.ts](/functions/cacheManager.ts)                                                                                         | TypeScript     |  296 |      33 |    41 |   370 |
| [functions/contentFetcher.ts](/functions/contentFetcher.ts)                                                                                     | TypeScript     |  129 |      25 |    12 |   166 |
| [functions/contentScanner.ts](/functions/contentScanner.ts)                                                                                     | TypeScript     |  239 |      23 |    33 |   295 |
| [functions/initializeCache.ts](/functions/initializeCache.ts)                                                                                   | TypeScript     |   35 |       2 |     7 |    44 |
| [functions/predefinedTrainingSet.ts](/functions/predefinedTrainingSet.ts)                                                                       | TypeScript     |   22 |       0 |     5 |    27 |
| [functions/quoteParser.ts](/functions/quoteParser.ts)                                                                                           | TypeScript     |  188 |      18 |    38 |   244 |
| [functions/randomTrainingSet.ts](/functions/randomTrainingSet.ts)                                                                               | TypeScript     |   26 |       0 |     4 |    30 |
| [functions/utils.ts](/functions/utils.ts)                                                                                                       | TypeScript     |    5 |       0 |     2 |     7 |
| [hooks/useKeyPress.ts](/hooks/useKeyPress.ts)                                                                                                   | TypeScript     |   73 |       6 |    11 |    90 |
| [hooks/useMobileInput.ts](/hooks/useMobileInput.ts)                                                                                             | TypeScript     |  214 |       7 |    27 |   248 |
| [hooks/useQuoteInput.ts](/hooks/useQuoteInput.ts)                                                                                               | TypeScript     |  328 |      73 |    37 |   438 |
| [hooks/useTypingMetrics.ts](/hooks/useTypingMetrics.ts)                                                                                         | TypeScript     |   92 |       6 |     8 |   106 |
| [internationalization-restructure-plan.md](/internationalization-restructure-plan.md)                                                           | Markdown       |  139 |       0 |    36 |   175 |
| [islands/CodeTyperMode.tsx](/islands/CodeTyperMode.tsx)                                                                                         | TypeScript JSX |  329 |      50 |    42 |   421 |
| [islands/GameScoreDisplayIsland.tsx](/islands/GameScoreDisplayIsland.tsx)                                                                       | TypeScript JSX |  177 |      11 |    20 |   208 |
| [islands/GlobalLanguageSelector.tsx](/islands/GlobalLanguageSelector.tsx)                                                                       | TypeScript JSX |   82 |       1 |     7 |    90 |
| [islands/HamburgerMenu.tsx](/islands/HamburgerMenu.tsx)                                                                                         | TypeScript JSX |  222 |       5 |    11 |   238 |
| [islands/KeyLogger.tsx](/islands/KeyLogger.tsx)                                                                                                 | TypeScript JSX |  182 |       9 |    22 |   213 |
| [islands/KeyboardHeatmapIsland.tsx](/islands/KeyboardHeatmapIsland.tsx)                                                                         | TypeScript JSX |  235 |       7 |    26 |   268 |
| [islands/NewQuoteTyperMode.tsx](/islands/NewQuoteTyperMode.tsx)                                                                                 | TypeScript JSX |  903 |      83 |    94 | 1,080 |
| [islands/RandomSettings.tsx](/islands/RandomSettings.tsx)                                                                                       | TypeScript JSX |  142 |      19 |    16 |   177 |
| [islands/ReactiveDescription.tsx](/islands/ReactiveDescription.tsx)                                                                             | TypeScript JSX |   15 |       0 |     4 |    19 |
| [islands/RenderedQuoteResult.tsx](/islands/RenderedQuoteResult.tsx)                                                                             | TypeScript JSX |   48 |       0 |     3 |    51 |
| [islands/StatsPage.tsx](/islands/StatsPage.tsx)                                                                                                 | TypeScript JSX |  200 |       7 |    21 |   228 |
| [islands/TranslationInitializer.tsx](/islands/TranslationInitializer.tsx)                                                                       | TypeScript JSX |   54 |       4 |     9 |    67 |
| [islands/TrigraphsTyperMode.tsx](/islands/TrigraphsTyperMode.tsx)                                                                               | TypeScript JSX |  379 |      56 |    37 |   472 |
| [islands/UserStatsIsland.tsx](/islands/UserStatsIsland.tsx)                                                                                     | TypeScript JSX |  524 |      36 |    48 |   608 |
| [islands/UserStatsPageContentIsland.tsx](/islands/UserStatsPageContentIsland.tsx)                                                               | TypeScript JSX |   37 |       2 |     6 |    45 |
| [main.ts](/main.ts)                                                                                                                             | TypeScript     |   11 |       8 |     6 |    25 |
| [multilingual-implementation-plan.md](/multilingual-implementation-plan.md)                                                                     | Markdown       |  319 |       0 |    86 |   405 |
| [routes/_404.tsx](/routes/_404.tsx)                                                                                                             | TypeScript JSX |   26 |       0 |     2 |    28 |
| [routes/_app.tsx](/routes/_app.tsx)                                                                                                             | TypeScript JSX |   28 |       0 |     3 |    31 |
| [routes/alphabet.tsx](/routes/alphabet.tsx)                                                                                                     | TypeScript JSX |   14 |       0 |     2 |    16 |
| [routes/api/admin/refresh-cache.ts](/routes/api/admin/refresh-cache.ts)                                                                         | TypeScript     |  100 |       6 |     9 |   115 |
| [routes/api/game-stats.ts](/routes/api/game-stats.ts)                                                                                           | TypeScript     |   37 |       0 |     4 |    41 |
| [routes/api/quotes/categories/[lang].ts](/routes/api/quotes/categories/%5Blang%5D.ts)                                                           | TypeScript     |   65 |       2 |     7 |    74 |
| [routes/api/quotes/content/[lang]/[category]/[id].ts](/routes/api/quotes/content/%5Blang%5D/%5Bcategory%5D/%5Bid%5D.ts)                         | TypeScript     |  112 |       5 |    11 |   128 |
| [routes/api/quotes/languages.ts](/routes/api/quotes/languages.ts)                                                                               | TypeScript     |   49 |       2 |     5 |    56 |
| [routes/api/quotes/metadata/[lang]/[category].ts](/routes/api/quotes/metadata/%5Blang%5D/%5Bcategory%5D.ts)                                     | TypeScript     |   79 |       2 |     8 |    89 |
| [routes/api/translations/[lang].ts](/routes/api/translations/%5Blang%5D.ts)                                                                     | TypeScript     |   26 |       0 |     4 |    30 |
| [routes/api/translations/all.ts](/routes/api/translations/all.ts)                                                                               | TypeScript     |   25 |       0 |     3 |    28 |
| [routes/api/translations/languages.ts](/routes/api/translations/languages.ts)                                                                   | TypeScript     |   25 |       0 |     3 |    28 |
| [routes/api/trigraphs.ts](/routes/api/trigraphs.ts)                                                                                             | TypeScript     |   26 |       0 |     2 |    28 |
| [routes/api/trigraphs/[name].ts](/routes/api/trigraphs/%5Bname%5D.ts)                                                                           | TypeScript     |   39 |       3 |     7 |    49 |
| [routes/code.tsx](/routes/code.tsx)                                                                                                             | TypeScript JSX |   14 |       0 |     2 |    16 |
| [routes/custom.tsx](/routes/custom.tsx)                                                                                                         | TypeScript JSX |   14 |       2 |     2 |    18 |
| [routes/index.tsx](/routes/index.tsx)                                                                                                           | TypeScript JSX |   14 |       0 |     2 |    16 |
| [routes/quotes.tsx](/routes/quotes.tsx)                                                                                                         | TypeScript JSX |   14 |       0 |     2 |    16 |
| [routes/random.tsx](/routes/random.tsx)                                                                                                         | TypeScript JSX |   14 |       0 |     2 |    16 |
| [routes/serverstats.tsx](/routes/serverstats.tsx)                                                                                               | TypeScript JSX |   13 |       0 |     2 |    15 |
| [routes/trigraphs.tsx](/routes/trigraphs.tsx)                                                                                                   | TypeScript JSX |   10 |       0 |     3 |    13 |
| [routes/userstats.tsx](/routes/userstats.tsx)                                                                                                   | TypeScript JSX |   14 |       0 |     2 |    16 |
| [static/content/code/javascript/array_iteration.js](/static/content/code/javascript/array_iteration.js)                                         | JavaScript     |   15 |       0 |     4 |    19 |
| [static/content/code/javascript/fizzbuzz.js](/static/content/code/javascript/fizzbuzz.js)                                                       | JavaScript     |   13 |      19 |     3 |    35 |
| [static/content/code/javascript/simple_function.js](/static/content/code/javascript/simple_function.js)                                         | JavaScript     |    8 |       3 |     2 |    13 |
| [static/content/code/python/basic_print.py](/static/content/code/python/basic_print.py)                                                         | Python         |    7 |       3 |     4 |    14 |
| [static/content/code/python/list_comprehension.py](/static/content/code/python/list_comprehension.py)                                           | Python         |    9 |       5 |     4 |    18 |
| [static/content/quotes/en/historical/category.json](/static/content/quotes/en/historical/category.json)                                         | JSON           |    6 |       0 |     1 |     7 |
| [static/content/quotes/en/historical/george-washington.json](/static/content/quotes/en/historical/george-washington.json)                       | JSON           |  121 |       0 |     1 |   122 |
| [static/content/quotes/en/historical/martin-luther-king.json](/static/content/quotes/en/historical/martin-luther-king.json)                     | JSON           |   98 |       0 |     1 |    99 |
| [static/content/quotes/en/historical/sitting-bull.json](/static/content/quotes/en/historical/sitting-bull.json)                                 | JSON           |   90 |       0 |     1 |    91 |
| [static/content/quotes/en/literary/category.json](/static/content/quotes/en/literary/category.json)                                             | JSON           |    6 |       0 |     1 |     7 |
| [static/content/quotes/en/literary/shakespeare.json](/static/content/quotes/en/literary/shakespeare.json)                                       | JSON           |   26 |       0 |     1 |    27 |
| [static/content/quotes/en/motivational/category.json](/static/content/quotes/en/motivational/category.json)                                     | JSON           |    6 |       0 |     1 |     7 |
| [static/content/quotes/en/motivational/success.json](/static/content/quotes/en/motivational/success.json)                                       | JSON           |   25 |       0 |     1 |    26 |
| [static/content/quotes/en/science/category.json](/static/content/quotes/en/science/category.json)                                               | JSON           |    6 |       0 |     1 |     7 |
| [static/content/quotes/en/science/edison.json](/static/content/quotes/en/science/edison.json)                                                   | JSON           |   84 |       0 |     1 |    85 |
| [static/content/quotes/en/science/einstein.json](/static/content/quotes/en/science/einstein.json)                                               | JSON           |   86 |       0 |     1 |    87 |
| [static/content/quotes/en/science/oppenheimer.json](/static/content/quotes/en/science/oppenheimer.json)                                         | JSON           |   76 |       0 |     1 |    77 |
| [static/content/quotes/es/historico/bartolome-de-las-casas.json](/static/content/quotes/es/historico/bartolome-de-las-casas.json)               | JSON           |   64 |       0 |     1 |    65 |
| [static/content/quotes/es/historico/category.json](/static/content/quotes/es/historico/category.json)                                           | JSON           |    6 |       0 |     1 |     7 |
| [static/content/quotes/es/historico/isabel-la-catolica.json](/static/content/quotes/es/historico/isabel-la-catolica.json)                       | JSON           |   54 |       0 |     1 |    55 |
| [static/content/quotes/es/motivacional/exito.json](/static/content/quotes/es/motivacional/exito.json)                                           | JSON           |   60 |       0 |     1 |    61 |
| [static/content/quotes/fr/historique/category.json](/static/content/quotes/fr/historique/category.json)                                         | JSON           |    6 |       0 |     1 |     7 |
| [static/content/quotes/fr/historique/jeanne-darc.json](/static/content/quotes/fr/historique/jeanne-darc.json)                                   | JSON           |   92 |       0 |     1 |    93 |
| [static/content/quotes/fr/science/category.json](/static/content/quotes/fr/science/category.json)                                               | JSON           |    6 |       0 |     1 |     7 |
| [static/content/quotes/fr/science/poids-et-mesures.json](/static/content/quotes/fr/science/poids-et-mesures.json)                               | JSON           |  115 |       0 |     1 |   116 |
| [static/content/quotes/languages.json](/static/content/quotes/languages.json)                                                                   | JSON           |   18 |       0 |     1 |    19 |
| [static/content/quotes/nl/geschiedkunding/abraham-kuyper.json](/static/content/quotes/nl/geschiedkunding/abraham-kuyper.json)                   | JSON           |   47 |       0 |     1 |    48 |
| [static/content/quotes/nl/geschiedkunding/aletta-jacobs.json](/static/content/quotes/nl/geschiedkunding/aletta-jacobs.json)                     | JSON           |   52 |       0 |     0 |    52 |
| [static/content/quotes/nl/geschiedkunding/category.json](/static/content/quotes/nl/geschiedkunding/category.json)                               | JSON           |    6 |       0 |     1 |     7 |
| [static/content/quotes/nl/geschiedkunding/georges-van-acker.json](/static/content/quotes/nl/geschiedkunding/georges-van-acker.json)             | JSON           |   10 |       0 |     1 |    11 |
| [static/content/quotes/nl/geschiedkunding/hugo-de-groot.json](/static/content/quotes/nl/geschiedkunding/hugo-de-groot.json)                     | JSON           |   34 |       0 |     2 |    36 |
| [static/content/quotes/nl/geschiedkunding/johan-huizinga.json](/static/content/quotes/nl/geschiedkunding/johan-huizinga.json)                   | JSON           |   41 |       0 |     1 |    42 |
| [static/content/quotes/nl/geschiedkunding/johan-rudolph-thorbecke.json](/static/content/quotes/nl/geschiedkunding/johan-rudolph-thorbecke.json) | JSON           |   47 |       0 |     1 |    48 |
| [static/languages/en.json](/static/languages/en.json)                                                                                           | JSON           |  168 |       0 |     1 |   169 |
| [static/languages/es.json](/static/languages/es.json)                                                                                           | JSON           |  168 |       0 |     1 |   169 |
| [static/languages/fr.json](/static/languages/fr.json)                                                                                           | JSON           |  168 |       0 |     1 |   169 |
| [static/languages/languages.json](/static/languages/languages.json)                                                                             | JSON           |   36 |       0 |     1 |    37 |
| [static/languages/nl.json](/static/languages/nl.json)                                                                                           | JSON           |  168 |       0 |     1 |   169 |
| [static/logo.svg](/static/logo.svg)                                                                                                             | XML            |   19 |       0 |     1 |    20 |
| [static/research/mastering_touch_typing.md](/static/research/mastering_touch_typing.md)                                                         | Markdown       |  162 |       0 |    30 |   192 |
| [static/research/touch_typing_desiggn_guide.md](/static/research/touch_typing_desiggn_guide.md)                                                 | Markdown       |  178 |       0 |    43 |   221 |
| [static/styles.css](/static/styles.css)                                                                                                         | CSS            |   67 |       2 |    14 |    83 |
| [static/typetutor-logo.svg](/static/typetutor-logo.svg)                                                                                         | XML            |   65 |       1 |     2 |    68 |
| [tailwind.config.ts](/tailwind.config.ts)                                                                                                       | TypeScript     |   14 |       0 |     2 |    16 |
| [tests/contentScanner_test.ts](/tests/contentScanner_test.ts)                                                                                   | TypeScript     |  177 |      11 |    37 |   225 |
| [tests/quoteParser_test.ts](/tests/quoteParser_test.ts)                                                                                         | TypeScript     |  169 |       1 |    20 |   190 |
| [tests/test-cache.ts](/tests/test-cache.ts)                                                                                                     | TypeScript     |   15 |       0 |     7 |    22 |
| [tests/test-historical-quotes.ts](/tests/test-historical-quotes.ts)                                                                             | TypeScript     |  120 |      12 |    19 |   151 |
| [tests/test-quote-system.ts](/tests/test-quote-system.ts)                                                                                       | TypeScript     |  149 |      13 |    25 |   187 |
| [types/quotes.ts](/types/quotes.ts)                                                                                                             | TypeScript     |   53 |       8 |     8 |    69 |
| [types/userStats.ts](/types/userStats.ts)                                                                                                       | TypeScript     |  152 |      61 |    33 |   246 |
| [utils/gameStats.ts](/utils/gameStats.ts)                                                                                                       | TypeScript     |   88 |      11 |    10 |   109 |
| [utils/keyboardLayout.ts](/utils/keyboardLayout.ts)                                                                                             | TypeScript     |  646 |      93 |    25 |   764 |
| [utils/quoteCache.ts](/utils/quoteCache.ts)                                                                                                     | TypeScript     |  191 |      25 |    32 |   248 |
| [utils/recordGameStats.ts](/utils/recordGameStats.ts)                                                                                           | TypeScript     |   32 |       1 |     3 |    36 |
| [utils/translationCache.ts](/utils/translationCache.ts)                                                                                         | TypeScript     |  130 |      34 |    27 |   191 |
| [utils/translationLoader.ts](/utils/translationLoader.ts)                                                                                       | TypeScript     |  161 |      35 |    27 |   223 |
| [utils/translations.ts](/utils/translations.ts)                                                                                                 | TypeScript     |  111 |      26 |    23 |   160 |
| [utils/userStatsManager.ts](/utils/userStatsManager.ts)                                                                                         | TypeScript     |  533 |     190 |   114 |   837 |

[Summary](results.md) / Details / [Diff Summary](diff.md) /
[Diff Details](diff-details.md)
