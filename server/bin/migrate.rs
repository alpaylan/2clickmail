use bson::{doc, Bson};

use twoclickmail::models::email::Email;
use twoclickmail::MONGO_URL;

#[tokio::main]
async fn main() {
    // Initialize the MongoDB client
    let client = mongodb::Client::with_options(
        mongodb::options::ClientOptions::parse(MONGO_URL)
            .await
            .unwrap(),
    )
    .unwrap();

    // Create a new database and collection
    let db = client.database("twoclickmail");
    let emails = db.collection::<Email>("emails");

    emails
        .aggregate(
            vec![
                doc! { "$match": {} }, // match all documents
                doc! { "$out": "emails_old" },
            ],
            None,
        )
        .await
        .unwrap();

    emails
        .update_many(
            doc! {},
            vec![doc! {
                "$set": {
                    "id": "$_id",
                    "vid": 0,
                    "anonymous": true,
                    "message": Bson::Null,
                    "active": true,
                    "deleted": false,
                    "created_at": Bson::Null,
                }
            }],
            None,
        )
        .await
        .unwrap();
}
