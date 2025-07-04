# @cloudflare/sandbox example

This example demonstrates the full capabilities of the `@cloudflare/sandbox` package through an interactive web-based REPL that lets you execute commands in a sandboxed container environment.

## What This Example Does

This example creates a Cloudflare Worker that:

- Hosts a React-based web interface for interacting with a sandbox
- Routes API requests to a sandboxed container running Linux
- Demonstrates both regular and streaming command execution
- Shows real-time output from commands like `tail -f` or `top`

## Features

- **Interactive REPL**: Web-based command line interface
- **Real-time Streaming**: Execute commands with live output streaming
- **Session Management**: Maintains persistent sandbox sessions
- **Rich UI**: Modern React interface with command history and status indicators
- **Example Commands**: Built-in examples for common Linux commands

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm start
   ```

3. **Open your browser** and navigate to the URL shown in the terminal (typically `http://localhost:8787`)

4. **Try some commands** in the web interface:
   - `ls -la` - List files with details
   - `pwd` - Show current directory
   - `echo "Hello from sandbox!"` - Print text
   - `whoami` - Show current user
   - `cat /etc/os-release` - Display OS information

## Architecture

The example consists of:

- **Worker (`src/index.ts`)**: Cloudflare Worker that proxies requests to the sandbox
- **React App (`app/index.tsx`)**: Interactive web interface for the REPL
- **Dockerfile**: Container configuration using the sandbox base image
- **Wrangler Config**: Cloudflare configuration with container and Durable Object setup

## Key Concepts Demonstrated

1. **Container Integration**: Shows how to configure and deploy containers with Cloudflare Workers
2. **Durable Objects**: Uses Durable Objects for persistent sandbox sessions
3. **HTTP Client**: Implements the sandbox HTTP client for command execution
4. **Streaming**: Demonstrates real-time command output streaming
5. **Session Management**: Shows how to create and manage sandbox sessions

## Deployment

Containers on Cloudflare are currently [in public beta](https://blog.cloudflare.com/containers-are-available-in-public-beta-for-simple-global-and-programmable), available for all paid accounts. If you have one, you can simply run:

```bash
npm run deploy
```

## Understanding the Code

- The Worker acts as a proxy between the web interface and the sandbox container
- The React app uses the sandbox HTTP client to communicate with the Worker
- Commands are executed in the container and results are streamed back to the UI
- The Dockerfile extends the base sandbox image with the necessary runtime
