use crate::{routes::RouteError, state::State, util::take_from_row};
use mysql::{params, prelude::FromRow, serde_json, Params};
use rocket::response::content::RawJson;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Photoshoot {
    date_time: String,
    photoshoot_type: usize,
}

#[get("/orders/photoshoot?<id>")]
pub(super) async fn get(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let order: Photoshoot = match state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Photoshoots WHERE ID = :id",
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

impl Photoshoot {
    pub fn add_queries(&self, queries: &mut Vec<(&'static str, Params)>) {
        queries.push((
            "INSERT INTO Photoshoots (ID, DateTime, Type) VALUES (@order_id, :date_time, :type)",
            params! {
                "date_time" => &self.date_time,
                "photoshoot_type" => &self.photoshoot_type,
            },
        ))
    }
}

impl FromRow for Photoshoot {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, date_time) = take_from_row(row, "DateTime")?;
        let (_, photoshoot_type) = take_from_row(row, "Type")?;

        Ok(Self {
            date_time,
            photoshoot_type,
        })
    }
}
