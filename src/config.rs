use json::Value;
use rocket::{
    futures::TryFutureExt,
    tokio::{fs::File, io::AsyncWriteExt, sync::Mutex},
};
use rustc_hash::FxHashMap;
use std::path::Path;

pub enum ConfigError {
    ReadError(std::io::Error),
    LogError(std::io::Error),
    ParseError(json::Error),
    MissingParameter(&'static str),
    InvalidParameter(&'static str),
}

pub struct DatabaseInfo {
    username: String,
    password: String,
    address: String,
    name: String,
}

pub struct Config {
    database_info: DatabaseInfo,
    error_log: Option<Mutex<File>>,
}

fn remove_value(
    object: &mut FxHashMap<String, Value>,
    field: &'static str,
) -> Result<Value, ConfigError> {
    object
        .remove(field)
        .ok_or(ConfigError::MissingParameter(field))
}

fn remove_string(
    object: &mut FxHashMap<String, Value>,
    field: &'static str,
) -> Result<String, ConfigError> {
    remove_value(object, field)?
        .to_string()
        .ok_or(ConfigError::InvalidParameter(field))
}

fn remove_object(
    object: &mut FxHashMap<String, Value>,
    field: &'static str,
) -> Result<FxHashMap<String, Value>, ConfigError> {
    remove_value(object, field)?
        .to_object()
        .ok_or(ConfigError::InvalidParameter(field))
}

impl Config {
    // Loads the configuration file from the path provided
    pub async fn load<P: AsRef<Path>>(path: P) -> Result<Self, ConfigError> {
        // Load and parse the file
        let file = rocket::tokio::fs::read(path).await?;
        let mut object = json::parse(file.into_iter())?
            .to_object()
            .ok_or(ConfigError::InvalidParameter("config root"))?;

        // Extract the database info
        let database = remove_object(&mut object, "database")?;
        let database_info = DatabaseInfo::parse(database)?;

        // Get the log file (if it exists)
        let error_log = match object.remove("error_log") {
            Some(value) => {
                let path = value
                    .to_string()
                    .ok_or(ConfigError::InvalidParameter("error_log"))?;
                Some(Mutex::new(
                    rocket::tokio::fs::OpenOptions::new()
                        .write(true)
                        .append(true)
                        .create(true)
                        .open(path)
                        .map_err(|error| ConfigError::LogError(error))
                        .await?,
                ))
            }
            None => None,
        };

        // Create the configuration
        Ok(Config {
            database_info,
            error_log,
        })
    }

    pub fn database_info(&self) -> &DatabaseInfo {
        &self.database_info
    }

    pub async fn log_error<E: std::error::Error>(&self, error: E) -> Result<(), ConfigError> {
        match &self.error_log {
            Some(log) => log
                .lock()
                .await
                .write_all(format!("{}", error).as_bytes())
                .await
                .map_err(|error| ConfigError::LogError(error)),
            None => Ok(()),
        }
    }
}

impl DatabaseInfo {
    pub(self) fn parse(mut object: FxHashMap<String, Value>) -> Result<Self, ConfigError> {
        let username = remove_string(&mut object, "username")?;
        let password = remove_string(&mut object, "password")?;
        let address = remove_string(&mut object, "address")?;
        let name = remove_string(&mut object, "name")?;

        Ok(DatabaseInfo {
            username,
            password,
            address,
            name,
        })
    }

    pub fn username(&self) -> &str {
        &self.username
    }

    pub fn password(&self) -> &str {
        &self.password
    }

    pub fn address(&self) -> &str {
        &self.address
    }

    pub fn name(&self) -> &str {
        &self.name
    }
}

//===========================
// || ERROR IMPLEMENTATIONS
//===========================

impl std::error::Error for ConfigError {}

impl std::fmt::Debug for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(self, f)
    }
}

impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConfigError::ReadError(error) => {
                write!(f, "Unable to read configuration file - {}", error)
            }
            ConfigError::ParseError(error) => {
                write!(f, "Unable to parse configuration file - {}", error)
            }
            ConfigError::MissingParameter(parameter) => {
                write!(f, "Configuration file is missing {}", parameter)
            }
            ConfigError::InvalidParameter(parameter) => write!(
                f,
                "Configuration file has an invalid type for {}",
                parameter
            ),
            ConfigError::LogError(error) => {
                write!(f, "Error while interacting with log file - {}", error)
            }
        }
    }
}

impl From<std::io::Error> for ConfigError {
    fn from(error: std::io::Error) -> Self {
        ConfigError::ReadError(error)
    }
}

impl From<json::Error> for ConfigError {
    fn from(error: json::Error) -> Self {
        ConfigError::ParseError(error)
    }
}
