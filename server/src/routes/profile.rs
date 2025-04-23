use std::sync::Arc;

use axum::{extract::Extension, Json};
use bson::doc;
use futures_util::TryStreamExt as _;
use hyper::{HeaderMap, StatusCode};
use mongodb::{Client, Collection};
use tracing::debug;

use crate::{
    auth::auth_session,
    models::{email::Email, profile::Profile, user::User},
};

pub async fn profile(
    headers: HeaderMap,
    Extension(db): Extension<Arc<Client>>,
) -> (StatusCode, Json<Option<Profile>>) {
    let token = headers
        .get("Authorization")
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();

    debug!("Getting profile: {}", token);

    let token_data = auth_session(token).await;

    debug!("Token Data: {}", token_data.is_none());

    if token_data.is_none() {
        return (StatusCode::BAD_REQUEST, Json(None));
    }

    let token_data = token_data.unwrap();

    debug!("Token Validated {:?}", token_data.claims);

    let users = db.database("twoclickmail").collection("users");

    let user: Option<User> = users
        .find_one(doc! {"_id": token_data.claims.uid}, None)
        .await
        .unwrap();

    debug!("User found: {:?}", user.is_none());
    if user.is_none() {
        return (StatusCode::BAD_REQUEST, Json(None));
    }

    let user = user.unwrap();

    debug!("User found: {:?}", user);

    let emails: Collection<Email> = db.database("twoclickmail").collection("emails");
    let emails: Vec<Email> = emails
        .find(doc! {"user_id": user._id.clone()}, None)
        .await
        .unwrap()
        .try_collect()
        .await
        .unwrap();

    if emails.is_empty() {
        return (
            StatusCode::OK,
            Json(Some(Profile {
                user,
                emails: vec![],
            })),
        );
    }

    (StatusCode::OK, Json(Some(Profile { user, emails })))
}
