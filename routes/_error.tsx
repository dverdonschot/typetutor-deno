import { HttpError } from "fresh";
import { define } from "@/utils/define.ts";

export default define.page(function ErrorPage(ctx) {
  const error = ctx.error;
  const is404 = error instanceof HttpError && error.status === 404;

  return (
    <div class="px-4 py-8 mx-auto bg-white">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/typetutor-logo.svg"
          width="128"
          height="128"
          alt="Typetutor logo"
        />
        <h1 class="text-4xl font-bold">
          {is404 ? "404 - Page not found" : "Error"}
        </h1>
        <p class="my-4">
          {is404
            ? "The page you were looking for doesn't exist."
            : "An error occurred."}
        </p>
        <a href="/" class="underline">Go back home</a>
      </div>
    </div>
  );
});
