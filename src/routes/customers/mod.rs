use crate::util::take_from_row;
use mysql::prelude::FromRow;
use rocket::{Build, Rocket};
use serde::Serialize;

mod all;
mod create;
mod one;

#[derive(Serialize)]
pub struct Customer {
    id: usize,
    name: String,
    phone_number: Option<String>,
    email: Option<String>,
}

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount(
        "/",
        routes![
            all::view,
            all::data,
            all::names,
            one::view,
            one::data,
            create::get_create,
            create::post_create
        ],
    )
}

impl FromRow for Customer {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, id) = take_from_row(row, "ID")?;
        let (row, first_name) = take_from_row::<String>(row, "FirstName")?;
        let (row, last_name) = take_from_row::<String>(row, "LastName")?;
        let (row, phone_number) = take_from_row(row, "PhoneNumber")?;
        let (_, email) = take_from_row(row, "Email")?;

        Ok(Customer {
            id,
            name: format!("{} {}", first_name, last_name),
            phone_number,
            email,
        })
    }
}
