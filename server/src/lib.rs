use std::sync::LazyLock;

pub mod auth;
pub mod models;
pub mod routes;

pub static IS_DEV : LazyLock<bool> = LazyLock::new(|| {
    std::env::args().any(|arg| arg == "--dev")
});

pub static SECRET_KEY: LazyLock<String> = LazyLock::new(|| {
    std::env::var("SECRET_KEY").unwrap_or_else(|_| panic!("SECRET_KEY must be set"))
});
pub static MONGO_URL: LazyLock<String> = LazyLock::new(|| {
    if IS_DEV.clone() {
        std::env::var("DEV_MONGO_URL").unwrap_or_else(|_| panic!("SECRET_KEY must be set"))
    } else {
        std::env::var("MONGO_URL").unwrap_or_else(|_| panic!("SECRET_KEY must be set"))
    }
});

pub static USER_SEED: LazyLock<String> = LazyLock::new(|| {
    std::env::var("USER_SEED").unwrap_or_else(|_| panic!("SECRET_KEY must be set"))
});
pub static EMAIL_SEED: LazyLock<String> = LazyLock::new(|| {
    std::env::var("EMAIL_SEED").unwrap_or_else(|_| panic!("SECRET_KEY must be set"))
});

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
