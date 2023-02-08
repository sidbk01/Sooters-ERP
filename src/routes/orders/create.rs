use super::types::NewOrderType;
use crate::{
    routes::{customers::CustomerName, RouteError},
    state::State,
};
use mysql::{params, Params};
use rocket::{response::content::RawHtml, serde::json::Json};
use serde::Deserialize;
use tera::Context;

#[derive(Deserialize)]
pub struct NewOrder {
    envelope_id: Option<usize>,
    due_date: String,
    rush: bool,
    employee: usize,
    location: usize,
    paid: bool,
    customer: usize,
    order_type: NewOrderType,
}

#[get("/orders/create?<customer>")]
pub(super) async fn view(
    customer: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let customer_info: CustomerName = state
        .database()
        .execute_query_parameters(
            "SELECT ID, FirstName, LastName FROM Customers WHERE ID = :id",
            params! {"id" => customer},
        )
        .await?
        .pop()
        .unwrap();

    let mut context = Context::new();
    context.insert("customer", &customer);
    context.insert("customer_name", customer_info.name());

    state.render("create_order.html", context)
}

#[post("/orders/create", data = "<info>")]
pub(super) async fn post_create(
    mut info: Json<NewOrder>,
    state: &rocket::State<State>,
) -> Result<String, RouteError> {
    validate_input(&mut info)?;

    // Build query
    let mut queries = vec![(
            "INSERT INTO Orders (EnvelopeID, CurrentLocation, SourceLocation, Receiver, OrderType, Customer, DateDue, Paid, Rush) VALUES (:envelope_id, :location, :location, :receiver, :order_type, :customer, :date_due, :paid, :rush)", 
            params! {
                "envelope_id" => &info.envelope_id,
                "location"=> &info.location,
                "receiver" => &info.employee,
                "customer" => &info.customer,
                "date_due" => &info.due_date,
                "paid" => &info.paid,
                "rush" => &info.rush,
                "order_type" => &info.order_type.as_usize(),
            }),
            ("SET @order_id = LAST_INSERT_ID()", Params::Empty)];
    info.order_type.add_queries(&mut queries);

    // Perform query
    let id = state.database().execute_transaction_id(queries).await?;

    Ok(format!("{}", id))
}

fn validate_input(order: &mut NewOrder) -> Result<(), RouteError> {
    if order.due_date.len() == 0 {
        return Err(RouteError::InputError("An order requires a due date"));
    }

    order.order_type.validate()
}
