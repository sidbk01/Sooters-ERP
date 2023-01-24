use crate::{routes::error::RouteError, state::State, FramingOrder};
use mysql::{params, serde_json};
use rocket::response::content::RawJson;

const ORDER_QUERY: &'static str = "SELECT * FROM Framing_Orders WHERE ID = :id";

#[get("/framing?<id>")]
pub(crate) async fn framing(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    let order: FramingOrder = state
        .database()
        .execute_query_parameters(
            ORDER_QUERY,
            params! {
                "id" => id,
            },
        )
        .await?
        .pop()
        .ok_or(RouteError::InputError("Invalid order ID"))?;

    Ok(RawJson(serde_json::to_string(&order).unwrap()))
}
