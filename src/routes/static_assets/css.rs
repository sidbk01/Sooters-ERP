use crate::{
    routes::error::RouteError,
    state::{FilePath, State},
};
use rocket::response::content::RawCss;

#[get("/css/<filename..>")]
pub(crate) async fn css(
    filename: FilePath,
    state: &rocket::State<State>,
) -> Result<RawCss<String>, RouteError> {
    match state.css().get(&filename.0) {
        Some(css) => Ok(RawCss(css.to_owned())),
        None => Err(RouteError::CSSError(filename.0)),
    }
}
