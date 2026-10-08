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

# Language servers for editor autocomplete, one per room language (see
# lsp-server/src/languages.ts). TypeScript, Python (pyright) and Bash come from
# lsp-server's npm dependencies below.
# Rust: rust-analyzer, plus the standard library's source for it to index.
RUN rustup component add rust-analyzer rust-src
# Go: gopls needs a newer Go to build than the room's 1.23. The toolchain it
# downloads only lives in the module cache, which is cleared afterwards.
# Telemetry off, or gopls runs a second process to collect it.
RUN GOTOOLCHAIN=go1.24.2 go install golang.org/x/tools/gopls@v0.20.0 \
    && mkdir -p /root/.config/go/telemetry && echo off > /root/.config/go/telemetry/mode \
    && go clean -modcache \
    && rm -rf /root/.cache/go-build
# C/C++: clangd. Ubuntu 22.04's is several years old.
RUN curl -fsSL -o /tmp/clangd.zip https://github.com/clangd/clangd/releases/download/23.1.0/clangd-linux-23.1.0.zip \
    && python3 -m zipfile -e /tmp/clangd.zip /opt/ \
    && mv /opt/clangd_23.1.0 /opt/clangd \
    && chmod +x /opt/clangd/bin/clangd \
    && rm /tmp/clangd.zip
# Java: Eclipse JDT language server. It needs Java 21, so it gets its own
# runtime rather than changing the room's Java 11.
RUN mkdir -p /opt/jdtls/jre \
    && curl -fsSL "https://api.adoptium.net/v3/binary/version/jdk-21.0.12.1%2B1/linux/x64/jre/hotspot/normal/eclipse" \
       | tar -xz -C /opt/jdtls/jre --strip-components=1 \
    && curl -fsSL https://download.eclipse.org/jdtls/milestones/1.61.0/jdt-language-server-1.61.0-202609031315.tar.gz \
       | tar -xz -C /opt/jdtls
# PHP: phpactor. Newer releases need PHP 8.2; the room has 8.1. It only
# completes PHP's built-in functions once it has indexed their stubs, so the
# config points it at them and the index is built here rather than on the
# room's first completion.
COPY lsp-server/phpactor.json /root/.config/phpactor/phpactor.json
RUN curl -fsSL -o /usr/local/bin/phpactor https://github.com/phpactor/phpactor/releases/download/2025.12.21.1/phpactor.phar \
    && chmod +x /usr/local/bin/phpactor \
    && mkdir -p /workspace && cd /workspace && phpactor index:build
# Ruby: solargraph. Newer releases need Ruby 3.1; the room has 3.0. ruby-dev
# is for building its native extensions.
RUN apt-get update && apt-get install -y --no-install-recommends ruby-dev \
    && gem install solargraph -v 0.58.3 --no-document \
    && rm -rf /var/lib/apt/lists/*

# Editor autocomplete: a WebSocket server that runs language servers for the
# room (see lsp-server/). The API starts it on demand and proxies to it.
# Dependencies first, so changing the server's code doesn't reinstall them.
COPY lsp-server/package.json lsp-server/package-lock.json /opt/lsp-server/
RUN cd /opt/lsp-server && npm ci && npm cache clean --force
COPY lsp-server/tsconfig.json /opt/lsp-server/
COPY lsp-server/src /opt/lsp-server/src
RUN cd /opt/lsp-server && npm run build && npm prune --omit=dev
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
