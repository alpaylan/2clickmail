use axum::{
    routing::{get, post},
    http::{StatusCode, HeaderValue},
    Json,
    Router,
    extract::{Extension, Query}, AddExtensionLayer,
};
use bson::Document;
use hyper::HeaderMap;
use serde::{Deserialize, Serialize, __private::doc};
use std::{net::SocketAddr, collections::HashMap};

use mongodb::{bson::doc, options::{ClientOptions, UpdateOptions, UpdateModifications}, Client, Collection};
use jsonwebtoken::{encode, Header, EncodingKey, decode, DecodingKey, Validation, TokenData, Algorithm};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

use std::sync::Arc;
use futures_util::stream::TryStreamExt;

use tracing::{info, debug, error, warn, trace, instrument, span, Level};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

static SECRET_KEY : &'static str = std::env!("SECRET_KEY");
static MONGO_URL : &'static str = std::env!("MONGO_URL");



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



    let db = Arc::new(Client::with_options(ClientOptions::parse(MONGO_URL).await.unwrap()).unwrap());

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // build our application with a route
    let app = Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/profile", get(profile))
        .route("/email", get(get_email).post(post_email))
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
    // `axum::Server` is a re-export of `hyper::Server`
    let addr = SocketAddr::from(addr);
    tracing::debug!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}




#[derive(Deserialize, Debug)]
struct RegisterRequest {
    usermail: String,
    password: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct User {
    _id: UserId,
    usermail: String,
    password: String,
    username: Option<String>,
}


#[derive(Deserialize, Debug)]
struct LoginRequest {
    usermail: String,
    password: String,
}

type AccessToken = String;

#[derive(Serialize, Deserialize, Debug)]
struct Uid {}
impl Uid {
    fn new() -> String {
        bson::oid::ObjectId::new().to_string()
    }
}

type UserId = String;
type EmailId = String;

type ErrorMessage = String;

#[derive(Serialize)]
enum LoginResponse {
    Success(AccessToken),
    Failure(ErrorMessage),
}



fn create_jwt<T: Serialize>(claims: &T, secret: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
    let header = Header::default();
    let encoding_key = EncodingKey::from_secret(secret);

    encode(&header, claims, &encoding_key)
}


#[derive(Serialize, Deserialize, Debug)]
struct Claims {
    uid: UserId,
    iat: usize,
    exp: usize,
}

async fn login(
    Json(payload): Json<LoginRequest>,
    Extension(db) : Extension<Arc<Client>>,
) -> (StatusCode, Json<LoginResponse>) {
    // insert your application logic here

    debug!("Logging in user: {}", payload.usermail);

    let users = db.database("twoclickmail").collection("users");

    let user: Option<User> = users.find_one(doc! {"usermail": payload.usermail.clone()}, None).await.unwrap();

    if user.is_none() {
        return (StatusCode::BAD_REQUEST, Json(LoginResponse::Failure("User not found".to_string())));
    }

    let user = user.unwrap();

    if user.password != payload.password {
        return (StatusCode::BAD_REQUEST, Json(LoginResponse::Failure("Wrong password".to_string())));
    }

    let uid = user._id;
    let iat = chrono::Utc::now().timestamp() as usize;
    let exp = iat + 10000000;
    let claims = Claims { uid, iat, exp };

    let token = create_jwt(
        &claims,
        SECRET_KEY.to_owned().as_bytes(),
    ).unwrap();


    (StatusCode::OK, Json(LoginResponse::Success(token)))
    
}


#[derive(Serialize, Deserialize, Debug)]
enum RegisterResponse {
    Success(AccessToken),
    Failure(ErrorMessage),
}

async fn register(
    Json(payload): Json<RegisterRequest>,
    Extension(db) : Extension<Arc<Client>>,
) -> (StatusCode, Json<RegisterResponse>) {
    // insert your application logic here
    
    tracing::debug!("Registering user: {}", payload.usermail);

    let users = db.database("twoclickmail").collection("users");

    // Check if user already exists
    let user: Option<User> = users.find_one(doc! {"usermail": payload.usermail.clone()}, None).await.unwrap();

    if let Some(_) = user {
        return (StatusCode::BAD_REQUEST, Json(RegisterResponse::Failure("User already exists".to_string())));
    }

    let user = User { _id: Uid::new(), usermail: payload.usermail.clone(), password: payload.password.clone(), username: None };
    let uid = user._id.clone();
    users.insert_one(user, None).await.unwrap();

    let iat = chrono::Utc::now().timestamp() as usize;
    let exp = iat + 10000000;
    let claims = Claims { uid, iat, exp };

    let token = create_jwt(
        &claims,
        SECRET_KEY.to_owned().as_bytes(),
    ).unwrap();
    
    // this will be converted into a JSON response
    // with a status code of `201 Created`
    (StatusCode::CREATED, Json(RegisterResponse::Success(token)))
}



// #[derive(Deserialize)]
// struct LogoutRequest {
//     token: String,
// }

// #[derive(Serialize)]
// enum LogoutResponse {
//     Success,
//     Failure,
// }


// async fn logout(
//     Form(payload): Form<LogoutRequest>,
// ) -> (StatusCode, Json<LogoutResponse>) {

//     match auth_session(payload.token).await {
//         Some(_) => (StatusCode::OK, Json(LogoutResponse::Success)),
//         None => (StatusCode::BAD_REQUEST, Json(LogoutResponse::Failure)),
//     }
// }


#[derive(Serialize, Deserialize, Debug)]
struct EmailData {
    to: Vec<String>,
    cc: Vec<String>,
    bcc: Vec<String>,
    subject: String,
    body: String
}

impl Into<Document> for EmailData {
    fn into(self) -> Document {
        doc! {
                "to": self.to,
                "cc": self.cc,
                "bcc": self.bcc,
                "subject": self.subject,
                "body": self.body,
        }
    }
}



#[derive(Serialize, Deserialize, Debug)]
struct Email {
    _id: UserId,
    name: Option<String>,
    user_id: Option<UserId>,
    data: EmailData,
}


#[derive(Serialize)]
struct Profile {
    user: User,
    emails: Vec<Email>
}



async fn profile(
    headers: HeaderMap,
    Extension(db) : Extension<Arc<Client>>,
) -> (StatusCode, Json<Option<Profile>>) {

    let token = headers.get("Authorization").unwrap().to_str().unwrap().to_string();

    debug!("Getting profile: {}", token);

    let token_data = auth_session(token).await;


    debug!("Token Data: {}", token_data.is_none());

    if token_data.is_none() {
        return (StatusCode::BAD_REQUEST, Json(None));
    }

    let token_data = token_data.unwrap();

    debug!("Token Validated {:?}", token_data.claims);

    let users = db.database("twoclickmail").collection("users");

    let user: Option<User> = users.find_one(doc! {"_id": token_data.claims.uid}, None).await.unwrap();

    debug!("User found: {:?}", user.is_none());
    if user.is_none() {
        return (StatusCode::BAD_REQUEST, Json(None));
    }

    let user = user.unwrap();

    debug!("User found: {:?}", user);

    let emails : Collection<Email> = db.database("twoclickmail").collection("emails");
    let emails: Vec<Email> = emails.find(doc! {"user_id": user._id.clone()}, None).await.unwrap().try_collect().await.unwrap();

    if emails.len() == 0 {
        return (StatusCode::OK, Json(Some(Profile { user, emails: vec![] })));
    }

    (StatusCode::OK, Json(Some(Profile { user, emails })))
}

#[derive(Serialize, Deserialize)]
struct Credentials {
    token: String,
    usermail: String,
}



#[derive(Serialize, Deserialize, Debug)]
struct GenerateRequest {
    name: Option<String>,
    id: Option<EmailId>,
    email: EmailData,
}

async fn post_email(
    headers: HeaderMap,
    body: String, // Json(payload): Json<GenerateRequest>,
    Extension(db) : Extension<Arc<Client>>,
) -> (StatusCode, Json<Option<EmailId>>) {

    let token = headers.get("Authorization");

    let payload: GenerateRequest = serde_json::from_str(&body).unwrap();

    debug!("Generating email: {:?}", payload);

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

            let user: Option<User> = users.find_one(doc! {"_id": token_data.claims.uid}, None).await.unwrap();

            if user.is_none() {
                debug!("User not found");
                return (StatusCode::BAD_REQUEST, Json(None));
            }

            let user = user.unwrap();

            debug!("User found: {:?}", user);

            Some(user._id)
        }
        None => {
            None
        }
    };


    let emails : Collection<Email> = db.database("twoclickmail").collection("emails");

            
    match payload.id {
        Some(id) => {

            let query = match user_id {
                Some(user_id) => doc! {"_id": id.clone(), "user_id": user_id},
                None => doc! {"_id": id.clone()}
            };
            let update = doc! { "$set": { "data": <EmailData as Into<Document>>::into(payload.email) } };
            let options = Some(UpdateOptions::builder().upsert(true).build());

            emails.update_one(query, update, options).await.unwrap();

            debug!("Email updated");

            (StatusCode::OK, Json(Some(id)))
        },
        None => {
            let email = Email { _id: Uid::new(), name: payload.name, user_id: user_id, data: payload.email };
            let email_id = email._id.clone();
            emails.insert_one(email, None).await.unwrap();

            debug!("Email inserted");

            (StatusCode::OK, Json(Some(email_id)))
        }
    }
}

