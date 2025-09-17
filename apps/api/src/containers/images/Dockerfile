# syntax=docker/dockerfile:1

FROM oven/bun:1.0-alpine AS builder

# Install build dependencies and languages
RUN apk add --no-cache \
    # Build tools
    build-base \
    git \
    curl \
    wget \
    # Python
    python3 \
    py3-pip \
    python3-dev \
    libffi-dev \
    openssl-dev \
    # Node.js
    nodejs \
    npm \
    # Ruby
    ruby \
    ruby-dev \
    # PHP
    php \
    # Image processing libraries
    jpeg-dev \
    zlib-dev \
    freetype-dev

# Install Go from official binary (AMD64)
RUN wget -q https://go.dev/dl/go1.23.0.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz && \
    rm go1.23.0.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:$PATH"

# Install Java (OpenJDK 17)
RUN apk add --no-cache openjdk17-jdk

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:$PATH"
RUN rustup default stable

# Install uv for Python packages
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install Python packages with size optimization
RUN uv pip install --system --break-system-packages \
    # Core data science (minimal set)
    numpy pandas scipy \
    # ML frameworks (CPU-only, smaller versions)
    torch --index-url https://download.pytorch.org/whl/cpu \
    # Utilities (essential only)
    requests \
    # File processing (essential only)
    pillow && \
    # Cleanup Python cache
    find /usr -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true && \
    find /usr -type f -name "*.pyc" -delete


# Install Ruby gems (minimal set)
RUN gem install bundler --no-document

# Install Go packages (minimal)
RUN go install golang.org/x/tools/cmd/goimports@latest

FROM oven/bun:1.0-alpine AS runtime

# Install minimal runtime dependencies
RUN apk add --no-cache \
    # Build tools (needed for Go compilation)
    build-base \
    git \
    # Languages
    python3 \
    py3-pip \
    python3-dev \
    nodejs \
    npm \
    openjdk17-jdk \
    ruby \
    php \
    # Runtime libraries
    libffi \
    openssl \
    jpeg \
    zlib \
    freetype

# Install uv for Python packages in runtime stage
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install Python packages directly in runtime stage (minimal set)
RUN uv pip install --system --break-system-packages \
    # Core data science (minimal set)
    numpy pandas scipy \
    # ML frameworks (CPU-only, smaller versions)
    torch --index-url https://download.pytorch.org/whl/cpu \
    # Utilities (essential only)
    requests \
    # File processing (essential only)
    pillow && \
    # Cleanup Python cache
    find /usr -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true && \
    find /usr -type f -name "*.pyc" -delete

# Install Node.js global packages in runtime stage
RUN npm install -g \
    typescript \
    ts-node \
    @types/node && \
    npm cache clean --force

# Copy language installations
COPY --from=builder /usr/lib/ruby/gems /usr/lib/ruby/gems
COPY --from=builder /usr/local/bin/bundle* /usr/local/bin/
COPY --from=builder /root/go /root/go
COPY --from=builder /root/.cargo /root/.cargo
COPY --from=builder /root/.rustup /root/.rustup
COPY --from=builder /usr/local/go /usr/local/go

# Set environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk
ENV GOPATH=/root/go
ENV PATH=$PATH:$GOPATH/bin:/root/.cargo/bin:/usr/local/go/bin
ENV RUSTUP_HOME=/root/.rustup
ENV CARGO_HOME=/root/.cargo
ENV PYTHONPATH=/usr/local/lib/python3.12/site-packages:/usr/lib/python3.12/site-packages

# Initialize Rust toolchain in runtime stage
RUN /root/.cargo/bin/rustup default stable

# Final cleanup
RUN apk cache clean && rm -rf /tmp/* /var/tmp/*

WORKDIR /app

# Copy the container source from the sandbox package
COPY ./packages/sandbox-sdk/packages/sandbox/container_src/ .

# Copy all config files from the src/containers/images/config directory
COPY ./apps/api/src/containers/config/ .

EXPOSE 3000

CMD ["bun", "run", "index.ts"]