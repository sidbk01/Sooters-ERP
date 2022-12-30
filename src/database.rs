use std::net::ToSocketAddrs;

use mysql::{Conn, OptsBuilder};

use crate::config::DatabaseInfo;

pub enum DatabaseError {
    ConnectionError,
    InvalidAddress,
}

pub struct Database {
    connection: Conn,
}

impl Database {
    pub fn connect(info: &DatabaseInfo) -> Result<Self, DatabaseError> {
        // Parse the address
        let address = info
            .address()
            .to_socket_addrs()
            .map_err(|_| DatabaseError::InvalidAddress)?
            .next()
            .ok_or(DatabaseError::InvalidAddress)?;

        println!(
            "Connecting to {}@{}/{} . . .",
            info.username(),
            address,
            info.name()
        );

        // Create the connection options
        let opts = OptsBuilder::new()
            .user(Some(info.username()))
            .pass(Some(info.password()))
            .bind_address(Some(address))
            .db_name(Some(info.name()));

        // Connect to the database
        let connection = Conn::new(opts).map_err(|_| DatabaseError::ConnectionError)?;

        Ok(Database { connection })
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
            DatabaseError::ConnectionError => {
                write!(f, "Unable to connect to the database")
            }
            DatabaseError::InvalidAddress => write!(f, "Invalid address for database connection"),
        }
    }
}
