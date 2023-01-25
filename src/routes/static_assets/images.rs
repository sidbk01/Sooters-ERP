use crate::{routes::error::RouteError, state::State};
use rocket::http::ContentType;

#[get("/images/<filename>")]
pub(crate) async fn images(
    filename: String,
    state: &rocket::State<State>,
) -> Result<(ContentType, &[u8]), RouteError> {
    match state.images().get(&filename) {
        Some((image_type, image)) => Ok((image_type, image)),
        None => Err(RouteError::ImageError(filename)),
    }
}
