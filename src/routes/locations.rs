use crate::{routes::RouteError, state::State, util::take_from_row};
use mysql::{prelude::FromRow, serde_json};
use rocket::response::content::RawJson;
use serde::Serialize;

#[derive(Serialize)]
pub struct Location {
    id: usize,
    name: String,
    address: usize,
}

#[get("/locations")]
pub(crate) async fn get(state: &rocket::State<State>) -> Result<RawJson<String>, RouteError> {
    Ok(RawJson(
        serde_json::to_string(state.database_cache().locations()).unwrap(),
    ))
}

impl FromRow for Location {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, id) = take_from_row(row, "ID")?;
        let (row, name) = take_from_row(row, "Name")?;
        let (_, address) = take_from_row(row, "Address")?;

        Ok(Location { id, name, address })
    }
}
