<div align="center">
  <img width="120" height="120" src="https://raw.githubusercontent.com/CoderScreen/coderscreen/refs/heads/main/content/logo.png" alt="CoderScreen Logo">

  <h1><b>CoderScreen</b></h1>

  <p>
    <strong>The open-source platform for technical hiring.</strong><br/>
    Live coding interviews, auto-graded assessments, and take-homes — in one place you can actually host yourself.
  </p>

  <p>
    <a href="https://coderscreen.com"><strong>Website</strong></a> ·
    <a href="QUICK_START.md"><strong>Self-host</strong></a> ·
    <a href="https://discord.gg/THxVTKtcZy"><strong>Community</strong></a>
  </p>

  <p>
    <a href="https://github.com/CoderScreen/coderscreen/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square" alt="License: GPLv3">
    </a>
    <a href="https://github.com/CoderScreen/coderscreen/stargazers">
      <img src="https://img.shields.io/github/stars/CoderScreen/coderscreen?style=flat-square&logo=github" alt="GitHub stars">
    </a>
    <a href="https://github.com/CoderScreen/coderscreen/pulls">
      <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs welcome">
    </a>
    <a href="https://discord.gg/THxVTKtcZy">
      <img src="https://img.shields.io/discord/1234567890?style=flat-square&logo=discord&label=Discord&color=5865F2" alt="Discord">
    </a>
  </p>
</div>


## Why we built this

Hiring engineers is hard, and the tools don't help. Most interview platforms are closed boxes. You can't see how they run candidate code, you can't change them to fit how you work, and you end up using one tool for live interviews, another for take-homes, and a spreadsheet to track it all.

We wanted one platform that does all of it: live interviews, async screening, and take-homes. One that runs candidate code out in the open, and that you can read, fork, and host yourself. So we built CoderScreen and made it open source.

If you've ever spent a night reading half-finished take-homes, or sat through an hour-long interview with someone who couldn't get past FizzBuzz, this is for you.

## What you get

**A live editor candidates actually like.** Everyone codes in the same editor in real time, with live cursors. Candidates just click a link to join. No accounts, no downloads, no "can you share your screen?"

**Code that actually runs.** Run code in a secure sandbox and see the output right away: `stdout`, `stderr`, and exit codes. It works with 20+ languages like TypeScript, Python, Go, Rust, Java, and C++. Multi-file projects work too, and you get live browser previews for React, Vue, and Svelte.

**Screening that grades itself.** Build a coding test once and send candidates a link. Results come back scored automatically. Pull questions from a shared library, make the hard ones worth more, and get one clear score per candidate. No rubrics to argue over.

**See how they think.** Replay every keystroke to see how a candidate got to their answer, not just where they ended up. AI is part of real work now, so you can also watch how they prompt and iterate with the built-in assistant.

**Make it yours.** Add your logo and colors, then track your hiring metrics to see where things slow down.

## Self-hosting

CoderScreen is fully open source and self-hostable on Cloudflare. Grab the code and follow the **[Quick Start guide](QUICK_START.md)** to get an instance running locally or in production.

```bash
git clone https://github.com/CoderScreen/coderscreen.git
cd coderscreen
pnpm install
```

Self-hosting is something we're actively polishing, so if you hit a snag, come say hi in [Discord](https://discord.gg/THxVTKtcZy) — we're happy to help you get unstuck.

## Tech stack

CoderScreen is a [pnpm](https://pnpm.io) monorepo built with React, TypeScript, Cloudflare Workers, PostgreSQL, Drizzle ORM, and TailwindCSS.

### Apps

| App         | What it is                                                          |
| ----------- | ------------------------------------------------------------------ |
| `web`       | [React](https://reactjs.org) app with TanStack Router.             |
| `api`       | [Cloudflare Workers](https://workers.cloudflare.com) API with Hono.|
| `marketing` | [Next.js](https://nextjs.org) marketing site.                      |

### Packages

| Package       | What it is                                                                     |
| ------------- | ------------------------------------------------------------------------------ |
| `ui`          | Shared [React](https://reactjs.org) component library.                         |
| `db`          | Shared [Drizzle ORM](https://orm.drizzle.team/) schema and client.             |
| `email`       | Shared email templates.                                                        |
| `common`      | Shared utilities and types.                                                    |
| `scripts`     | Operational and maintenance scripts.                                           |

## Contributing

We'd genuinely love your help — bug fixes, new features, better docs, or just telling us where things are confusing.

1. Fork the repo and branch off `main`.
2. Follow the [Quick Start guide](QUICK_START.md) to get set up.
3. Open a pull request and tell us what you changed and why.

Got an idea or a question first? Start a [discussion](https://github.com/CoderScreen/coderscreen/discussions) or drop into our [Discord](https://discord.gg/THxVTKtcZy). And if the project is useful to you, a ⭐ goes a long way.

## License

CoderScreen is licensed under the [GNU General Public License v3.0](LICENSE).
