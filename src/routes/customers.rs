use crate::{routes::error::RouteError, state::State};
use rocket::response::content::RawHtml;
use tera::Context;

#[get("/customers")]
pub(super) async fn all(state: &rocket::State<State>) -> Result<RawHtml<String>, RouteError> {
    Ok(RawHtml(
        state
            .templates()
            .render("customers.html", &Context::new())?,
    ))
}

#[get("/customer?<id>")]
pub(super) async fn one(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("id", &id);

    Ok(RawHtml(
        state.templates().render("customer.html", &context)?,
    ))
}

#[get("/customers/create")]
pub(super) async fn create(state: &rocket::State<State>) -> Result<RawHtml<String>, RouteError> {
    Ok(RawHtml(
        state
            .templates()
            .render("create_customer.html", &Context::new())?,
    ))
}
