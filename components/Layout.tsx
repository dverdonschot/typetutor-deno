import { ComponentChildren } from "preact";
import { Logo } from "./logo.tsx";
import { Description } from "./description.tsx";
import HamburgerMenu from "../islands/HamburgerMenu.tsx";

type LayoutProps = {
  children: ComponentChildren;
  descriptionText: string;
};

export function Layout({ children, descriptionText }: LayoutProps) {
  return (
    <div class="m-4 flex flex-col gap-1 flex-grow min-h-screen">
      {/* Header Section */}
      <header class="relative p-4 bg-white rounded-lg shadow">
        {/* Centered Logo */}
        <div class="w-full flex justify-center items-center">
          <Logo />
        </div>
        {/* Hamburger Menu positioned absolutely in the right, vertically centered */}
        <nav class="absolute top-1/2 right-4 transform -translate-y-1/2">
          <HamburgerMenu />
        </nav>
      </header>

      {/* Description Section - Hidden on mobile */}
      <section class="hidden sm:block p-4 bg-white rounded-lg shadow mt-3">
        <Description description={descriptionText} />
      </section>

      {/* Main Content Section (Typing Area) */}
      <main class="w-full mt-1">
        {children}
      </main>

      {/* Optional Footer - can be added later if needed */}
      {/* <footer class="text-center text-gray-500 text-sm py-4 mt-auto">
        Footer content
      </footer> */}
    </div>
  );
}