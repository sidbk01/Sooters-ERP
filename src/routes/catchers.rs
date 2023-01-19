use rocket::Request;

use crate::state::State;

#[catch(500)]
pub fn internal_server_error(req: &Request) -> String {
    match req.rocket().state::<State>() {
        Some(state) => state.
    }

    format!("An internal server error has occurred")
}
