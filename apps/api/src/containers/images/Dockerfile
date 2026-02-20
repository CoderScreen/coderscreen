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

RUN mkdir -p /workspace
WORKDIR /container-server
EXPOSE 3000
