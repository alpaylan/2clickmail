use std::{collections::HashMap, sync::Arc};

use axum::{
    extract::{Extension, Query},
    Json,
};
use bson::{doc, Document};
use hyper::{HeaderMap, StatusCode};
use mongodb::{
    options::{FindOneOptions, UpdateOptions},
    Client, Collection,
};
use serde::{Deserialize, Serialize};
use tracing::{debug, error, info};

use crate::{
    auth::auth_user,
    models::{
        email::{Email2, EmailData},
        user::Uid,
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
) -> Result<Json<Option<Uid>>, StatusCode> {
    let token = headers.get("Authorization");
    debug!("Token: {:?}", token);
    debug!("Body: {:?}", body);
    let payload: Request = serde_json::from_str(&body).unwrap();

    let user = match token {
        Some(token) => Some(
            auth_user(
                token
                    .to_str()
                    .map_err(|_| StatusCode::UNAUTHORIZED)?
                    .to_string(),
                Arc::clone(&db),
            )
            .await
            .map_err(|_| StatusCode::UNAUTHORIZED)?,
        ),
        None => None,
    };

    let emails: Collection<Email2> = db.database("twoclickmail").collection("emails");

    match payload {
        Request::GenerateMail { name, email } => {
            let count = emails
                .count_documents(None, None)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            let email = Email2 {
                id: Uid::new_email(count),
                name,
                user_id: user.as_ref().map(|u| u._id.clone()),
                data: email,
                count: 0,
                vid: 0,
                anonymous: false,
                message: None,
                active: true,
                deleted: false,
                created_at: Some(chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)),
            };

            let email_id = email.id.clone();
            emails.insert_one(email, None).await.unwrap();

            info!("Email inserted");

            Ok(Json(Some(email_id)))
        }
        Request::UpdateMail { id, name: _, email } => {
            let user = user.ok_or_else(|| {
                debug!("User is required for UpdateMail or DeleteMail");
                StatusCode::UNAUTHORIZED
            })?;

            let query = doc! {"id": id.clone(), "user_id": user._id};
            let update = doc! { "$set": { "data": <EmailData as Into<Document>>::into(email) } };
            let options = Some(UpdateOptions::builder().upsert(true).build());

            let result = emails.update_one(query, update, options).await.unwrap();

            if result.matched_count == 0 {
                error!("email with '{}' is not found, could not update", id.0);
                return Err(StatusCode::BAD_REQUEST);
            }

            info!("Email updated");

            Ok(Json(Some(id)))
        }
        Request::DeleteMail { id } => {
            let user = user.ok_or_else(|| {
                debug!("User is required for UpdateMail or DeleteMail");
                StatusCode::UNAUTHORIZED
            })?;

            let query = doc! {"id": id.clone(), "user_id": user._id};
            let result = emails.delete_one(query, None).await.unwrap();

            if result.deleted_count == 0 {
                error!("email with '{}' is not found, could not delete", id.0);
                return Err(StatusCode::BAD_REQUEST);
            }

            info!("Email deleted");

            Ok(Json(Some(id)))
        }
        Request::IncreaseSentCount { id } => {
            let query = doc! {"id": id.clone()};
            let update = doc! { "$inc": { "count": 1 } };
            let result = emails.update_one(query, update, None).await.unwrap();

            if result.matched_count == 0 {
                error!("email with '{}' is not found, could not increment count", id.0);
                return Err(StatusCode::BAD_REQUEST);
            }

            info!("Sent count increased");

            Ok(Json(Some(id)))
        }
    }
}

pub async fn get(
    Query(params): Query<HashMap<String, String>>,
    Extension(db): Extension<Arc<Client>>,
) -> Result<Json<Email2>, StatusCode> {
    debug!("Getting email: {:?}", params);
    let payload = params.get("value");
    debug!("value: {:?}", payload);

    let payload = payload.ok_or(StatusCode::BAD_REQUEST)?;

    let emails: Collection<Email2> = db.database("twoclickmail").collection("emails");

    debug!("querying emails: '{{ \"$or\": [{{ \"id\": \"{payload}\" }}, {{ \"name\": \"{payload}\" }}]}}'");

    let email = emails
        .find_one(
            doc! { "$or": [{ "id": payload }, { "name": payload }]},
            FindOneOptions::builder()
                .max_time(std::time::Duration::from_secs(1))
                .build(),
        )
        .await
        .unwrap();

    debug!("email found: {:?}", email);

    email.map(Json).ok_or(StatusCode::BAD_REQUEST)
}
