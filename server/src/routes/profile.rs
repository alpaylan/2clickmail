use std::sync::Arc;

use axum::{extract::Extension, Json};
use bson::doc;
use futures_util::TryStreamExt as _;
use hyper::{HeaderMap, StatusCode};
use mongodb::{Client, Collection};
use tracing::debug;

use crate::{
    auth::auth_session,
    models::{
        email::Email2,
        profile::Profile,
        user::User,
    },
};

pub async fn profile(
    headers: HeaderMap,
    Extension(db): Extension<Arc<Client>>,
) -> Result<Json<Option<Profile>>, StatusCode> {
    let token = headers
        .get("Authorization")
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();

    debug!("Getting profile: {}", token);

    let token_data = auth_session(token).await.ok_or(StatusCode::UNAUTHORIZED)?;

    debug!("Token Validated {:?}", token_data.claims);

    let users = db.database("twoclickmail").collection("users");

    let user: User = users
        .find_one(doc! {"_id": token_data.claims.uid}, None)
        .await
        .map_err(|_| {
            debug!("Failed to find user");
            StatusCode::INTERNAL_SERVER_ERROR
        })?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    debug!("User found: {:?}", user);

    let emails: Collection<Email2> = db.database("twoclickmail").collection("emails");
    let emails: Vec<Email2> = emails
        .find(doc! {"user_id": user._id.clone()}, None)
        .await
        .unwrap()
        .try_collect()
        .await
        .unwrap();

    Ok(Json(Some(Profile { user, emails })))
}
