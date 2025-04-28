extern crate twoclickmail;

use axum::{
    http::StatusCode,
    routing::{get, post},
    AddExtensionLayer, Router,
};

use std::net::SocketAddr;
use twoclickmail::{
    routes::{email, login, profile, register},
    MONGO_URL,
};

use mongodb::{options::ClientOptions, Client};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

use std::sync::Arc;

use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

#[tokio::main]
async fn main() {
    // initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "twoclickmail=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let db =
        Arc::new(Client::with_options(ClientOptions::parse(MONGO_URL.as_str()).await.unwrap()).unwrap());

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // build our application with a route
    let app = Router::new()
        .route("/register", post(register::register))
        .route("/login", post(login::login))
        .route("/profile", get(profile::profile))
        .route("/email", get(email::get).post(email::send))
        .route("/health", get(|| async { StatusCode::NO_CONTENT }))
        .layer(cors)
        .layer(AddExtensionLayer::new(db))
        .layer(TraceLayer::new_for_http());

    // run our app with hyper

    // check if this is dev
    let mut is_dev = false;
    for arg in std::env::args() {
        if arg == "--dev" {
            is_dev = true;
        }
    }

    let addr = if is_dev {
        SocketAddr::from(([127, 0, 0, 1], 8080))
    } else {
        SocketAddr::from(([0, 0, 0, 0], 8080))
    };
    tracing::debug!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
