use crate::{routes::error::RouteError, state::State};
use rocket::response::content::RawHtml;
use tera::Context;

#[get("/")]
pub(super) fn get(state: &rocket::State<State>) -> Result<RawHtml<String>, RouteError> {
    state.render("index.html", Context::new())
}
