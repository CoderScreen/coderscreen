interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch() {
    return new Response('Not found', { status: 404 });
    // console.log('fetch', env);
    // try {
    //   // First try to serve the exact requested path
    //   const requestUrl = new URL(request.url);
    //   let response = await env.ASSETS.fetch(requestUrl, request);

    //   return response;
    // } catch (error) {
    //   console.error('Error serving static content:', error);
    //   return new Response('Error serving content', { status: 500 });
    // }
  },
} satisfies ExportedHandler<Env>;
