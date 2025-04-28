// Auth module. Handles authentication and authorization.

use std::sync::Arc;

use axum::{extract::Extension, Json};
use bson::doc;
use hyper::StatusCode;
use mongodb::Client;
use pwhash::bcrypt;
use serde::{Deserialize, Serialize};
use tracing::debug;

use crate::{
    auth::{create_jwt, Claims},
    models::user::User,
    SECRET_KEY,
};

#[derive(Deserialize, Debug)]
pub struct Request {
    pub usermail: String,
    pub password: String,
}

pub type AccessToken = String;

pub async fn login(
    Json(payload): Json<Request>,
    Extension(db): Extension<Arc<Client>>,
) -> Result<AccessToken, StatusCode> {
    // insert your application logic here

    debug!("Logging in user: {}", payload.usermail);

    let users = db.database("twoclickmail").collection("users");

    let user: Option<User> = users
        .find_one(doc! {"usermail": payload.usermail.clone()}, None)
        .await
        .unwrap();

    if user.is_none() {
        debug!("user not found: {}", payload.usermail);
        return Err(StatusCode::BAD_REQUEST);
    }

    let user = user.unwrap();

    if !bcrypt::verify(payload.password.clone(), &user.password) {
        debug!("wrong password {} for user: {}", payload.password, payload.usermail);
        return Err(StatusCode::BAD_REQUEST);
    }

    let uid = user._id;
    let iat = chrono::Utc::now().timestamp() as usize;
    let exp = iat + 10000000;
    let claims = Claims { uid, iat, exp };

    let token = create_jwt(&claims, SECRET_KEY.to_owned().as_bytes()).unwrap();

    Ok(token)
}
