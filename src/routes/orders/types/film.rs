use crate::{routes::RouteError, state::State, util::take_from_row};
use mysql::{params, prelude::FromRow, serde_json, Params};
use rocket::{
    response::content::{RawJson, RawText},
    serde::json::Json,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct NewFilmOrder {
    prints: usize,
    digital: bool,
    rolls: Vec<NewFilmRoll>,
}

#[derive(Deserialize, Serialize)]
pub struct FilmOrder {
    prints: usize,
    digital: bool,
}

#[derive(Deserialize)]
pub struct NewFilmRoll {
    amount: usize,
    exposures: usize,
    film_type: usize,
}

#[derive(Serialize)]
pub struct FilmRoll {
    id: usize,
    amount: usize,
    exposures: usize,
    film_type: usize,
}

#[derive(Deserialize)]
pub struct NewFilmScancode {
    tag: usize,
    scancode: String,
}

#[derive(Serialize)]
pub struct FilmScancode {
    id: usize,
    tag: usize,
    scancode: String,
}

#[get("/orders/film?<id>")]
pub(super) async fn get_film(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let order: FilmOrder = match state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Film_Orders WHERE ID = :id",
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

#[get("/orders/film_scancodes?<id>")]
pub(super) async fn get_scancodes(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let orders: Vec<FilmScancode> = state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Film_Scancodes WHERE OrderID = :id",
            params! {
                "id" => id,
            },
        )
        .await?;

    Ok(RawJson(serde_json::to_string(&orders).unwrap()))
}

#[get("/orders/film_rolls?<id>")]
pub(super) async fn get_rolls(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let orders: Vec<FilmRoll> = state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Film_Rolls WHERE OrderID = :id",
            params! {
                "id" => id,
            },
        )
        .await?;

    Ok(RawJson(serde_json::to_string(&orders).unwrap()))
}

#[post("/orders/film_scancodes?<id>", data = "<info>")]
pub(super) async fn new_scancodes(
    id: usize,
    info: Json<Vec<NewFilmScancode>>,
    state: &rocket::State<State>,
) -> Result<RawText<String>, RouteError> {
    // Perform the query
    let queries: Vec<_> = info
        .iter()
        .map(|new_scancode| new_scancode.generate_query(&id))
        .collect();

    state
        .database()
        .execute_transaction_id(queries, None)
        .await?;

    Ok(RawText(String::new()))
}

impl NewFilmOrder {
    pub fn add_queries(&self, queries: &mut Vec<(&'static str, Params)>) {
        queries.push((
            "INSERT INTO Film_Orders (ID, Prints, Digital) VALUES (@order_id, :prints, :digital)",
            params! {
                "prints" => &self.prints,
                "digital" => &self.digital,
            },
        ));

        for roll in &self.rolls {
            roll.add_queries(queries);
        }
    }

    pub fn validate(&self) -> Result<(), RouteError> {
        Ok(())
    }
}

impl FilmOrder {
    pub fn add_update_queries(&self, queries: &mut Vec<(&'static str, Params)>, id: usize) {
        queries.push((
            "UPDATE Film_Orders SET Prints = :prints, Digital = :digital WHERE ID = :id",
            params! {
                "id" => &id,
                "prints" => &self.prints,
                "digital" => &self.digital,
            },
        ))
    }

    pub fn validate(&self) -> Result<(), RouteError> {
        Ok(())
    }
}

impl FromRow for FilmOrder {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, prints) = take_from_row(row, "Prints")?;
        let (_, digital) = take_from_row(row, "Digital")?;

        Ok(Self { prints, digital })
    }
}

impl NewFilmRoll {
    pub fn add_queries(&self, queries: &mut Vec<(&'static str, Params)>) {
        queries.push((
            "INSERT INTO Film_Rolls (OrderID, Quantity, Exposures, Type) VALUES (@order_id, :quantity, :exposures, :type)",
            params! {
                "quantity" => &self.amount,
                "exposures" => &self.exposures,
                "type" => &self.film_type,
            }
        ))
    }
}

impl FromRow for FilmRoll {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, id) = take_from_row(row, "ID")?;
        let (row, amount) = take_from_row(row, "Quantity")?;
        let (row, exposures) = take_from_row(row, "Exposures")?;
        let (_, film_type) = take_from_row(row, "Type")?;

        Ok(Self {
            id,
            amount,
            exposures,
            film_type,
        })
    }
}

impl NewFilmScancode {
    pub fn generate_query(&self, order_id: &usize) -> (&'static str, Params) {
        (
            "INSERT INTO Film_Scancodes (OrderID, Tag, Scancode) VALUES (:order_id, :tag, :scancode)",
            params! {
                "order_id" => order_id,
                "tag" => &self.tag,
                "scancode" => &self.scancode,
            }
        )
    }
}

impl FromRow for FilmScancode {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, id) = take_from_row(row, "ID")?;
        let (row, tag) = take_from_row(row, "Tag")?;
        let (_, scancode) = take_from_row(row, "Scancode")?;

        Ok(Self { id, tag, scancode })
    }
}
