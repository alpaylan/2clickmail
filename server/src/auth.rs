use jsonwebtoken::{
    decode, encode, Algorithm, DecodingKey, EncodingKey, Header, TokenData, Validation,
};
use serde::{Deserialize, Serialize};
use tracing::debug;

use crate::{models::user::Uid, SECRET_KEY};

pub fn create_jwt<T: Serialize>(
    claims: &T,
    secret: &[u8],
) -> Result<String, jsonwebtoken::errors::Error> {
    let header = Header::default();
    let encoding_key = EncodingKey::from_secret(secret);

    encode(&header, claims, &encoding_key)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Claims {
    pub uid: Uid,
    pub iat: usize,
    pub exp: usize,
}

pub async fn auth_session(token: String) -> Option<TokenData<Claims>> {
    let token = token.replace("Bearer ", "");
    debug!("Authenticating session: {}", token);
    let token_message = decode::<Claims>(
        &token,
        &DecodingKey::from_secret(SECRET_KEY.as_ref()),
        &Validation::new(Algorithm::HS256),
    );

    debug!("Token Message: {:?}", token_message);

    if token_message.is_err() {
        return None;
    }

    Some(token_message.unwrap())
}
