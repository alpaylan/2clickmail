use bson::{doc, Document};
use serde::{Deserialize, Serialize};

use super::user::Uid;

#[derive(Serialize, Deserialize, Debug)]
pub struct EmailData {
    pub to: Vec<String>,
    pub cc: Vec<String>,
    pub bcc: Vec<String>,
    pub subject: String,
    pub body: String,
}

impl From<EmailData> for Document {
    fn from(val: EmailData) -> Self {
        doc! {
                "to": val.to,
                "cc": val.cc,
                "bcc": val.bcc,
                "subject": val.subject,
                "body": val.body,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Email {
    pub _id: Uid,
    pub name: Option<String>,
    pub user_id: Option<Uid>,
    pub data: EmailData,
    pub count: usize,
}
