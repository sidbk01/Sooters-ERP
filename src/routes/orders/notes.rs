use crate::{
    routes::{format_date_time, RouteError},
    state::{Empty, State},
    util::take_from_row,
};
use mysql::{params, prelude::FromRow, serde_json};
use rocket::{response::content::RawJson, serde::json::Json};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct Note {
    creator: usize,
    date_time: String,
    note: String,
}

#[derive(Deserialize)]
pub struct NewNote {
    creator: usize,
    note: String,
}

#[get("/orders/<id>/notes")]
pub(crate) async fn data(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawJson<String>, RouteError> {
    // Perform the query
    let notes: Vec<Note> = state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Order_Notes WHERE OrderID = :id ORDER BY DateTime DESC",
            params! {
                "id" => id,
            },
        )
        .await?;

    Ok(RawJson(serde_json::to_string(&notes).unwrap()))
}

#[post("/orders/<id>/notes/create", data = "<info>")]
pub(super) async fn post_create(
    id: usize,
    info: Json<NewNote>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    if info.note.len() == 0 {
        return Err(RouteError::InputError("Note requires note text"));
    }

    // Perform query
    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            "INSERT INTO Order_Notes (OrderID, Creator, Note) VALUES (:order_id, :creator, :note)",
            params! {
                "order_id" => &id,
                "creator" => &info.creator,
                "note" => &info.note,
            },
        )
        .await?;

    Ok(String::new())
}

impl FromRow for Note {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, creator) = take_from_row(row, "Creator")?;
        let (row, date_time) = take_from_row(row, "DateTime")?;
        let (_, note) = take_from_row(row, "Note")?;

        Ok(Note {
            creator,
            date_time: format_date_time(date_time),
            note,
        })
    }
}
