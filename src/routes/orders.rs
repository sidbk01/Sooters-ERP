use crate::{routes::error::RouteError, state::State, Customer};
use mysql::params;
use rocket::response::content::RawHtml;
use tera::Context;

#[get("/orders?<id>")]
pub(super) async fn all(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let customer: Customer = state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Customers WHERE ID = :id",
            params! {"id" => id},
        )
        .await?
        .pop()
        .unwrap();

    let mut context = Context::new();
    context.insert("id", &id);
    context.insert("customer_name", customer.name());

    Ok(RawHtml(
        state.templates().render("customer_orders.html", &context)?,
    ))
}

#[get("/orders/create?<customer>")]
pub(super) async fn create(
    customer: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let customer_info: Customer = state
        .database()
        .execute_query_parameters(
            "SELECT * FROM Customers WHERE ID = :id",
            params! {"id" => customer},
        )
        .await?
        .pop()
        .unwrap();

    let mut context = Context::new();
    context.insert("customer", &customer);
    context.insert("customer_name", customer_info.name());

    Ok(RawHtml(
        state.templates().render("create_order.html", &context)?,
    ))
}
