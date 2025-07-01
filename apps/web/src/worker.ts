interface Env {
  ASSETS: Fetcher;
}

export default {
  fetch(request, env) {
    console.log('assets', env, request.url);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
