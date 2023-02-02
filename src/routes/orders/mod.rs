use mysql::prelude::FromRow;
use rocket::{Build, Rocket};
use serde::Serialize;

use crate::util::take_from_row;

mod create;
mod many;

#[derive(Serialize)]
pub struct Order {
    id: usize,
    envelope_id: Option<usize>,
    current_location: usize,
    source_location: usize,
    receiver: usize,
    order_type: usize,
    customer: usize,
    date_received: String,
    date_due: String,
    date_complete: Option<String>,
    paid: bool,
    rush: bool,
    picked_up: bool,
    formatted_id: String,
}

pub(super) fn add_routes(server: Rocket<Build>) -> Rocket<Build> {
    server.mount(
        "/",
        routes![
            many::upcoming,
            many::customer_data,
            many::customer_view,
            create::view,
        ],
    )
}

impl FromRow for Order {
    fn from_row_opt(row: mysql::Row) -> Result<Self, mysql::FromRowError>
    where
        Self: Sized,
    {
        let (row, id) = take_from_row(row, "ID")?;
        let (row, envelope_id) = take_from_row(row, "EnvelopeID")?;
        let (row, current_location) = take_from_row(row, "CurrentLocation")?;
        let (row, source_location) = take_from_row(row, "SourceLocation")?;
        let (row, receiver) = take_from_row(row, "Receiver")?;
        let (row, order_type) = take_from_row(row, "OrderType")?;
        let (row, customer) = take_from_row(row, "Customer")?;
        let (row, date_received) = take_from_row(row, "DateReceived")?;
        let (row, date_due) = take_from_row(row, "DateDue")?;
        let (row, date_complete) = take_from_row(row, "DateComplete")?;
        let (row, paid) = take_from_row(row, "Paid")?;
        let (row, rush) = take_from_row(row, "Rush")?;
        let (row, picked_up) = take_from_row(row, "PickedUp")?;
        let (_, formatted_id) = take_from_row(row, "FormattedID")?;

        Ok(Order {
            id,
            envelope_id,
            current_location,
            source_location,
            receiver,
            order_type,
            customer,
            date_received,
            date_due,
            date_complete,
            paid,
            rush,
            picked_up,
            formatted_id,
        })
    }
}
