# CoderScreen

A modern, collaborative code interview platform built for seamless technical assessments and real-time coding sessions.

## 🚀 Features

### Core Functionality

- **Real-time Collaborative Coding**: Multi-user code editing with live synchronization
- **Multi-language Support**: Execute code in 10+ programming languages
- **Sandboxed Code Execution**: Secure, isolated code execution environment
- **Interview Management**: Create, manage, and conduct technical interviews
- **Guest Access**: Share interview rooms with candidates via public links
- **Rich Text Instructions**: Collaborative instruction editor with formatting
- **Code Execution History**: Track and review all code executions
- **User Presence**: See who's currently in the room with real-time indicators

### Supported Languages

- **JavaScript/TypeScript** - Node.js runtime
- **Python** - With popular data science libraries (numpy, pandas, matplotlib, etc.)
- **Java** - OpenJDK 11
- **C++** - GCC compiler
- **C** - GCC compiler
- **Go** - Latest stable version
- **Rust** - Cargo and rustc
- **Ruby** - MRI Ruby
- **PHP** - PHP runtime
- **Swift** - Swift compiler

### Security Features

- **Isolated Execution**: Each code run executes in a separate container
- **Resource Limits**: Configurable CPU and memory constraints
- **Timeout Protection**: 5-second execution timeout to prevent infinite loops
- **Network Isolation**: Controlled network access
- **File System Isolation**: Temporary file system per execution

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19, TypeScript, TanStack Router, Tailwind CSS
- **Backend**: Cloudflare Workers, Hono.js, PartyKit
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Y.js for collaborative editing, WebSockets
- **Code Execution**: Cloudflare Containers with custom sandbox
- **Authentication**: Better Auth
- **Deployment**: Cloudflare Workers and Pages

### Project Structure

```
codeinterview/
├── apps/
│   ├── api/                 # Backend API (Cloudflare Workers)
│   │   ├── src/
│   │   │   ├── durable-objects/    # Real-time collaboration
│   │   │   ├── routes/             # API endpoints
│   │   │   ├── services/           # Business logic
│   │   │   └── containers/         # Code execution sandbox
│   │   └── partykit.json          # PartyKit configuration
│   └── web/                 # Frontend application
│       ├── src/
│       │   ├── components/         # React components
│       │   ├── contexts/           # React contexts
│       │   ├── query/              # Data fetching
│       │   └── routes/             # Application routes
│       └── vite.config.ts
├── packages/
│   ├── common/              # Shared utilities
│   ├── db/                  # Database schema and migrations
│   └── sandbox-sdk/         # Code execution SDK
└── pnpm-workspace.yaml
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- pnpm
- Docker (for local sandbox development)
- Cloudflare account (for deployment)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd codeinterview
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy example environment files
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. **Build the sandbox container**
   ```bash
   pnpm sandbox:build
   ```

### Running Locally

1. **Start the API server**

   ```bash
   cd apps/api
   pnpm dev
   ```

2. **Start the web application**

   ```bash
   cd apps/web
   pnpm dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:8787

### Database Setup

1. **Set up PostgreSQL database**
2. **Run migrations**
   ```bash
   cd packages/db
   pnpm drizzle-kit push
   ```

## 🚀 Deployment

### Cloudflare Workers Deployment

1. **Configure Wrangler**

   ```bash
   # Set up your Cloudflare account
   wrangler login
   ```

2. **Deploy the API**

   ```bash
   cd apps/api
   pnpm cf-deploy
   ```

3. **Deploy the web application**
   ```bash
   cd apps/web
   pnpm cf-deploy
   ```

### Environment Configuration

Required environment variables for production:

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
AUTH_SECRET=your-secret-key
AUTH_URL=https://your-domain.com

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

## 📖 Usage

### Creating an Interview Room

1. **Sign up/Login** to your account
2. **Create a new room** from the dashboard
3. **Set the room title** and configure settings
4. **Share the room link** with candidates

### Conducting an Interview

1. **Join the room** as the interviewer
2. **Write instructions** in the collaborative editor
3. **Monitor candidate's code** in real-time
4. **Execute code** to test solutions
5. **Provide feedback** through the interface

### Guest Experience

1. **Click the shared link** to join as a guest
2. **Enter your name** to identify yourself
3. **Start coding** in the collaborative editor
4. **Run code** to test your solutions
5. **View instructions** and execution history

## 🔧 Configuration

### Customizing Code Execution

The sandbox supports customization through the container configuration:

```dockerfile
# Add custom packages
RUN apk add --no-cache your-package

# Install additional language tools
RUN npm install -g your-tool
```

### Adding New Languages

1. **Update the Dockerfile** in `apps/api/src/containers/images/`
2. **Add language support** in the code execution service
3. **Update the frontend** language selector
4. **Test the implementation**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests** for new functionality
5. **Submit a pull request**

### Code Style

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **API**: RESTful endpoints with OpenAPI specs
- **Database**: Drizzle ORM with migrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.coderscreen.com](https://docs.coderscreen.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/codeinterview/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/codeinterview/discussions)

## 🙏 Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/) for serverless infrastructure
- [Y.js](https://github.com/yjs/yjs) for collaborative editing
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for code editing
- [TanStack](https://tanstack.com/) for React ecosystem tools
- [PartyKit](https://partykit.io/) for real-time collaboration

---

Built with ❤️ for the developer community
