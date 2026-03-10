interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env) {
    // Serve static assets through the ASSETS binding
    // The not_found_handling: "single-page-application" in wrangler.jsonc
    // ensures that non-file paths return index.html for client-side routing
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
