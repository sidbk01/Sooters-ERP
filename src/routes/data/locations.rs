use crate::{routes::error::RouteError, state::State, Location};
use mysql::serde_json;
use rocket::response::content::RawJson;

const QUERY: &'static str = "SELECT * FROM Locations ORDER BY Name ASC";

#[get("/locations")]
pub(crate) async fn all(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    let locations: Vec<Location> = state.database().execute_query(QUERY).await?;

    Ok(RawJson(serde_json::to_string(&locations).unwrap()))
}
