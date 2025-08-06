import { ComponentChildren } from "preact";
import { Logo } from "./logo.tsx";
import { Description } from "./description.tsx";
import HamburgerMenu from "../islands/HamburgerMenu.tsx";
import LanguageProvider from "./LanguageProvider.tsx";
import GlobalLanguageSelector from "../islands/GlobalLanguageSelector.tsx";

type LayoutProps = {
  children: ComponentChildren;
  descriptionText: string;
  currentPath: string;
};

export function Layout(
  { children, descriptionText, currentPath }: LayoutProps,
) {
  return (
    <LanguageProvider>
      <div class="flex flex-col gap-6 flex-grow min-h-screen">
        {/* Header Section */}
        <header class="flex flex-col sm:flex-row justify-between items-center p-4 bg-white rounded-lg shadow">
          <div class="order-1 w-full sm:w-auto flex justify-center">
            <Logo />
          </div>
          <div class="order-2 w-full sm:w-auto flex justify-end items-center space-x-4">
            <GlobalLanguageSelector compact={true} />
            <HamburgerMenu currentPath={currentPath} />
          </div>
        </header>

        {/* Description Section - Hidden on mobile */}
        <section class="hidden sm:block p-4 bg-white rounded-lg shadow">
          <Description description={descriptionText} />
        </section>

        {/* Main Content Section (Typing Area) */}
        <main class="w-full">
          {children}
        </main>

        {/* Optional Footer - can be added later if needed */}
        {
          /* <footer class="text-center text-gray-500 text-sm py-4 mt-auto">
          Footer content
        </footer> */
        }
      </div>
    </LanguageProvider>
  );
}
