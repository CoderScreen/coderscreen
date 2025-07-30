<div align="center">
  <img width="150" height="150" src="https://raw.githubusercontent.com/CoderScreen/coderscreen/refs/heads/main/content/logo.png" alt="CoderScreen Logo">
  
  <h1 align="center"><b>CoderScreen</b></h1>
  
  <p align="center">
    <strong>The modern technical hiring platform.</strong>
  </p>
  
  <div align="center">
    <a href="https://coderscreen.com">
      <strong>coderscreen.com »</strong>
    </a>
  </div>
  
  <div align="center" style="margin-top: 16px;">
    <a href="https://discord.gg/THxVTKtcZy">
      <img src="https://img.shields.io/badge/Discord-Join%20our%20community-blue?style=for-the-badge&logo=discord" alt="Join our Discord">
    </a>
  </div>
</div>

<br/>

CoderScreen is a collaborative code interview platform that enables real-time technical assessments with live code execution, multi-language support, and seamless candidate experience.

# Self Hosting

CoderScreen is available to self-host on Cloudflare. [See our quick start guide](QUICK_START.md) for more details.

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