import { getSandbox, type Sandbox } from "@cloudflare/sandbox";

export { Sandbox } from "@cloudflare/sandbox";

type Env = {
  Sandbox: DurableObjectNamespace<Sandbox>;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;

    if (pathname.startsWith("/api")) {
      const sandbox = getSandbox(env.Sandbox, "my-sandbox");
      return sandbox.containerFetch(request);
    }

    if (pathname.startsWith("/test-file")) {
      // write a file to the sandbox
      const sandbox = getSandbox(env.Sandbox, "my-sandbox");
      await sandbox.writeFile("/test-file.txt", "Hello, world!" + Date.now());
      const file = await sandbox.readFile("/test-file.txt");
      return new Response(file!.content, { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  },
};
