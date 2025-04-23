use std::sync::Arc;

use crate::{
    auth::{create_jwt, Claims},
    models::user::{Uid, User},
    routes::login::{Request, Response},
    SECRET_KEY,
};
use axum::{extract::Extension, Json};
use bson::doc;
use hyper::StatusCode;
use mongodb::Client;
use pwhash::bcrypt;

pub async fn register(
    Json(payload): Json<Request>,
    Extension(db): Extension<Arc<Client>>,
) -> (StatusCode, Json<Response>) {
    // insert your application logic here

    tracing::debug!("Registering user: {}", payload.usermail);

    let users = db.database("twoclickmail").collection("users");

    // Check if user already exists
    let user: Option<User> = users
        .find_one(doc! {"usermail": payload.usermail.clone()}, None)
        .await
        .unwrap();

    if user.is_some() {
        return (
            StatusCode::BAD_REQUEST,
            Json(Response::Failure("User already exists".to_string())),
        );
    }

    let encrypted_password = bcrypt::hash(payload.password).unwrap();

    let user = User {
        _id: Uid::new(),
        usermail: payload.usermail,
        password: encrypted_password,
        username: None,
    };
    let uid = user._id.clone();
    users.insert_one(user, None).await.unwrap();

    let iat = chrono::Utc::now().timestamp() as usize;
    let exp = iat + 10000000;
    let claims = Claims { uid, iat, exp };

    let token = create_jwt(&claims, SECRET_KEY.to_owned().as_bytes()).unwrap();

    // this will be converted into a JSON response
    // with a status code of `201 Created`
    (StatusCode::CREATED, Json(Response::Success(token)))
}
