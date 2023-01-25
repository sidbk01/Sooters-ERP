use crate::{config::Config, routes::RouteError};
use caches::Caches;
use caches::DatabaseCache;
use database::Database;
use error::StateCreationError;
use rocket::{
    response::content::RawHtml,
    tokio::{fs::File, io::AsyncWriteExt, sync::Mutex},
};
use std::path::Path;
use tera::{Context, Tera};

mod caches;
mod database;
mod error;

pub use caches::{FileCache, FilePath, ImageCache};
pub use error::DatabaseError;

pub struct State {
    database: Database,
    templates: Tera,

    caches: Caches,

    error_log: Option<Mutex<File>>,
}

impl State {
    // Creates a new state based on the configuration file
    pub async fn new<P: AsRef<Path>>(path: P) -> Result<Self, StateCreationError> {
        // Load the configuration
        let configuration = Config::load(path).await?;

        // Connect to the database
        let mut database = Database::connect(configuration.database_info())?;

        // Load the templates
        let templates = match Tera::new("templates/**/*.html") {
            Ok(templates) => templates,
            Err(error) => return Err(StateCreationError::TemplateError(error)),
        };

        // Load the caches
        let caches = Caches::load(&mut database).await?;

        // Open the error log
        let error_log = match configuration.error_log() {
            Some(error_log_path) => Some(Mutex::new(
                rocket::tokio::fs::OpenOptions::new()
                    .write(true)
                    .append(true)
                    .create(true)
                    .open(error_log_path)
                    .await
                    .map_err(|error| StateCreationError::OpenErrorLogError(error))?,
            )),
            None => None,
        };

        // Create the state
        Ok(State {
            database,
            templates,
            caches,
            error_log,
        })
    }

    pub fn database(&self) -> &Database {
        &self.database
    }

    pub fn render(
        &self,
        path: &'static str,
        context: Context,
    ) -> Result<RawHtml<String>, RouteError> {
        Ok(RawHtml(self.templates.render(path, &context)?))
    }

    pub fn js(&self) -> &FileCache {
        self.caches.js()
    }

    pub fn css(&self) -> &FileCache {
        self.caches.css()
    }

    pub fn images(&self) -> &ImageCache {
        self.caches.images()
    }

    pub fn database_cache(&self) -> &DatabaseCache {
        self.caches.database_cache()
    }

    pub async fn log_error<E: std::error::Error>(&self, error: E) {
        match self.error_log.as_ref() {
            Some(file) => {
                let mut file = file.lock().await;
                file.write_all(error.to_string().as_bytes()).await.ok();
                file.flush().await.unwrap_or(())
            }
            None => {}
        }
    }
}
