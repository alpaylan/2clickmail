use std::{collections::HashMap, sync::Arc};

use axum::{
    extract::{Extension, Query},
    Json,
};
use bson::{doc, Document};
use hyper::{HeaderMap, StatusCode};
use mongodb::{options::UpdateOptions, Client, Collection};
use serde::{Deserialize, Serialize};
use tracing::{debug, info};

use crate::{
    auth::auth_session,
    models::{
        email::{Email, EmailData},
        user::{Uid, User},
    },
};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "mode")]
enum Request {
    #[serde(rename = "generate")]
    GenerateMail {
        name: Option<String>,
        email: EmailData,
    },
    #[serde(rename = "update")]
    UpdateMail {
        id: Uid,
        name: Option<String>,
        email: EmailData,
    },
    #[serde(rename = "delete")]
    DeleteMail { id: Uid },
    #[serde(rename = "increment_sent_count")]
    IncreaseSentCount { id: Uid },
}

pub async fn send(
    headers: HeaderMap,
    body: String, // Json(payload): Json<GenerateRequest>,
    Extension(db): Extension<Arc<Client>>,
) -> (StatusCode, Json<Option<Uid>>) {
    let token = headers.get("Authorization");
    debug!("Token: {:?}", token);
    debug!("Body: {:?}", body);
    let payload: Request = serde_json::from_str(&body).unwrap();

    let user_id = match token {
        Some(token) => {
            let token = token.to_str().unwrap().to_string();
            let token_data = auth_session(token).await;

            if token_data.is_none() {
                debug!("Token invalid");
                return (StatusCode::BAD_REQUEST, Json(None));
            }

            let token_data = token_data.unwrap();

            let users = db.database("twoclickmail").collection("users");

            let user: Option<User> = users
                .find_one(doc! {"_id": token_data.claims.uid}, None)
                .await
                .unwrap();

            if user.is_none() {
                debug!("User not found");
                return (StatusCode::BAD_REQUEST, Json(None));
            }

            let user = user.unwrap();

            debug!("User found: {:?}", user);

            Some(user._id)
        }
        None => None,
    };

    let emails: Collection<Email> = db.database("twoclickmail").collection("emails");

    match payload {
        Request::GenerateMail { name, email } => {
            let email = Email {
                _id: Uid::new(),
                name,
                user_id,
                data: email,
                count: 0,
            };
            let email_id = email._id.clone();
            emails.insert_one(email, None).await.unwrap();

            info!("Email inserted");

            (StatusCode::OK, Json(Some(email_id)))
        }
        Request::UpdateMail { id, name: _, email } => match user_id {
            Some(user_id) => {
                let query = doc! {"_id": id.clone(), "user_id": user_id};
                let update =
                    doc! { "$set": { "data": <EmailData as Into<Document>>::into(email) } };
                let options = Some(UpdateOptions::builder().upsert(true).build());

                emails.update_one(query, update, options).await.unwrap();

                info!("Email updated");

                (StatusCode::OK, Json(Some(id)))
            }
            None => (StatusCode::BAD_REQUEST, Json(None)),
        },
        Request::DeleteMail { id } => match user_id {
            Some(user_id) => {
                let query = doc! {"_id": id.clone(), "user_id": user_id};
                emails.delete_one(query, None).await.unwrap();

                info!("Email deleted");

                (StatusCode::OK, Json(Some(id)))
            }
            None => (StatusCode::BAD_REQUEST, Json(None)),
        },
        Request::IncreaseSentCount { id } => {
            let query = doc! {"_id": id.clone()};
            let update = doc! { "$inc": { "count": 1 } };
            let options = Some(UpdateOptions::builder().upsert(true).build());

            emails.update_one(query, update, options).await.unwrap();

            info!("Sent count increased");

            (StatusCode::OK, Json(Some(id)))
        }
    }
}

pub async fn get(
    Query(params): Query<HashMap<String, String>>,
    Extension(db): Extension<Arc<Client>>,
) -> (StatusCode, Json<Option<Email>>) {
    debug!("Getting email: {:?}", params);
    let payload = params.get("value");
    debug!("Getting email: {:?}", payload);

    if payload.is_none() {
        return (StatusCode::BAD_REQUEST, Json(None));
    }

    let payload = payload.unwrap();

    let emails: Collection<Email> = db.database("twoclickmail").collection("emails");
    debug!(
        "old: {:?}",
        emails
            .find_one(doc! { "_id": payload }, None)
            .await
            .unwrap()
    );
    let email = emails
        .find_one(
            doc! { "$or": [{ "_id": payload }, { "name": payload }]},
            None,
        )
        .await
        .unwrap();

    debug!("Email found: {:?}", email);

    match email {
        Some(email) => (StatusCode::OK, Json(Some(email))),
        None => (StatusCode::BAD_REQUEST, Json(None)),
    }
}
