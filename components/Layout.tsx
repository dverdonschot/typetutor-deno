import { ComponentChildren } from "preact";
import { Logo } from "./Logo.tsx";
import HamburgerMenu from "../islands/HamburgerMenu.tsx";
import LanguageProvider from "./LanguageProvider.tsx";
import GlobalLanguageSelector from "../islands/GlobalLanguageSelector.tsx";
import ReactiveDescription from "../islands/ReactiveDescription.tsx";
import TranslationInitializer from "../islands/TranslationInitializer.tsx";

type LayoutProps = {
  children: ComponentChildren;
  descriptionKey: string;
  currentPath: string;
};

export function Layout(
  { children, descriptionKey, currentPath }: LayoutProps,
) {
  return (
    <LanguageProvider>
      <TranslationInitializer>
        <div class="app-layout">
          {/* Header Section */}
          <header class="app-header">
            <div class="header-logo">
              <Logo />
            </div>
            <div class="header-controls">
              <GlobalLanguageSelector compact />
              <HamburgerMenu currentPath={currentPath} />
            </div>
          </header>

          {/* Description Section - Hidden on mobile */}
          <section class="description-section">
            <ReactiveDescription descriptionKey={descriptionKey} />
          </section>

          {/* Main Content Section (Typing Area) */}
          <main class="main-content">
            {children}
          </main>
        </div>
      </TranslationInitializer>
    </LanguageProvider>
  );
}
