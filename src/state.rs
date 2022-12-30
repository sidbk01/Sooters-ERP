use crate::{
    config::{Config, ConfigError},
    database::{Database, DatabaseError},
};
use std::path::Path;
use tera::Tera;

pub enum StateCreationError {
    ConfigurationLoadError(ConfigError),
    DatabaseError(DatabaseError),
    TemplateError(tera::Error),
}

pub struct State {
    database: Database,
    templates: Tera,
}

impl State {
    // Creates a new state based on the configuration file
    pub async fn new<P: AsRef<Path>>(path: P) -> Result<Self, StateCreationError> {
        // Load the configuration
        let configuration = Config::load(path).await?;

        // Connect to the database
        let database = Database::connect(configuration.database_info())?;

        // Load the templates
        let templates = match Tera::new("templates/**/*.html") {
            Ok(templates) => templates,
            Err(error) => return Err(StateCreationError::TemplateError(error)),
        };

        // Create the state
        Ok(State {
            database,
            templates,
        })
    }

    pub fn database(&self) -> &Database {
        &self.database
    }

    pub fn templates(&self) -> &Tera {
        &self.templates
    }
}

//===========================
// || ERROR IMPLEMENTATIONS
//===========================

impl std::error::Error for StateCreationError {}

impl std::fmt::Debug for StateCreationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(self, f)
    }
}

impl std::fmt::Display for StateCreationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            StateCreationError::ConfigurationLoadError(error) => error.fmt(f),
            StateCreationError::DatabaseError(error) => error.fmt(f),
            StateCreationError::TemplateError(error) => {
                write!(f, "Unable to load templates - {}", error)
            }
        }
    }
}

impl From<ConfigError> for StateCreationError {
    fn from(error: ConfigError) -> Self {
        StateCreationError::ConfigurationLoadError(error)
    }
}

impl From<DatabaseError> for StateCreationError {
    fn from(error: DatabaseError) -> Self {
        StateCreationError::DatabaseError(error)
    }
}
