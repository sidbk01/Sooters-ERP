use super::types::UpdatedOrderType;
use crate::{
    routes::RouteError,
    state::{Empty, State},
};
use mysql::params;
use rocket::serde::json::Json;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct UpdatedOrder {
    envelope_id: Option<usize>,
    date_due: String,
    rush: bool,
    current_location: usize,
    source_location: usize,
    receiver: usize,
    order_type: UpdatedOrderType,
}

#[post("/orders/update/<id>", data = "<info>")]
pub(crate) async fn update(
    id: usize,
    info: Json<UpdatedOrder>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    if info.date_due.len() == 0 {
        return Err(RouteError::InputError("A due date is required"));
    }
    info.order_type.validate()?;

    // Update database
    // Build query
    let mut queries = vec![(
        "UPDATE Orders SET EnvelopeID = :envelope_id, DateDue = :date_due, Rush = :rush, CurrentLocation = :current_location, SourceLocation = :source_location, Receiver = :receiver WHERE ID = :id",
        params! {
            "id" => &id,
            "envelope_id" => &info.envelope_id,
            "date_due" => &info.date_due,
            "rush" => &info.rush,
            "current_location" => &info.current_location,
            "source_location" => &info.source_location,
            "receiver" => &info.receiver,
        }
    )];
    info.order_type.add_update_queries(&mut queries, id);

    state.database().execute_transaction_id(queries).await?;

    Ok(String::new())
}

#[post("/order/completed?<id>")]
pub(crate) async fn completed(
    id: usize,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            "UPDATE Orders SET DateComplete = CURDATE() WHERE ID = :id",
            params! {
                "id" => id,
            },
        )
        .await?;

    Ok(String::new())
}

#[post("/order/picked_up?<id>")]
pub(crate) async fn picked_up(
    id: usize,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    state
        .database()
        .execute_query_parameters::<_, Empty, _>(
            "UPDATE Orders SET PickedUp = '1' WHERE ID = :id",
            params! {
                "id" => id,
            },
        )
        .await?;

    Ok(String::new())
}
