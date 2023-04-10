FROM rust:slim-buster AS builder

WORKDIR /prod
ENV SECRET_KEY="my_super_secret_key_akelesssss"
ENV MONGO_URL="mongodb+srv://akeles:4YgGVZYXg1OhJzu0@massmail01.8udvkhi.mongodb.net/?retryWrites=true&w=majority"
ENV PUBLIC_URL="https://2clickmail.com"

COPY Cargo.lock .
COPY Cargo.toml .
# RUN mkdir .cargo
# This is the trick to speed up the building process.
# RUN cargo vendor > .cargo/config

COPY . .
RUN cargo build --release

# Use any runner as you want
# But beware that some images have old glibc which makes rust unhappy
FROM fedora:34 AS runner
COPY --from=builder /prod/target/release/twoclickmail /bin