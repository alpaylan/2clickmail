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
pub type ErrorMessage = String;

#[derive(Serialize)]
pub enum Response {
    Success(AccessToken),
    Failure(ErrorMessage),
}

pub async fn login(
    Json(payload): Json<Request>,
    Extension(db): Extension<Arc<Client>>,
) -> (StatusCode, Json<Response>) {
    // insert your application logic here

    debug!("Logging in user: {}", payload.usermail);

    let users = db.database("twoclickmail").collection("users");

    let user: Option<User> = users
        .find_one(doc! {"usermail": payload.usermail.clone()}, None)
        .await
        .unwrap();

    if user.is_none() {
        return (
            StatusCode::BAD_REQUEST,
            Json(Response::Failure("User not found".to_string())),
        );
    }

    let user = user.unwrap();

    if !bcrypt::verify(payload.password, &user.password) {
        return (
            StatusCode::BAD_REQUEST,
            Json(Response::Failure("Wrong password".to_string())),
        );
    }

    let uid = user._id;
    let iat = chrono::Utc::now().timestamp() as usize;
    let exp = iat + 10000000;
    let claims = Claims { uid, iat, exp };

    let token = create_jwt(&claims, SECRET_KEY.to_owned().as_bytes()).unwrap();

    (StatusCode::OK, Json(Response::Success(token)))
}
