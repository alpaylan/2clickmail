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

#[derive(Serialize, Deserialize, Debug)]
pub struct Email2 {
    // a unique identifier for the email
    pub id: Uid,
    // a version identifier for the email
    // this is set to 0 for all emails in the new format
    // it can be used to track changes or updates to the email
    // in the future
    pub vid: u32,
    // the name of the email
    // this is an optional field
    // it can be used to store a display name or subject for the email
    pub name: Option<String>,
    // the user id of the email creator, is None for non-logged in emails
    pub user_id: Option<Uid>,
    // the data of the email
    pub data: EmailData,
    // a message associated with the email
    pub message: Option<String>,
    // the sent count of the email
    pub count: usize,
    // a flag indicating whether the email is anonymous
    // if it's false, the email will can accessed by `/email/:user_id/:id` instead of `/email/:id`
    // only available for user created emails
    pub anonymous: bool,
    // a flag indicating whether the email is active
    pub active: bool,
    // a flag indicating whether the email is deleted
    pub deleted: bool,
    // date of the email creation
    pub created_at: Option<String>,
}

impl Email2 {
    pub fn from_email(email: Email) -> Self {
        Self {
            id: email._id,
            vid: 0,
            name: email.name,
            user_id: email.user_id,
            anonymous: true,
            data: email.data,
            count: email.count,
            message: None,
            active: true,
            deleted: false,
            created_at: None,
        }
    }

    pub fn to_email(email: Email2) -> Email {
        Email {
            _id: email.id,
            name: email.name,
            user_id: email.user_id,
            data: email.data,
            count: email.count,
        }
    }
}
