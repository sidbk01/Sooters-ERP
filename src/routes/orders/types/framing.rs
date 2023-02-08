use crate::{routes::RouteError, state::State, util::take_from_row};
use mysql::{params, prelude::FromRow, serde_json, Params};
use rocket::response::content::RawJson;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct FramingOrder {
    category: String,
    width: usize,
    height: usize,
}

#[get("/orders/framing?<id>")]
pub(super) async fn get(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let order: FramingOrder = match state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Framing_Orders WHERE ID = :id",
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

impl FramingOrder {
    pub fn add_queries(&self, queries: &mut Vec<(&'static str, Params)>) {
        queries.push((
            "INSERT INTO Framing_Orders (ID, Category, Width, Height) VALUES (@order_id, :category, :width, :height)",
            params! {
                "category" => &self.category,
                "width" => &self.width,
                "height" => &self.height,
            }
        ))
    }

    pub fn add_update_queries(&self, queries: &mut Vec<(&'static str, Params)>, id: usize) {
        queries.push((
            "UPDATE Framing_Orders SET Category = :category, Width = :width, Height = :height WHERE ID = :id",
            params! {
                "id" => &id,
                "category" => &self.category,
                "width" => &self.width,
                "height" => &self.height,
            },
        ))
    }

    pub fn validate(&self) -> Result<(), RouteError> {
        if self.category.len() == 0 {
            return Err(RouteError::InputError("A category is required"));
        }

        Ok(())
    }
}

impl FromRow for FramingOrder {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, category) = take_from_row(row, "Category")?;
        let (row, width) = take_from_row(row, "Width")?;
        let (_, height) = take_from_row(row, "Height")?;

        Ok(Self {
            category,
            width,
            height,
        })
    }
}
