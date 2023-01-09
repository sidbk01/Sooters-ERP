use crate::{routes::error::RouteError, state::State};
use rocket::response::content::RawHtml;
use tera::Context;

#[get("/orders?<id>")]
pub(super) async fn all(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("id", &id);

    Ok(RawHtml(
        state.templates().render("customer_orders.html", &context)?,
    ))
}

#[get("/orders/create?<customer>")]
pub(super) async fn create(
    customer: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("customer", &customer);

    Ok(RawHtml(
        state.templates().render("create_order.html", &context)?,
    ))
}
