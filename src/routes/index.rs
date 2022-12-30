use crate::{routes::error::RouteError, state::State};
use rocket::response::content::RawHtml;
use tera::Context;

#[get("/")]
pub(super) fn index(state: &rocket::State<State>) -> Result<RawHtml<String>, RouteError> {
    Ok(RawHtml(
        state.templates().render("index.html", &Context::new())?,
    ))
}
