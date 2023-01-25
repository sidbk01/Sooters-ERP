use crate::state::{database::Database, error::StateCreationError};
use rocket::Data;

pub struct DatabaseCache {
    locations: Vec<String>,
}

impl DatabaseCache {
    pub async fn load(database: &mut Database) -> Result<Self, StateCreationError> {
        let locations = database.execute_query("SELECT * FROM Locations").await?;

        Ok(DatabaseCache { locations })
    }
}
