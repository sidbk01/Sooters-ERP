use super::Customer;
use crate::{routes::RouteError, state::State};
use mysql::{params, serde_json};
use rocket::response::content::{RawHtml, RawJson};
use tera::Context;

#[get("/customer?<id>")]
pub(super) async fn view(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("id", &id);

    state.render("customer.html", context)
}

#[get("/customer/data?<id>")]
pub(crate) async fn data(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let customer: Customer = match state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Customers WHERE ID = :id",
            params! {
                "id" => id,
            },
        )
        .await?
        .pop()
    {
        Some(employee) => employee,
        None => return Err(RouteError::InputError("Invalid customer ID")),
    };

    Ok(RawJson(serde_json::to_string(&customer).unwrap()))
}
