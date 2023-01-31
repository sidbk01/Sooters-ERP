use super::Customer;
use crate::{routes::RouteError, state::State};
use mysql::serde_json;
use rocket::response::content::{RawHtml, RawJson};
use tera::Context;

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
