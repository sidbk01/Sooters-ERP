use crate::util::take_from_row;
use mysql::prelude::FromRow;
use rocket::{Build, Rocket};
use serde::Serialize;

mod all;

#[derive(Serialize)]
pub struct Customer {
    id: usize,
    name: String,
    phone_number: String,
    email: String,
}

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount("/", routes![all::view, all::data,])
}

impl FromRow for Customer {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, id) = take_from_row(row, "ID")?;
        let (row, name) = take_from_row(row, "Name")?;
        let (row, phone_number) = take_from_row(row, "PhoneNumber")?;
        let (_, email) = take_from_row(row, "Email")?;

        Ok(Customer {
            id,
            name,
            phone_number,
            email,
        })
    }
}
