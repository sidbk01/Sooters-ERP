use mysql::prelude::FromRow;
use serde::{ser::SerializeMap, Serialize};

pub struct Customer {
    id: usize,
    name: String,
    phone_number: Option<String>,
    email: Option<String>,
}

impl Customer {
    pub fn id(&self) -> usize {
        self.id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn phone_number(&self) -> Option<&str> {
        self.phone_number.as_ref().map(|str| str.as_str())
    }

    pub fn email(&self) -> Option<&str> {
        self.email.as_ref().map(|str| str.as_str())
    }
}

impl FromRow for Customer {
    fn from_row_opt(mut row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let id = match row.take("ID") {
            Some(id) => id,
            None => return Err(mysql::FromRowError(row)),
        };
        let name = match row.take("Name") {
            Some(name) => name,
            None => return Err(mysql::FromRowError(row)),
        };
        let phone_number = match row.take("PhoneNumber") {
            Some(phone_number) => phone_number,
            None => return Err(mysql::FromRowError(row)),
        };
        let email = match row.take("Email") {
            Some(email) => email,
            None => return Err(mysql::FromRowError(row)),
        };

        Ok(Customer {
            id,
            name,
            phone_number,
            email,
        })
    }
}

impl Serialize for Customer {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(5))?;

        map.serialize_entry("id", &self.id)?;
        map.serialize_entry("name", &self.name)?;
        self.phone_number
            .as_ref()
            .map(|phone_number| map.serialize_entry("phone_number", phone_number))
            .unwrap_or(Ok(()))?;
        self.email
            .as_ref()
            .map(|email| map.serialize_entry("email", email))
            .unwrap_or(Ok(()))?;

        map.end()
    }
}
