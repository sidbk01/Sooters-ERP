use crate::util::take_from_row;
use mysql::prelude::FromRow;
use rocket::{Build, Rocket};
use serde::Serialize;

mod all;
mod create;

#[derive(Serialize)]
pub struct Employee {
    id: usize,
    name: String,
    active: bool,
    primary_location: usize,
}

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount(
        "/",
        routes![
            create::get_create,
            create::post_create,
            all::view,
            all::data
        ],
    )
}

impl FromRow for Employee {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, id) = take_from_row(row, "ID")?;
        let (row, name) = take_from_row(row, "Name")?;
        let (row, active) = take_from_row(row, "Active")?;
        let (_, primary_location) = take_from_row(row, "PrimaryLocation")?;

        Ok(Employee {
            id,
            name,
            active,
            primary_location,
        })
    }
}
