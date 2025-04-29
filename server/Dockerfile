# 1. Build stage
FROM rust:1.81 as builder

WORKDIR /app

COPY . .

# Install musl tools + build statically
RUN rustup target add x86_64-unknown-linux-musl && \
    apt-get update && apt-get install -y musl-tools pkg-config libssl-dev && \
    cargo build --release --target x86_64-unknown-linux-musl

# 2. Runtime stage
FROM debian:bullseye-slim

RUN adduser --disabled-login appuser

COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/twoclickmail /usr/local/bin/app

RUN chown appuser:appuser /usr/local/bin/app
USER appuser

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/app"]
