export function Logo() {
  return (
    <div class="logo-box flex items-center justify-center min-h-[80px]">
      <a href="/" class="block">
        <img
          src="/typetutor-logo.svg"
          alt="Typetutor"
          class="logo-img h-auto w-auto max-w-full max-h-[80px] hover:opacity-80 transition-opacity cursor-pointer"
        />
      </a>
    </div>
  );
}
