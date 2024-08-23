
export function Menu() {
  return (
      <div class="col-span-2 min-h-[300px] bg-white shadow-lg rounded-lg max-w-xs mx-auto relative">
        <li class="flex mt-2 mb-2 ml-2 mr-2 items-center text-gray-900 text-md py-1">
          <span class="text-gray-400 mr-5">
            <svg class="w-7 h-7  text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
            </svg>
          </span>
          <a class="font-medium text-emerald-500 hover:underline" href="/random">Random Words</a>
        </li>
        <li class="flex mt-2 mb-2 ml-2 mr-2 items-center text-gray-900 text-md py-1">
          <span class="text-gray-400 mr-5">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m13 19 3.5-9 3.5 9m-6.125-2h5.25M3 7h7m0 0h2m-2 0c0 1.63-.793 3.926-2.239 5.655M7.5 6.818V5m.261 7.655C6.79 13.82 5.521 14.725 4 15m3.761-2.345L5 10m2.761 2.655L10.2 15"/>
            </svg>
          </span>
          <a class="font-medium text-emerald-500 hover:underline" href="/random/letters">Letters</a>
        </li>
        <li class="flex mt-2 mb-2 ml-2 mr-2 items-center text-gray-800 text-md py-1">
          <span class="text-gray-400 mr-5">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M6 6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3H5a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2H6Zm9 0a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3h-1a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3Z" clip-rule="evenodd"/>
            </svg>
          </span>
          <a class="font-medium text-emerald-500 hover:underline" href="/quotes">Quotes</a>
        </li>
        <li class="flex mt-2 mb-2 ml-2 mr-2 items-center text-gray-900 text-md py-1">
          <span class="text-gray-400 mr-5">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3"/>
            </svg>
          </span>
          <a class="font-medium text-emerald-500 hover:underline" href="/custom">Custom Text</a>
        </li>
      </div>
  );
}