async fn get_email(
    Query(params): Query<HashMap<String, String>>,
    Extension(db) : Extension<Arc<Client>>,
) -> (StatusCode, Json<Option<Email>>) {
    
        debug!("Getting email: {:?}", params);
        let payload = params.get("$value");
        debug!("Getting email: {:?}", payload);

        if payload.is_none() {
            return (StatusCode::BAD_REQUEST, Json(None));
        }

        let payload = payload.unwrap();



        let emails : Collection<Email> = db.database("twoclickmail").collection("emails");
        debug!("old: {:?}", emails.find_one(doc! { "_id": payload }, None).await.unwrap());
        let email = emails.find_one(doc! { "$or": [{ "_id": payload }, { "name": payload }]}, None).await.unwrap();
        
        debug!("Email found: {:?}", email);

        match email {
            Some(email) => (StatusCode::OK, Json(Some(email))),
            None => (StatusCode::BAD_REQUEST, Json(None)),
        }
}



async fn auth_session(token: String) -> Option<TokenData<Claims>> {

    let token = token.replace("Bearer ", "");
    debug!("Authenticating session: {}", token);
    let token_message = decode::<Claims>(&token, &DecodingKey::from_secret(SECRET_KEY.as_ref()), &Validation::new(Algorithm::HS256));

    debug!("Token Message: {:?}", token_message);

    if token_message.is_err() {
        return None;
    }

    Some(token_message.unwrap())
}


