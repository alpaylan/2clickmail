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
) -> Result<Json<Response>, StatusCode> {
    // insert your application logic here

    tracing::debug!("Registering user: {}", payload.usermail);

    let users = db.database("twoclickmail").collection("users");

    let (count, user) = tokio::join!(
        // Count the number of users
        users.count_documents(None, None),
        // Find the user
        users.find_one(doc! {"usermail": payload.usermail.clone()}, None)
    );
    let count = count.unwrap();
    tracing::debug!("User count: {}", count);

    let user = user.unwrap();
    tracing::debug!("User: {:?}", user);

    if user.is_some() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let encrypted_password = bcrypt::hash(payload.password).unwrap();

    let user = User {
        _id: Uid::new_user(count),
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

    Ok(Json(Response::Success(token)))
}
