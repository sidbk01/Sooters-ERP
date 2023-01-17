use crate::{
    cache::FileCache,
    config::{Config, ConfigError},
    database::{Database, DatabaseError},
    image_cache::ImageCache,
};
use std::path::Path;
use tera::Tera;

pub enum StateCreationError {
    ConfigurationLoadError(ConfigError),
    DatabaseError(DatabaseError),
    TemplateError(tera::Error),
    JSLoadError(std::io::Error),
    CSSLoadError(std::io::Error),
    ImageLoadError(std::io::Error),
}

pub struct State {
    database: Database,
    templates: Tera,

    js_cache: FileCache,
    css_cache: FileCache,
    image_cache: ImageCache,
}

const JS_BASE_PATH: &'static str = "./js/";
const CSS_BASE_PATH: &'static str = "./css/";
const IMAGE_BASE_PATH: &'static str = "./images/";

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

        // Load javascript
        let js_cache = FileCache::load(JS_BASE_PATH)
            .map_err(|error| StateCreationError::JSLoadError(error))?;

        // Load CSS
        let css_cache = FileCache::load(CSS_BASE_PATH)
            .map_err(|error| StateCreationError::CSSLoadError(error))?;

        // Load images
        let image_cache = ImageCache::load(IMAGE_BASE_PATH)
            .map_err(|error| StateCreationError::ImageLoadError(error))?;

        // Create the state
        Ok(State {
            database,
            templates,
            js_cache,
            css_cache,
            image_cache,
        })
    }

    pub fn database(&self) -> &Database {
        &self.database
    }

    pub fn templates(&self) -> &Tera {
        &self.templates
    }

    pub fn js(&self) -> &FileCache {
        &self.js_cache
    }

    pub fn css(&self) -> &FileCache {
        &self.css_cache
    }

    pub fn images(&self) -> &ImageCache {
        &self.image_cache
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
            StateCreationError::JSLoadError(error) => {
                write!(f, "Unable to load javascript - {}", error)
            }
            StateCreationError::CSSLoadError(error) => {
                write!(f, "Unable to load CSS - {}", error)
            }
            StateCreationError::ImageLoadError(error) => {
                write!(f, "Unable to load images - {}", error)
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
