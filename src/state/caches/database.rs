use crate::{
    routes::Location,
    state::{database::Database, error::StateCreationError},
};

pub struct DatabaseCache {
    locations: Vec<Location>,
}

impl DatabaseCache {
    pub async fn load(database: &mut Database) -> Result<Self, StateCreationError> {
        let locations = database.execute_query("SELECT * FROM Locations").await?;

        Ok(DatabaseCache { locations })
    }

    pub fn locations(&self) -> &[Location] {
        &self.locations
    }
}
