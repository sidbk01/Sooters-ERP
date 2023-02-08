use crate::{
    routes::{format_date_time, RouteError},
    state::State,
    util::take_from_row,
};
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
            "INSERT INTO Photoshoots (ID, DateTime, Type) VALUES (@order_id, :date_time, :photoshoot_type)",
            params! {
                "date_time" => &self.date_time,
                "photoshoot_type" => &self.photoshoot_type,
            },
        ))
    }

    pub fn validate(&self) -> Result<(), RouteError> {
        if self.date_time.len() == 0 {
            return Err(RouteError::InputError(
                "A scheduled date & time is required",
            ));
        }

        Ok(())
    }

    pub fn add_update_queries(&self, queries: &mut Vec<(&'static str, Params)>, id: usize) {
        queries.push((
            "UPDATE Photoshoots SET DateTime = :date_time, Type = :photoshoot_type WHERE ID = :id",
            params! {
                "id" => &id,
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
            date_time: format_date_time(date_time),
            photoshoot_type,
        })
    }
}
