use crate::{routes::error::RouteError, state::State};
use rocket::response::content::RawCss;

#[get("/css/<filename>")]
pub(crate) async fn css(
    filename: String,
    state: &rocket::State<State>,
) -> Result<RawCss<String>, RouteError> {
    match state.css().get(&filename) {
        Some(css) => Ok(RawCss(css.to_owned())),
        None => Err(RouteError::CSSError(filename)),
    }
}
