use super::Order;
use crate::{routes::RouteError, state::State};
use mysql::{params, serde_json};
use rocket::response::content::{RawHtml, RawJson};
use tera::Context;

#[get("/order?<id>&<back>")]
pub(super) async fn view(
    id: usize,
    back: String,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("id", &id);
    context.insert("back", &back);

    state.render("order.html", context)
}

#[get("/order/data?<id>")]
pub(crate) async fn data(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let order: Order = match state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Orders WHERE ID = :id",
            params! {
                "id" => id,
            },
        )
        .await?
        .pop()
    {
        Some(order) => order,
        None => return Err(RouteError::InputError("Invalid order ID")),
    };

    Ok(RawJson(serde_json::to_string(&order).unwrap()))
}
