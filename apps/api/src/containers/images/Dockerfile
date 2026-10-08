# CoderScreen Sandbox - Based on official Cloudflare Sandbox SDK
# The base image includes the /sandbox binary that handles the container control plane
FROM docker.io/cloudflare/sandbox:0.7.4

# Install language runtimes (no ML libraries)
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Python
    python3 python3-pip python3-venv \
    # Ruby
    ruby \
    # PHP
    php-cli \
    # Java (OpenJDK 17)
    default-jdk \
    # C/C++ build tools
    build-essential \
    # Utilities
    curl wget git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install cloudflared for local dev preview tunnels
RUN ARCH=$(dpkg --print-architecture) && \
    curl -L -k --output cloudflared "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}" && \
    chmod +x cloudflared && \
    mv cloudflared /usr/local/bin/

# Install Go (AMD64)
RUN wget -q https://go.dev/dl/go1.23.0.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz && \
    rm go1.23.0.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:/root/go/bin:${PATH}"
ENV GOPATH="/root/go"

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install TypeScript support globally
RUN npm install -g typescript tsx @types/node && npm cache clean --force

# Editor autocomplete: a WebSocket server that runs language servers for the
# room (see lsp-server/). The API starts it on demand and proxies to it.
COPY lsp-server/package.json lsp-server/package-lock.json lsp-server/tsconfig.json /opt/lsp-server/
COPY lsp-server/src /opt/lsp-server/src
RUN cd /opt/lsp-server \
    && npm ci \
    && npm run build \
    && npm prune --omit=dev \
    && npm cache clean --force
# The TypeScript language server finds this by walking up from /workspace, so
# the room is one project with Node types without a config file in the
# candidate's workspace. It's a jsconfig.json because tsx, which runs the
# candidate's code, only looks for tsconfig.json, so this can't change how
# their code runs.
COPY lsp-server/workspace-jsconfig.json /jsconfig.json

RUN mkdir -p /workspace
WORKDIR /container-server
EXPOSE 3000
# Editor autocomplete (lsp-server). wrangler dev only forwards exposed ports.
EXPOSE 5005
