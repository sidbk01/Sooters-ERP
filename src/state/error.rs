use crate::config::ConfigError;

pub enum StateCreationError {
    ConfigurationLoadError(ConfigError),
    DatabaseError(DatabaseError),
    TemplateError(tera::Error),
    JSLoadError(std::io::Error),
    CSSLoadError(std::io::Error),
    ImageLoadError(std::io::Error),
    OpenErrorLogError(std::io::Error),
}

pub enum DatabaseError {
    ConnectionError(mysql::Error),
    QueryError(mysql::Error),
    PoolError,
}

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
            StateCreationError::OpenErrorLogError(error) => {
                write!(f, "Unable to open error log - {}", error)
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

impl std::error::Error for DatabaseError {}

impl std::fmt::Debug for DatabaseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(self, f)
    }
}

impl std::fmt::Display for DatabaseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DatabaseError::ConnectionError(error) => {
                write!(f, "Unable to connect to the database - {}", error)
            }
            DatabaseError::QueryError(error) => write!(f, "Unable to perform query - {}", error),
            DatabaseError::PoolError => write!(f, "Unable to get connection from pool"),
        }
    }
}
