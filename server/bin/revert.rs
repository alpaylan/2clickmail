use bson::doc;

use twoclickmail::{models::email::Email, MONGO_URL};

#[tokio::main]
async fn main() {
    // Initialize the MongoDB client
    let client = mongodb::Client::with_options(
        mongodb::options::ClientOptions::parse(MONGO_URL.as_str())
            .await
            .unwrap(),
    )
    .unwrap();

    // Create a new database and collection
    let db = client.database("twoclickmail");

    let emails_old = db.collection::<Email>("emails_old");
    emails_old
        .aggregate(
            vec![
                doc! { "$match": {} }, // match all documents
                doc! { "$out": "emails" },
            ],
            None,
        )
        .await
        .unwrap();
}
