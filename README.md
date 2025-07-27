<p align="center">
  <p align="center">
   <img width="150" height="150" src="https://raw.githubusercontent.com/CoderScreen/coderscreen/refs/heads/main/content/logo.png" alt="Logo">
  </p>
	<h1 align="center"><b>CoderScreen</b></h1>
	<p align="center">
		The modern technical hiring platform.
    <br />
    <a href="https://coderscreen.com"><strong>coderscreen.com »</strong></a>
  </p>
</p>
<br/>

CoderScreen is a collaborative code interview platform that enables real-time technical assessments with live code execution, multi-language support, and seamless candidate experience.

# Self Hosting

CoderScreen is available to self-host using Cloudflare Workers. Self-hosting documentation is coming soon.

# Monorepo App Architecture

We use a combination of React, TypeScript, Cloudflare Workers, PostgreSQL, Drizzle (ORM), TailwindCSS throughout this pnpm powered monorepo.

### Apps:

- `web`: A [React](https://reactjs.org) web app with TanStack Router.
- `api`: A [Cloudflare Workers](https://workers.cloudflare.com) API with Hono.js.
- `marketing`: A [Next.js](https://nextjs.org) marketing site.

### Packages:

- `ui`: A [React](https://reactjs.org) Shared component library.
- `db`: A [Drizzle ORM](https://orm.drizzle.team/) Shared database library.
- `common`: Shared utilities and types.
- `sandbox-sdk`: Code execution SDK for the sandbox environment. Fork of cloudflare's sandbox-sdk package.