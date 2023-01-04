use crate::{routes::error::RouteError, state::State};
use rocket::response::content::RawHtml;
use tera::Context;

#[get("/customers")]
pub(super) async fn customers(state: &rocket::State<State>) -> Result<RawHtml<String>, RouteError> {
    Ok(RawHtml(
        state
            .templates()
            .render("customers.html", &Context::new())?,
    ))
}

#[get("/customer?<id>")]
pub(super) async fn customer(
    id: usize,
    state: &rocket::State<State>,
) -> Result<RawHtml<String>, RouteError> {
    let mut context = Context::new();
    context.insert("id", &id);

    Ok(RawHtml(
        state.templates().render("customer.html", &context)?,
    ))
}
