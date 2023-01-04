use crate::{routes::error::RouteError, state::State};
use rocket::response::content::RawJavaScript;

#[get("/js/<filename>")]
pub(crate) async fn js(
    filename: String,
    state: &rocket::State<State>,
) -> Result<RawJavaScript<String>, RouteError> {
    match state.js().get(&filename) {
        Some(javascript) => Ok(RawJavaScript(javascript.to_owned())),
        None => Err(RouteError::JSError(filename)),
    }
}
