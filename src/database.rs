use crate::{config::DatabaseInfo, Employee, Location};
use mysql::{
    prelude::{FromRow, Queryable},
    OptsBuilder, Pool,
};
use std::net::ToSocketAddrs;

pub enum DatabaseError {
    ConnectionError(mysql::Error),
    InvalidAddress,
    QueryError(mysql::Error),
    PoolError,
}

pub struct Database {
    connection: Pool,
}

impl Database {
    pub fn connect(info: &DatabaseInfo) -> Result<Self, DatabaseError> {
        // Connect to the database
        println!(
            "Connecting to {}@{}/{} . . .",
            info.username(),
            info.address(),
            info.name()
        );
        let connection = Pool::new(
            format!(
                "mysql://{}:{}@{}/{}",
                info.username(),
                info.password(),
                info.address(),
                info.name()
            )
            .as_str(),
        )
        .map_err(|error| DatabaseError::ConnectionError(error))?;

        Ok(Database { connection })
    }

    pub async fn locations(&self) -> Result<Vec<Location>, DatabaseError> {
        self.execute_query("SELECT * FROM Locations").await
    }

    pub async fn employees(&self) -> Result<Vec<Employee>, DatabaseError> {
        self.execute_query("SELECT * FROM Employees").await
    }

    async fn execute_query<Q: AsRef<str> + Send + 'static, T: FromRow + Send + 'static>(
        &self,
        query: Q,
    ) -> Result<Vec<T>, DatabaseError> {
        let pool = self.connection.clone();
        rocket::tokio::task::spawn_blocking(move || {
            pool.get_conn()
                .map_err(|_| DatabaseError::PoolError)?
                .query(query)
                .map_err(|error| DatabaseError::QueryError(error))
        })
        .await
        .unwrap()
    }
}

//===========================
// || ERROR IMPLEMENTATIONS
//===========================

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
            DatabaseError::InvalidAddress => write!(f, "Invalid address for database connection"),
            DatabaseError::QueryError(error) => write!(f, "Unable to perform query - {}", error),
            DatabaseError::PoolError => write!(f, "Unable to get connection from pool"),
        }
    }
}
