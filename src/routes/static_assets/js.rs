use crate::{
    routes::error::RouteError,
    state::{FilePath, State},
};
use rocket::response::content::RawJavaScript;

#[get("/js/<filename..>")]
pub(crate) async fn js(
    filename: FilePath,
    state: &rocket::State<State>,
) -> Result<RawJavaScript<String>, RouteError> {
    match state.js().get(&filename.0) {
        Some(javascript) => Ok(RawJavaScript(javascript.to_owned())),
        None => Err(RouteError::JSError(filename.0)),
    }
}
