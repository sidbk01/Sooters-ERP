use super::Customer;
use crate::{routes::RouteError, state::State, util::take_from_row};
use mysql::{prelude::FromRow, serde_json};
use rocket::response::content::{RawHtml, RawJson};
use serde::Serialize;
use tera::Context;

#[derive(Serialize)]
struct CustomerName {
    id: usize,
    name: String,
}

#[get("/customers")]
pub(super) async fn view(state: &rocket::State<State>) -> Result<RawHtml<String>, RouteError> {
    state.render("customers.html", Context::new())
}

#[get("/customers/data")]
pub(crate) async fn data(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    let customers: Vec<Customer> = state
        .database()
        .execute_query("SELECT * FROM Customers")
        .await?;

    Ok(RawJson(serde_json::to_string(&customers).unwrap()))
}

#[get("/customers/names")]
pub(crate) async fn names(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    let customers: Vec<CustomerName> = state
        .database()
        .execute_query("SELECT ID, Name FROM Customers")
        .await?;

    Ok(RawJson(serde_json::to_string(&customers).unwrap()))
}

impl FromRow for CustomerName {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, id) = take_from_row(row, "ID")?;
        let (_, name) = take_from_row(row, "Name")?;

        Ok(CustomerName { id, name })
    }
}
