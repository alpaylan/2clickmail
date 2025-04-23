use serde::{Deserialize, Serialize};

use super::{email::Email, user::User};

#[derive(Serialize, Deserialize)]
pub struct Profile {
    pub user: User,
    pub emails: Vec<Email>,
}
