use mysql::prelude::FromRow;
use rocket::time::PrimitiveDateTime;
use serde::{ser::SerializeMap, Serialize};

pub struct Customer {
    id: usize,
    name: String,
    phone_number: Option<String>,
    email: Option<String>,
}

pub struct CustomerNote {
    id: usize,
    customer: usize,
    creator: usize,
    date_time: PrimitiveDateTime,
    note: String,
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

impl CustomerNote {
    pub fn id(&self) -> usize {
        self.id
    }

    pub fn customer(&self) -> usize {
        self.customer
    }

    pub fn creator(&self) -> usize {
        self.creator
    }

    pub fn date_time(&self) -> PrimitiveDateTime {
        self.date_time
    }
}

impl FromRow for CustomerNote {
    fn from_row_opt(mut row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let id = match row.take("ID") {
            Some(id) => id,
            None => return Err(mysql::FromRowError(row)),
        };
        let customer = match row.take("Customer") {
            Some(customer) => customer,
            None => return Err(mysql::FromRowError(row)),
        };
        let creator = match row.take("Creator") {
            Some(creator) => creator,
            None => return Err(mysql::FromRowError(row)),
        };
        let date_time = match row.take("DateTime") {
            Some(date_time) => date_time,
            None => return Err(mysql::FromRowError(row)),
        };
        let note = match row.take("Note") {
            Some(note) => note,
            None => return Err(mysql::FromRowError(row)),
        };

        Ok(CustomerNote {
            id,
            customer,
            creator,
            date_time,
            note,
        })
    }
}

impl Serialize for CustomerNote {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(5))?;

        map.serialize_entry("id", &self.id)?;
        map.serialize_entry("customer", &self.customer)?;
        map.serialize_entry("creator", &self.creator)?;
        map.serialize_entry(
            "date_time",
            &format!(
                "{} {}, {} at {}:{}",
                self.date_time.month(),
                self.date_time.day(),
                self.date_time.year(),
                self.date_time.hour(),
                self.date_time.minute()
            ),
        )?;
        map.serialize_entry("note", &self.note)?;
        map.end()
    }
}
