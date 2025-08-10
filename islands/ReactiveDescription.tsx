import { Description } from "../components/description.tsx";
import { currentLanguageSignal } from "../contexts/LanguageContext.ts";
import { getTranslation } from "../utils/translations.ts";

interface ReactiveDescriptionProps {
  descriptionKey: string;
}

export default function ReactiveDescription(
  { descriptionKey }: ReactiveDescriptionProps,
) {
  const translatedDescription = getTranslation(
    descriptionKey,
    currentLanguageSignal.value.code,
  );

  return <Description description={translatedDescription} />;
}
