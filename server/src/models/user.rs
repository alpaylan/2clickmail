use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Uid(String);
impl Uid {
    pub fn new() -> Self {
        Self(bson::oid::ObjectId::new().to_string())
    }
}

impl From<Uid> for bson::Bson {
    fn from(val: Uid) -> Self {
        bson::Bson::String(val.0.into())
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub _id: Uid,
    pub usermail: String,
    pub password: String,
    pub username: Option<String>,
}
