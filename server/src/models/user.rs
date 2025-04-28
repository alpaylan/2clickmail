use serde::{Deserialize, Serialize};

use crate::{EMAIL_GEN, USER_GEN};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Uid(pub String);
impl Uid {
    pub fn new() -> Self {
        Self(bson::oid::ObjectId::new().to_string())
    }

    pub fn new_user(c: u64) -> Self {
        Self(USER_GEN.encode_string(c).unwrap().to_string())
    }

    pub fn new_email(c: u64) -> Self {
        Self(EMAIL_GEN.encode_string(c).unwrap().to_string())
    }
}

impl From<Uid> for bson::Bson {
    fn from(val: Uid) -> Self {
        bson::Bson::String(val.0)
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub _id: Uid,
    pub usermail: String,
    pub password: String,
    pub username: Option<String>,
}
