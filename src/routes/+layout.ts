// Static SPA: prerender the app shell, render everything client-side so
// dynamic detail routes work off the 404.html fallback on GitHub Pages.
export const prerender = true;
export const ssr = false;
export const trailingSlash = "ignore";
