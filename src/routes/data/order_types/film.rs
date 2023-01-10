use crate::{routes::error::RouteError, state::State, FilmOrder};
use mysql::{params, serde_json};
use rocket::response::content::RawJson;

const ORDER_QUERY: &'static str = "SELECT * FROM Film_Orders WHERE ID = :id";

#[get("/film?<id>")]
pub(crate) async fn film(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    let order: FilmOrder = state
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
