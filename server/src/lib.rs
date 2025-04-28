use std::sync::LazyLock;

pub mod auth;
pub mod models;
pub mod routes;

pub static SECRET_KEY: &str = std::env!("SECRET_KEY");
pub static MONGO_URL: &str = std::env!("MONGO_URL");

pub static USER_SEED: &str = std::env!("USER_SEED");
pub static EMAIL_SEED: &str = std::env!("EMAIL_SEED");

pub static USER_GEN: LazyLock<block_id::BlockId<char>> = LazyLock::new(|| {
    block_id::BlockId::new(
        block_id::Alphabet::lowercase_alphanumeric(),
        USER_SEED.parse().unwrap(),
        6,
    )
});

pub static EMAIL_GEN: LazyLock<block_id::BlockId<char>> = LazyLock::new(|| {
    block_id::BlockId::new(
        block_id::Alphabet::lowercase_alphanumeric(),
        EMAIL_SEED.parse().unwrap(),
        6,
    )
});
